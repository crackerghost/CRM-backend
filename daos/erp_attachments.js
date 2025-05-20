const { Attachment } = require("../models");
const { findRecords } = require("../utils/Sequalize");

exports.fetchAttachments = async (parent_id) => {
  try {
    const data = await findRecords(Attachment, {
      where: { parent_id: parent_id },
      order: [["createdAt", "DESC"]],
    });

    return data;
  } catch (error) {
    throw new Error("Error fetching attachments.");
  }
};
