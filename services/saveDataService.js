const {
  sendEmail,
  sendEmailWithFallback,
  sendEmailWithSMTPBackup,
} = require("../config/smtp");
const {
  Erp_Conversations,
  Trails,
  Attachment,
  gmailToken,
} = require("../models");
const ErpData = require("../models/erp_data");
const dotenv = require("dotenv");
const { findRecords } = require("../utils/Sequalize");
const { createAppointments } = require("../daos/erp_appointments");
dotenv.config();
exports.saveForm = async (client_id, id, moduleName, req) => {
  try {
    const data = await ErpData.create({
      client_id: client_id,
      user_id: id,
      module_name: moduleName,
      ...req.body,
    });

    return data;
  } catch (error) {
    return error;
  }
};

exports.createConversation = async (parent_id, id, req, moduleName, first) => {
  try {
    // Create conversation record first
    const data = await Erp_Conversations.create({
      parent_id: parent_id,
      conversation_id: 1,
      user_id: id,
      message: req.body.message,
      subject: first
        ? moduleName === "CRM"
          ? "Lead Created"
          : "Ticket Created"
        : req.body.subject,
      module_name: moduleName,
      sender_details: req.user.email,
      receiver_email: req.body.receiver_email,
    });

    // Only attempt to send email if not first message and receiver email exists
    if (!first && req.body.receiver_email) {
      try {
        console.log("Attempting to send email to:", req.body.receiver_email);

        const email_link = await findRecords(gmailToken, {
          where: { gmail: req.user.email },
        });

        if (!email_link || email_link.length === 0) {
          console.warn("No Gmail tokens found for user:", req.user.email);
          return data;
        }

        const tokenRecord = email_link[0];
        const { refresh_token } = tokenRecord.dataValues;

        console.log("Found tokens for user:", req.user.email);

        if (!refresh_token) {
          console.error("Refresh token is missing for user:", req.user.email);
          throw new Error(
            "Refresh token is missing - user needs to re-authenticate"
          );
        }

        // Use the enhanced function with fallback methods
        await sendEmailWithSMTPBackup(
          req.body.receiver_email,
          req.body.subject,
          req.body.message,
          `<div style="font-family: Arial, sans-serif;">
            <h3>${req.body.subject}</h3>
            <p>${req.body.message.replace(/\n/g, "<br>")}</p>
            <hr>
            <small>Sent from ${moduleName} System</small>
            <small>conversation id ${parent_id}</small>
          </div>`,
          refresh_token,
          req.user.email
        );

        console.log("Email sent successfully to:", req.body.receiver_email);

        // Create trail after successful email
        const changes = `Reply sent to ${req.body.receiver_email}`;
        if (!req.files || req.files.length === 0) {
          await this.createTrail(parent_id, id, moduleName, false, changes);
        }
      } catch (emailError) {
        console.error("Email sending failed:", emailError);

        // Handle specific OAuth2 errors
        if (
          emailError.message.includes("Refresh token expired") ||
          emailError.message.includes("invalid_grant")
        ) {
          console.error("User needs to re-authenticate Gmail access");

          // Optionally mark the token as invalid in database
          try {
            await gmailToken.update(
              { status: "expired" },
              { where: { gmail: req.user.email } }
            );
          } catch (updateError) {
            console.error("Failed to update token status:", updateError);
          }
        }

        // Log the error but don't fail the conversation creation
        console.warn(
          "Continuing without sending email due to:",
          emailError.message
        );
      }
    }

    return data;
  } catch (error) {
    console.error("Error in createConversation:", error);
    throw error;
  }
};

exports.createTrail = async (
  parent_id,
  id,
  moduleName,
  isFirst = true,
  changes
) => {
  try {
    const data = await Trails.create({
      parent_id: parent_id,
      user_id: id,
      changes: isFirst
        ? moduleName === "CRM"
          ? "Lead Created"
          : "Ticket Created"
        : changes,
    });

    return data;
  } catch (error) {
    console.error("Error creating trail:", error);
    return { error: error.message };
  }
};

exports.saveAttachments = async (files, req, moduleName, saveData, first) => {
  try {
    if (!files || files.length === 0) {
      throw new Error("No files provided");
    }
    if (!req.body.parent_id) {
      throw new Error("Parent ID is missing");
    }

    if (!req.user || !req.user.id) {
      throw new Error("User ID is missing");
    }

    const attachmentPromises = files.map(async (file) => {
      const fileExtension = file.url.split(".").pop().toLowerCase();
      const attachmentData = await Attachment.create({
        parent_id: req.body.parent_id,
        message_id: saveData?.id || "",
        user_id: req.user.id,
        file_url: file.url,
        file_name: file.name,
        type: fileExtension,
        module_name: moduleName,
        message: req.body.subject || req.body.message,
      });
      return attachmentData;
    });

    const attachments = await Promise.all(attachmentPromises);
    if (!first) {
      const changes = saveData?.id
        ? `Email sent to ${req.body.receiver_email}`
        : `File uploaded > ${req.body.message}`;

      await this.createTrail(
        req.body.parent_id,
        req.user.id,
        moduleName,
        false,
        changes
      );
    }

    return {
      success: true,
      message: "Files saved successfully",
      attachments,
    };
  } catch (error) {
    console.error("Error saving attachments:", error);
    return {
      success: false,
      message: error.message || "An error occurred while saving attachments",
    };
  }
};

exports.saveApp = async (
  parent_id,
  name,
  created,
  date,
  time,
  description,
  mlink,
  glink,
  email,
  id,
  module_name
) => {
  try {
    const data = await createAppointments(
      parent_id,
      name,
      created,
      date,
      time,
      description,
      mlink,
      glink,
      email,
      id,
      module_name
    );
    return data;
  } catch (error) {
    throw new Error(error);
  }
};
