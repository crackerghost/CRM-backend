// sendEmail.js - Enhanced Gmail API solution with email reading
const { google } = require("googleapis");
require("dotenv").config();
const nodemailer = require("nodemailer");

// Your existing sendEmail function
async function sendEmail(to, subject, text, html, refreshToken, user) {
  try {
    console.log(`📧 Sending email to: ${to}`);

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({ refresh_token: refreshToken });

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    // Create properly formatted email
    const messageParts = [
      `From: ${user}`,
      `To: ${to}`,
      `Subject: ${subject}`,
      "MIME-Version: 1.0",
      "Content-Type: text/html; charset=utf-8",
      "",
      html ||
        `<div style="font-family: Arial, sans-serif; white-space: pre-wrap;">${text}</div>`,
    ];

    const message = messageParts.join("\n");
    const encodedMessage = Buffer.from(message)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const result = await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodedMessage,
      },
    });

    console.log(`✅ Email sent successfully! Message ID: ${result.data.id}`);
    return {
      messageId: result.data.id,
      success: true,
      method: "Gmail API",
    };
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);

    if (error.message.includes("invalid_grant")) {
      throw new Error("OAuth2 token expired - user needs to re-authenticate");
    }

    if (error.message.includes("insufficient_scope")) {
      throw new Error(
        "Insufficient Gmail permissions - user needs to re-authorize"
      );
    }

    throw new Error(`Gmail API error: ${error.message}`);
  }
}

// NEW: Read emails with various search criteria
async function readEmails(refreshToken, user, options = {}) {
  try {
    console.log(`📖 Reading emails for: ${user}`);

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({ refresh_token: refreshToken });
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    // Build search query based on options
    const query = buildSearchQuery(options);

    // Get list of messages
    const listResponse = await gmail.users.messages.list({
      userId: "me",
      q: query,
      maxResults: options.maxResults || 10,
    });

    if (!listResponse.data.messages) {
      console.log("📭 No emails found matching criteria");
      return [];
    }

    console.log(`📬 Found ${listResponse.data.messages.length} emails`);

    // Get full message details for each email
    const emails = await Promise.all(
      listResponse.data.messages.map(async (message) => {
        const messageData = await gmail.users.messages.get({
          userId: "me",
          id: message.id,
          format: "full",
        });

        return parseEmailData(messageData.data);
      })
    );

    console.log(`✅ Successfully retrieved ${emails.length} emails`);
    return emails;
  } catch (error) {
    console.error("❌ Email reading failed:", error.message);

    if (error.message.includes("invalid_grant")) {
      throw new Error("OAuth2 token expired - user needs to re-authenticate");
    }

    if (error.message.includes("insufficient_scope")) {
      throw new Error(
        "Insufficient Gmail permissions - user needs to re-authorize with read scope"
      );
    }

    throw new Error(`Gmail API error: ${error.message}`);
  }
}

// NEW: Build Gmail search query from options
function buildSearchQuery(options) {
  const queryParts = [];

  // Search by sender
  if (options.from) {
    queryParts.push(`from:${options.from}`);
  }

  // Search by recipient
  if (options.to) {
    queryParts.push(`to:${options.to}`);
  }

  // Search by subject
  if (options.subject) {
    queryParts.push(`subject:"${options.subject}"`);
  }

  // Search by keywords in body
  if (options.keywords) {
    if (Array.isArray(options.keywords)) {
      queryParts.push(options.keywords.join(" "));
    } else {
      queryParts.push(options.keywords);
    }
  }

  // Search by label
  if (options.label) {
    queryParts.push(`label:${options.label}`);
  }

  // Search by read/unread status
  if (options.isUnread === true) {
    queryParts.push("is:unread");
  } else if (options.isUnread === false) {
    queryParts.push("is:read");
  }

  // Search by date range
  if (options.after) {
    queryParts.push(`after:${options.after}`); // Format: YYYY/MM/DD
  }

  if (options.before) {
    queryParts.push(`before:${options.before}`); // Format: YYYY/MM/DD
  }

  // Search by has attachments
  if (options.hasAttachment === true) {
    queryParts.push("has:attachment");
  }

  // Search by importance
  if (options.isImportant === true) {
    queryParts.push("is:important");
  }

  // Search by starred
  if (options.isStarred === true) {
    queryParts.push("is:starred");
  }

  // Default to inbox if no specific criteria
  if (queryParts.length === 0) {
    queryParts.push("in:inbox");
  }

  return queryParts.join(" ");
}

