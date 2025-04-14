const express = require("express");
const { create, getLabels, getData } = require("../controllers/erpCont");
const { jwtDecrypt } = require("../middelwares/jwtDecrypt");
const router = express.Router();

router.route("/get-data").get(jwtDecrypt, getData);

module.exports = router;
