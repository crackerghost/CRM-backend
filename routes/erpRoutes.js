const express = require("express");
const { create, getLabels } = require("../controllers/erpCont");
const router = express.Router();
router.route("/add-details").post(create);
router.route("/get-labels").post(getLabels);
module.exports = router;
