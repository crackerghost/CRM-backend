const cron = require('node-cron');
const { google } = require("googleapis");
const { DataTypes, Op } = require("sequelize");

// Configuration
const CONFIG = {
  CRON_SCHEDULE: '*/30 * * * * *', // Every 30 seconds (adjust as needed)
  EMAIL_SEARCH: {
    keywords: ['conversation id',],
    businessKeywords: ['conversation id'],
    maxResults: 50,
    daysBack: 7,
    batchSize: 3,
    delayBetweenBatches: 5000 // 5 seconds
  },
  RETRY: {
    maxAttempts: 3,
    delay: 2000
  }
};

// Global dependencies
let gmailToken, Erp_Conversations, sequelize, CronJobLog;
let findRecords, updateRecords, createBulkRecord, findUniqueRecord, createRecord;
let getEmailsByKeywords, getUnreadEmails, readEmails;

/**
 * Initialize all required dependencies
 */
async function initializeDependencies() {
  try {
    console.log('🔄 Loading dependencies...');
    
    // Load models
    gmailToken = require('../models/gmail');
    Erp_Conversations = require('../models/erp_conversations');
    const { sequelize: seq } = require("../config/connection");
    sequelize = seq;
    
    // Load utilities
    const utils = require('../utils/Sequalize');
    findRecords = utils.findRecords;
    updateRecords = utils.updateRecords;
    createBulkRecord = utils.createBulkRecord;
    findUniqueRecord = utils.findUniqueRecord;
    createRecord = utils.createRecord;
    
    // Load SMTP functions
    const smtpFunctions = require('./smtp');
    getEmailsByKeywords = smtpFunctions.getEmailsByKeywords;
    getUnreadEmails = smtpFunctions.getUnreadEmails;
    readEmails = smtpFunctions.readEmails;
    
    console.log('✅ Dependencies loaded successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to load dependencies:', error);
    throw error;
  }
}

/**
 * Create CronJobLog model
 */
function createCronJobLogModel() {
  return sequelize.define("erp_cron_job_logs", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    job_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    users_processed: DataTypes.INTEGER,
    successful_users: DataTypes.INTEGER,
    failed_users: DataTypes.INTEGER,
    emails_found: DataTypes.INTEGER,
    emails_saved: DataTypes.INTEGER,
    emails_skipped: DataTypes.INTEGER,
    error_message: DataTypes.TEXT
  }, {
    timestamps: true,
    createdAt: "executed_at",
    updatedAt: false,
  });
}

/**
 * Extract parent ID from email content
 * Returns null if no valid parent ID is found
 */
function extractParentIdFromEmail(email) {
  const content = `${email.subject || ''} ${email.body || ''} ${email.snippet || ''}`.toLowerCase();
  
  // Multiple patterns to match parent ID
  const patterns = [
    /conversation\s*id\s*[:=]?\s*(\d+)/i,
    /parent\s*id\s*[:=]?\s*(\d+)/i,
    /conversation\s*[:=]?\s*(\d+)/i,
    /thread\s*id\s*[:=]?\s*(\d+)/i
  ];
  
  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      const parentId = parseInt(match[1]);
      console.log(`✅ Found parent ID ${parentId} in email: "${email.subject}"`);
      return parentId;
    }
  }
  
  // Return null if no parent ID found - email will be skipped
  console.log(`❌ No parent ID found in email: "${email.subject}" - SKIPPING`);
  return null;
}

/**
 * Check if email already exists in conversations
 */
async function checkEmailExists(gmailId, userEmail) {
  try {
    const existing = await findUniqueRecord(Erp_Conversations, {
      where: { 
        receiver_email: userEmail,
        // Check for Gmail ID in metadata (if you want to track it separately)
        sender_details: { [Op.like]: `%${gmailId}%` }
      }
    });
    
    return !!existing;
  } catch (error) {
    console.error('Error checking email existence:', error);
    return false;
  }
}

/**
 * Verify if parent ID exists in conversations table
 */
async function verifyParentIdExists(parentId, userId) {
  try {
    const parentExists = await findUniqueRecord(Erp_Conversations, {
      where: { 
        id: parentId,
        user_id: userId
      }
    });
    
    return !!parentExists;
  } catch (error) {
    console.error('Error verifying parent ID:', error);
    return false;
  }
}

