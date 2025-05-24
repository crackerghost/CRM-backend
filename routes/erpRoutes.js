const express = require("express");
const {
  getData,
  saveData,
  getConversations,
  getTrails,
  saveConversation,
  saveTrail,
  saveAttachments,
  getAttachments,
  saveAppointments,
  getAppointments,
} = require("../controllers/erpCont");
const { jwtDecrypt } = require("../middelwares/jwtDecrypt");
const { upload } = require("../middelwares/upload");
const router = express.Router();
router.route("/get-data").get(jwtDecrypt, getData);
router.route("/save-data").post(jwtDecrypt, saveData);
router.route("/get-conversations").get(jwtDecrypt, getConversations);
router.route("/get-trails").get(jwtDecrypt, getTrails);
router.route("/save-trail").post(jwtDecrypt, saveTrail);
router
  .route("/save-conversation")
  .post(jwtDecrypt, upload.any(), saveConversation);
router
  .route("/save-attachments")
  .post(jwtDecrypt, upload.any(), saveAttachments);
router.route("/get-attachments").get(jwtDecrypt, getAttachments);
router.route("/save-appointments").post(jwtDecrypt, saveAppointments);
router.route("/get-appointments").get(jwtDecrypt, getAppointments);

module.exports = router;
