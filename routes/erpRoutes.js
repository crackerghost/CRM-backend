const express = require("express");
const {getData, saveData } = require("../controllers/erpCont");
const { jwtDecrypt } = require("../middelwares/jwtDecrypt");
const router = express.Router();

router.route("/get-data").get(jwtDecrypt, getData);
router.route("/save-data").post(jwtDecrypt,saveData)

module.exports = router;
