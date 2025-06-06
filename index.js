const express = require("express");
const dotenv = require("dotenv");
const { connectDb } = require("./config/connection");
const cors = require('cors');
require("./config/cron");
dotenv.config();
const app = express();
connectDb();
app.use(cors())
app.use(express.json());
app.use("/api/v1/erp", require("./routes/erpRoutes"));
app.use("/api/v1/erp/mail", require("./routes/mailRoutes"));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
