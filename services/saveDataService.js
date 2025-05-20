const sendEmail = require("../config/smtp");
const { Erp_Conversations, Trails, Attachment } = require("../models");
const ErpData = require("../models/erp_data");
const dotenv = require("dotenv");
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
    const data = await Erp_Conversations.create({
      parent_id: parent_id,
      conversation_id: 1,
      user_id: id,
      message: req.body.message,
      subject: first
        ? moduleName == "CRM"
          ? "Lead Created"
          : "Ticket Created"
        : req.body.subject,
      module_name: moduleName,
      sender_details: req.body.sender_details
        ? req.body.sender_details
        : process.env.email,
      receiver_email: req.body.receiver_email,
    });
    if (!first && req.body.receiver_email) {
      await sendEmail(
        req.body.receiver_email,
        req.body.subject,
        req.body.message
      );
      const changes = `Reply to ${req.body.receiver_email}`;
      saveData = undefined;
      await this.createTrail(
        saveData,
        parent_id,
        id,
        moduleName,
        false,
        changes
      );
    }

    return data;
  } catch (error) {
    return error;
  }
};

exports.createTrail = async (
  savedData,
  parent_id,
  id,
  moduleName,
  isFirst = true,
  changes
) => {
  try {
    const data = await Trails.create({
      parent_id: savedData?.id || parent_id,
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

exports.saveAttachments = async (files, req, moduleName) => {
  try {
    if (!files || files.length === 0) {
      throw new Error("No files provided");
    }

    // Check if the required data is available
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