// NEW: Parse email data from Gmail API response
function parseEmailData(messageData) {
  const headers = messageData.payload.headers;
  const getHeader = (name) =>
    headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ||
    "";

  // Extract body content
  let body = "";
  if (messageData.payload.body.data) {
    body = Buffer.from(messageData.payload.body.data, "base64").toString();
  } else if (messageData.payload.parts) {
    // Handle multipart messages
    const textPart = findTextPart(messageData.payload.parts);
    if (textPart && textPart.body.data) {
      body = Buffer.from(textPart.body.data, "base64").toString();
    }
  }

  // Extract attachments info
  const attachments = extractAttachments(messageData.payload);

  return {
    id: messageData.id,
    threadId: messageData.threadId,
    subject: getHeader("Subject"),
    from: getHeader("From"),
    to: getHeader("To"),
    cc: getHeader("Cc"),
    bcc: getHeader("Bcc"),
    date: getHeader("Date"),
    timestamp: new Date(parseInt(messageData.internalDate)),
    body: body,
    snippet: messageData.snippet,
    isUnread: messageData.labelIds?.includes("UNREAD") || false,
    isImportant: messageData.labelIds?.includes("IMPORTANT") || false,
    isStarred: messageData.labelIds?.includes("STARRED") || false,
    labels: messageData.labelIds || [],
    attachments: attachments,
    sizeEstimate: messageData.sizeEstimate,
  };
}

// Helper function to find text part in multipart message
function findTextPart(parts) {
  for (const part of parts) {
    if (part.mimeType === "text/plain" || part.mimeType === "text/html") {
      return part;
    }
    if (part.parts) {
      const found = findTextPart(part.parts);
      if (found) return found;
    }
  }
  return null;
}

// Helper function to extract attachment information
function extractAttachments(payload) {
  const attachments = [];

  function scanParts(parts) {
    if (!parts) return;

    for (const part of parts) {
      if (part.filename && part.filename.length > 0) {
        attachments.push({
          filename: part.filename,
          mimeType: part.mimeType,
          size: part.body.size,
          attachmentId: part.body.attachmentId,
        });
      }
      if (part.parts) {
        scanParts(part.parts);
      }
    }
  }

  if (payload.parts) {
    scanParts(payload.parts);
  }

  return attachments;
}

// NEW: Convenience functions for common email searches
async function getUnreadEmails(refreshToken, user, maxResults = 10) {
  return await readEmails(refreshToken, user, {
    isUnread: true,
    maxResults,
  });
}

async function getEmailsFromSender(
  refreshToken,
  user,
  senderEmail,
  maxResults = 10
) {
  return await readEmails(refreshToken, user, {
    from: senderEmail,
    maxResults,
  });
}

async function getEmailsBySubject(
  refreshToken,
  user,
  subject,
  maxResults = 10
) {
  return await readEmails(refreshToken, user, {
    subject: subject,
    maxResults,
  });
}

async function getEmailsByKeywords(
  refreshToken,
  user,
  keywords,
  maxResults = 10
) {
  return await readEmails(refreshToken, user, {
    keywords: keywords,
    maxResults,
  });
}

async function getEmailsInDateRange(
  refreshToken,
  user,
  afterDate,
  beforeDate,
  maxResults = 10
) {
  return await readEmails(refreshToken, user, {
    after: afterDate,
    before: beforeDate,
    maxResults,
  });
}

// Your existing backup functions
async function sendEmailWithSMTPBackup(
  to,
  subject,
  text,
  html,
  refreshToken,
  user
) {
  try {
    return await sendEmail(to, subject, text, html, refreshToken, user);
  } catch (apiError) {
    console.log("⚠️  Gmail API failed, trying SMTP...");

    try {
      return await sendEmailSMTP(to, subject, text, html, refreshToken, user);
    } catch (smtpError) {
      throw new Error(
        `Both methods failed - API: ${apiError.message}, SMTP: ${smtpError.message}`
      );
    }
  }
}

async function sendEmailSMTP(to, subject, text, html, refreshToken, user) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials({ refresh_token: refreshToken });
  const { token: accessToken } = await oauth2Client.getAccessToken();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: user,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      refreshToken: refreshToken,
      accessToken: accessToken,
    },
  });

  const info = await transporter.sendMail({
    from: user,
    to,
    subject,
    text,
    html,
  });

  return {
    messageId: info.messageId,
    success: true,
    method: "SMTP",
  };
}

module.exports = {
  sendEmail,
  sendEmailWithSMTPBackup,
  readEmails,
  getUnreadEmails,
  getEmailsFromSender,
  getEmailsBySubject,
  getEmailsByKeywords,
  getEmailsInDateRange,
};