/**
 * Generate unique conversation ID
 */
function generateConversationId(email) {
  if (email.threadId) {
    const numbers = email.threadId.replace(/\D/g, '');
    return numbers ? parseInt(numbers.slice(-9)) || Math.floor(Math.random() * 1000000000) : Math.floor(Math.random() * 1000000000);
  }
  return Math.floor(Math.random() * 1000000000);
}

/**
 * Clean email body and extract only content
 */
function cleanEmailBody(email) {
  let content = '';
  
  if (email.body) {
    // Remove HTML tags and get clean text
    content = email.body.replace(/<[^>]*>/g, '').trim();
  } else if (email.snippet) {
    content = email.snippet.trim();
  }
  
  // Remove extra whitespace and newlines
  content = content.replace(/\s+/g, ' ').trim();
  
  // Limit content length (adjust as needed)
  if (content.length > 10000) {
    content = content.substring(0, 10000) + '...';
  }
  
  return content || 'No content available';
}

/**
 * Save emails to conversations table - ONLY with valid parent IDs
 */
async function saveEmailsToConversations(userId, userEmail, emails, searchKeywords) {
  try {
    const conversationsToInsert = [];
    let savedCount = 0;
    let skippedCount = 0;
    let noParentIdCount = 0;

    console.log(`📋 Processing ${emails.length} emails for user: ${userEmail}`);

    for (const email of emails) {
      try {
        // Extract parent ID from email content
        const parentId = extractParentIdFromEmail(email);

        // Skip if no parent ID found
        if (parentId === null) {
          noParentIdCount++;
          continue;
        }

        // Verify parent ID exists in database
        const parentExists = await verifyParentIdExists(parentId, userId);
        if (!parentExists) {
          console.log(`⚠️ Parent ID ${parentId} does not exist in database for user ${userId} - SKIPPING`);
          skippedCount++;
          continue;
        }

        // Check if email already exists
        const emailExists = await checkEmailExists(email.id, userEmail);
        if (emailExists) {
          skippedCount++;
          continue;
        }

        // Generate conversation ID
        const conversationId = generateConversationId(email);

        // Clean email body - ONLY the content, no metadata
        const emailMessage = cleanEmailBody(email);

        // Store Gmail ID in sender_details for tracking (optional)
        const senderDetails = `${email.from || 'Unknown Sender'} [Gmail-ID: ${email.id}]`;

        // Prepare conversation record
        const conversationRecord = {
          parent_id: parentId, // Valid parent ID
          user_id: userId,
          conversation_id: conversationId,
          message: emailMessage, // Only email body content
          subject: email.subject || 'No Subject',
          sender_details: senderDetails,
          receiver_email: userEmail,
          module_name: 'GMAIL_INBOX_FETCH',
          created_at: new Date(),
          updated_at: new Date()
        };

        conversationsToInsert.push(conversationRecord);

        console.log(`✅ Email queued for saving - Parent ID: ${parentId}, Subject: "${email.subject}"`);

      } catch (emailError) {
        console.error(`❌ Error processing individual email ${email.id}:`, emailError);
        skippedCount++;
        continue;
      }
    }

    // Bulk insert conversations
    if (conversationsToInsert.length > 0) {
      try {
        await createBulkRecord(Erp_Conversations, conversationsToInsert);
        savedCount = conversationsToInsert.length;
        console.log(`💾 Successfully saved ${savedCount} new emails to conversations for user: ${userEmail}`);
        
        // Log parent ID distribution
        const parentIdCounts = {};
        conversationsToInsert.forEach(conv => {
          parentIdCounts[conv.parent_id] = (parentIdCounts[conv.parent_id] || 0) + 1;
        });
        console.log(`📊 Parent ID distribution:`, parentIdCounts);
        
      } catch (insertError) {
        console.error(`❌ Failed to bulk insert conversations:`, insertError);
        
        // Fallback: Insert one by one
        console.log(`🔄 Attempting individual inserts...`);
        savedCount = 0;
        for (const conversation of conversationsToInsert) {
          try {
            await createRecord(Erp_Conversations, conversation);
            savedCount++;
          } catch (singleInsertError) {
            console.error(`❌ Failed to insert single conversation:`, singleInsertError);
            skippedCount++;
          }
        }
      }
    } else {
      console.log(`⚠️ No emails qualified for saving for user: ${userEmail}`);
    }

    console.log(`📊 Summary for ${userEmail}:`);
    console.log(`   💾 Saved: ${savedCount}`);
    console.log(`   ⏭️ Skipped (no parent ID): ${noParentIdCount}`);
    console.log(`   ⏭️ Skipped (other reasons): ${skippedCount}`);
    
    return {
      saved: savedCount,
      skippedNoParentId: noParentIdCount,
      skippedOther: skippedCount
    };

  } catch (error) {
    console.error(`❌ Error saving emails to conversations for user ${userEmail}:`, error);
    throw error;
  }
}

