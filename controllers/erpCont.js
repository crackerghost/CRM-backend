const { Erp_Conversations, User, Trails, Attachment } = require("../models");
const multer = require("multer");
const storage = multer.memoryStorage();
const { uploadFileToS3, BUCKET_NAME } = require("../config/awsS3");

const {
  getField_data,
  getLabels,
  getErpData,
  getTableLabels,
  Attachments,
} = require("../services/getDataService");
const {
  saveAttachments,
  saveForm,
  createTrail,
  createConversation,
} = require("../services/saveDataService");
const { upload } = require("../middelwares/upload");

exports.getData = async (req, res) => {
  const { page_id, form_id, page, pageSize, module, query, filter } = req.query;
  const { client_id } = req.user;

  try {
    const field_data = await getField_data(form_id, client_id);
    const labels = await getLabels(page_id);
    const erp_tabel = await getErpData(
      client_id,
      page,
      pageSize,
      module,
      query,
      filter
    );
    const erp_tab_lab = await getTableLabels(page_id);

    res.status(200).send({
      client_Data: erp_tabel,
      tabel_labels: erp_tab_lab,
      fields: field_data,
      labels: labels,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Error fetching data", error });
  }
};

exports.saveData = async (req, res) => {
  try {
    const { id, client_id } = req.user;
    const moduleName = "CRM";
    const savedData = await saveForm(client_id, id, moduleName, req);
    await createTrail(savedData, id, moduleName);

    res.status(201).json({
      message: "Data saved successfully",
      savedData,
    });
  } catch (error) {
    console.error("Error saving data:", error);
    res.status(500).json({
      message: "Error saving data",
      error: error.message,
    });
  }
};

exports.saveConversation = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("Files received:", req.files ? req.files.length : 0);

    if (!req.body.parent_id || !req.user.id) {
      return res.status(400).send({ message: "Invalid data", success: false });
    }

    const moduleName = "CRM";

    const saveData = await createConversation(
      req.body.parent_id,
      req.user.id,
      req,
      moduleName,
      false
    );

    const uploadedFiles = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const fileBuffer = file.buffer;
        const s3Key = `conversations/${Date.now()}_${file.originalname}`;
        const fileUrl = await uploadFileToS3(fileBuffer, BUCKET_NAME, s3Key);

        console.log("Uploaded file URL:", fileUrl);

        uploadedFiles.push({
          url: fileUrl,
          name: file.originalname,
        });
      }

      try {
        const attachmentResult = await saveAttachments(uploadedFiles, req, moduleName);
        if (!attachmentResult.success) {
          console.error("Attachment save error:", attachmentResult.message);
        }
      } catch (attachmentError) {
        console.error("Error in saveAttachments:", attachmentError);
      }
    }

    if (saveData) {
      return res.status(200).send({
        message: "Data saved successfully",
        success: true,
        files: uploadedFiles,
      });
    } else {
      return res.status(500).send({
        message: "Failed to save conversation",
        success: false,
      });
    }
  } catch (error) {
    console.error("Error saving conversation:", error);
    return res.status(500).send({
      error: error.message,
      success: false,
    });
  }
};


exports.getConversations = async (req, res) => {
  const { parent_id, module } = req.query;
  try {
    const conversations = await Erp_Conversations.findAll({
      where: {
        parent_id: parent_id,
        module_name: module,
      },
      include: [
        {
          model: User,
          attributes: ["id", "first_name", "last_name", "email"],
        },
      ],

      order: [["createdAt", "DESC"]],
    });
    res.status(200).json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ message: "Error fetching conversations", error });
  }
};

exports.getTrails = async (req, res) => {
  const { parent_id } = req.query;
  try {
    const trail = await Trails.findAll({
      where: {
        parent_id: parent_id,
      },
      include: [
        {
          model: User,
          attributes: ["id", "first_name", "last_name", "email"],
        },
      ],

      order: [["createdAt", "DESC"]],
    });
    res.status(200).json(trail);
  } catch (error) {
    console.error("Error fetching Trails:", error);
    res.status(500).json({ message: "Error fetching Trails", error });
  }
};

exports.saveTrail = async (req, res) => {
  try {
    const moduleName = "CRM";
    const saveData = await createTrail(
      req.body.parent_id,
      req.user.id,
      req,
      moduleName,
      (first = false)
    );

    console.log(saveData);
    if (saveData) {
      res.status(200).send({
        message: "data saved succesfully",
        success: true,
      });
    }
  } catch (error) {
    res.status(500).send({
      error: error,
      success: false,
    });
  }
};

exports.saveAttachments = async (req, res) => {
  try {
    const moduleName = "CRM";
    const uploadedFiles = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const fileBuffer = file.buffer;
        const s3Key = `conversations/${Date.now()}_${file.originalname}`;
        const fileUrl = await uploadFileToS3(fileBuffer, BUCKET_NAME, s3Key);

        console.log("Uploaded file URL:", fileUrl);

        uploadedFiles.push({
          url: fileUrl,
          name: file.originalname,
        });
      }

      const saveData = await saveAttachments(uploadedFiles, req, moduleName);

      if (saveData) {
        return res.status(200).send({
          message: "Data saved successfully",
          success: true,
          files: uploadedFiles, // optional, if frontend expects it
        });
      }
    }

    return res.status(400).send({
      message: "No files uploaded or saving failed",
      success: false,
    });
  } catch (error) {
    console.error("Error in saveAttachments:", error);
    return res.status(500).send({
      error: error.message || error,
      success: false,
    });
  }
};


exports.getAttachments = async (req, res) => {
  const { parent_id } = req.query;
  try {
    const attachment = await Attachments(parent_id);
    if (attachment.length > 0) {
      res.status(200).send({
        message: "data fetched succesfully",
        data: attachment,
        success: true,
      });
    }
  } catch (error) {
    throw new Error("Error fetching attachments.");
  }
};
