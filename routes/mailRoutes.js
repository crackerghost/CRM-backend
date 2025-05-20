const express = require("express");
const { storeToken } = require("../controllers/erpMail");
const { jwtDecrypt } = require("../middelwares/jwtDecrypt");
const router = express.Router();


router.route('/access-token').get(jwtDecrypt,storeToken)

module.exports = router;