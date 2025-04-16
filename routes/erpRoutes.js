const express = require("express");
const {getData } = require("../controllers/erpCont");
const { jwtDecrypt } = require("../middelwares/jwtDecrypt");
const router = express.Router();

router.route("/get-data").get(jwtDecrypt, getData);

module.exports = router;