/**
 * Refresh OAuth access token
 */
async function refreshAccessToken(refreshToken) {
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({ refresh_token: refreshToken });
    const { token } = await oauth2Client.getAccessToken();
    return token;
  } catch (error) {
    console.error('Error refreshing access token:', error);
    throw error;
  }
}

/**
 * Fetch emails for a user with comprehensive search
 */
async function fetchUserEmails(user) {
  const { refresh_token, gmail } = user;
  const allEmails = [];

  try {
    // 1. Search by main keywords
    console.log(`🔍 Searching by main keywords...`);
    const keywordEmails = await getEmailsByKeywords(
      refresh_token, 
      gmail, 
      CONFIG.EMAIL_SEARCH.keywords, 
      CONFIG.EMAIL_SEARCH.maxResults
    );
    allEmails.push(...keywordEmails);

    // 2. Search for business-related emails
    console.log(`💼 Searching for business emails...`);
    const businessEmails = await getEmailsByKeywords(
      refresh_token,
      gmail,
      CONFIG.EMAIL_SEARCH.businessKeywords,
      25
    );
    allEmails.push(...businessEmails);

    // 3. Get unread emails
    console.log(`📬 Fetching unread emails...`);
    const unreadEmails = await getUnreadEmails(refresh_token, gmail, 30);
    allEmails.push(...unreadEmails);

    // 4. Get recent important emails
    const afterDate = new Date();
    afterDate.setDate(afterDate.getDate() - CONFIG.EMAIL_SEARCH.daysBack);
    const formattedAfterDate = afterDate.toISOString().split('T')[0].replace(/-/g, '/');

    console.log(`📅 Searching recent important emails...`);
    const recentImportantEmails = await readEmails(refresh_token, gmail, {
      isImportant: true,
      after: formattedAfterDate,
      maxResults: 20
    });
    allEmails.push(...recentImportantEmails);

    // Deduplicate by email ID
    const uniqueEmails = allEmails.filter((email, index, self) => 
      index === self.findIndex(e => e.id === email.id)
    );

    console.log(`📊 Found ${uniqueEmails.length} unique emails for user: ${gmail}`);
    return uniqueEmails;

  } catch (error) {
    console.error(`❌ Error fetching emails for user ${gmail}:`, error);
    throw error;
  }
}

/**
 * Process emails for a single user
 */
async function processUserEmails(user) {
  const { id, gmail, refresh_token } = user;
  
  try {
    console.log(`🔄 Processing emails for user: ${gmail} (ID: ${id})`);

    // Fetch emails
    const uniqueEmails = await fetchUserEmails(user);

    let saveResults = { saved: 0, skippedNoParentId: 0, skippedOther: 0 };
    
    if (uniqueEmails.length > 0) {
      // Save to conversations table - only emails with valid parent IDs
      saveResults = await saveEmailsToConversations(
        id, 
        gmail, 
        uniqueEmails, 
        [...CONFIG.EMAIL_SEARCH.keywords, ...CONFIG.EMAIL_SEARCH.businessKeywords]
      );

      // Log important emails summary
      const importantEmails = uniqueEmails.filter(email => 
        email.isImportant || email.isUnread
      );

      if (importantEmails.length > 0) {
        console.log(`🚨 Found ${importantEmails.length} important/unread emails for ${gmail}`);
      }
    }

    return {
      userId: id,
      userEmail: gmail,
      emailsFound: uniqueEmails.length,
      emailsSaved: saveResults.saved,
      emailsSkippedNoParentId: saveResults.skippedNoParentId,
      emailsSkippedOther: saveResults.skippedOther,
      importantEmailsFound: uniqueEmails.filter(e => e.isImportant || e.isUnread).length,
      success: true
    };

  } catch (error) {
    console.error(`❌ Error processing emails for user ${gmail}:`, error.message);
    
    // Handle OAuth token errors
    if (error.message.includes('invalid_grant') || error.message.includes('token expired')) {
      console.log(`🔄 Attempting to refresh token for user: ${gmail}`);
      try {
        const newAccessToken = await refreshAccessToken(refresh_token);
        await updateRecords(
          gmailToken,
          { access_token: newAccessToken },
          { where: { id } }
        );
        console.log(`✅ Token refreshed for user: ${gmail}`);
      } catch (refreshError) {
        console.error(`❌ Failed to refresh token for user ${gmail}:`, refreshError.message);
      }
    }

    return {
      userId: id,
      userEmail: gmail,
      success: false,
      error: error.message,
      emailsFound: 0,
      emailsSaved: 0,
      emailsSkippedNoParentId: 0,
      emailsSkippedOther: 0
    };
  }
}

/**
 * Main cron job execution
 */
async function runCronJob() {
  const startTime = Date.now();
  console.log('\n🚀 Starting Gmail inbox fetch cron job...');
  console.log(`⏰ Started at: ${new Date().toISOString()}`);

  try {
    // Get Gmail users
    const gmailUsers = await findRecords(gmailToken, {
      where: {
        refresh_token: { [Op.ne]: null },
        gmail: { [Op.ne]: null }
      },
      attributes: ['id', 'gmail', 'refresh_token'],
      limit: 50
    });

    console.log(`👥 Found ${gmailUsers.length} Gmail users to process`);

    if (gmailUsers.length === 0) {
      await createRecord(CronJobLog, {
        job_name: 'gmail_inbox_fetch',
        users_processed: 0,
        successful_users: 0,
        failed_users: 0,
        emails_found: 0,
        emails_saved: 0,
        emails_skipped: 0
      });
      return;
    }

    // Process users in batches
    const results = [];
    const batchSize = CONFIG.EMAIL_SEARCH.batchSize;
    
    for (let i = 0; i < gmailUsers.length; i += batchSize) {
      const batch = gmailUsers.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(gmailUsers.length / batchSize);
      
      console.log(`🔄 Processing batch ${batchNumber}/${totalBatches} (${batch.length} users)`);

      // Process batch
      const batchPromises = batch.map(user => processUserEmails(user));
      const batchResults = await Promise.allSettled(batchPromises);

      // Collect results
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          console.error(`❌ Failed processing user: ${batch[index].gmail}`, result.reason?.message);
          results.push({
            userId: batch[index].id,
            userEmail: batch[index].gmail,
            success: false,
            error: result.reason?.message || 'Unknown error',
            emailsFound: 0,
            emailsSaved: 0,
            emailsSkippedNoParentId: 0,
            emailsSkippedOther: 0
          });
        }
      });

      // Wait between batches
      if (i + batchSize < gmailUsers.length) {
        console.log(`⏳ Waiting ${CONFIG.EMAIL_SEARCH.delayBetweenBatches/1000}s before next batch...`);
        await new Promise(resolve => setTimeout(resolve, CONFIG.EMAIL_SEARCH.delayBetweenBatches));
      }
    }

    // Generate summary
    const successfulUsers = results.filter(r => r.success);
    const failedUsers = results.filter(r => !r.success);
    const totalEmailsFound = results.reduce((sum, r) => sum + (r.emailsFound || 0), 0);
    const totalEmailsSaved = results.reduce((sum, r) => sum + (r.emailsSaved || 0), 0);
    const totalEmailsSkippedNoParentId = results.reduce((sum, r) => sum + (r.emailsSkippedNoParentId || 0), 0);
    const totalEmailsSkippedOther = results.reduce((sum, r) => sum + (r.emailsSkippedOther || 0), 0);
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n📊 === CRON JOB SUMMARY ===');
    console.log(`✅ Successful users: ${successfulUsers.length}/${gmailUsers.length}`);
    console.log(`❌ Failed users: ${failedUsers.length}`);
    console.log(`📧 Total emails found: ${totalEmailsFound}`);
    console.log(`💾 Total emails saved: ${totalEmailsSaved}`);
    console.log(`⏭️ Emails skipped (no parent ID): ${totalEmailsSkippedNoParentId}`);
    console.log(`⏭️ Emails skipped (other): ${totalEmailsSkippedOther}`);
    console.log(`⏰ Duration: ${duration}s`);

    // Show failed users if any
    if (failedUsers.length > 0 && failedUsers.length <= 5) {
      console.log('\n❌ Failed users:');
      failedUsers.forEach(user => {
        console.log(`   📧 ${user.userEmail}: ${user.error}`);
      });
    }

    // Log to database
    await createRecord(CronJobLog, {
      job_name: 'gmail_inbox_fetch',
      users_processed: gmailUsers.length,
      successful_users: successfulUsers.length,
      failed_users: failedUsers.length,
      emails_found: totalEmailsFound,
      emails_saved: totalEmailsSaved,
      emails_skipped: totalEmailsSkippedNoParentId + totalEmailsSkippedOther,
      error_message: failedUsers.length > 0 ? `${failedUsers.length} users failed` : null
    });

  } catch (error) {
    console.error('💥 Critical error in Gmail cron job:', error);
    
    await createRecord(CronJobLog, {
      job_name: 'gmail_inbox_fetch',
      users_processed: 0,
      successful_users: 0,
      failed_users: 0,
      emails_found: 0,
      emails_saved: 0,
      emails_skipped: 0,
      error_message: `Critical error: ${error.message}`
    });
  }
}

/**
 * Initialize and start the cron job
 */
async function initializeAndStartCron() {
  try {
    console.log('📁 Initializing Gmail cron job...');
    
    // Initialize dependencies
    await initializeDependencies();
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Create and sync CronJobLog model
    CronJobLog = createCronJobLogModel();
    await CronJobLog.sync({ alter: true });
    console.log('✅ CronJobLog table synchronized');
    
    // Test Gmail users availability
    const testUsers = await findRecords(gmailToken, {
      where: {
        refresh_token: { [Op.ne]: null },
        gmail: { [Op.ne]: null }
      },
      limit: 1
    });
    
    console.log(`📊 ${testUsers.length > 0 ? 'Gmail users available' : 'No Gmail users found'}`);
    
    // Schedule cron job
    const cronTask = cron.schedule(CONFIG.CRON_SCHEDULE, async () => {
      console.log('🎯 CRON JOB TRIGGERED!', new Date().toISOString());
      await runCronJob();
    }, {
      scheduled: true,
      timezone: "UTC"
    });
    
    console.log('✅ Gmail cron job initialized successfully');
    console.log(`📅 Schedule: ${CONFIG.CRON_SCHEDULE}`);
    console.log(`🔍 Keywords: ${CONFIG.EMAIL_SEARCH.keywords.join(', ')}`);
    console.log(`🏃‍♂️ Batch size: ${CONFIG.EMAIL_SEARCH.batchSize} users`);
    console.log(`⚠️ ONLY emails with valid parent IDs will be saved`);
    
    return cronTask;
    
  } catch (error) {
    console.error('💥 Failed to initialize Gmail cron job:', error);
    throw error;
  }
}

// Graceful shutdown handlers
process.on('SIGINT', () => {
  console.log('🛑 Shutting down Gmail cron job...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('🛑 Shutting down Gmail cron job...');
  process.exit(0);
});

// Auto-start
initializeAndStartCron()
  .then(() => {
    console.log('🎉 Gmail cron job started successfully');
  })
  .catch((error) => {
    console.error('❌ Gmail cron job failed to start:', error);
  });


module.exports = {
  processUserEmails,
  runCronJob,
  initializeAndStartCron,
  CONFIG
};