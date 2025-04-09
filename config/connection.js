const mysql = require("mysql2");
const dotenv = require("dotenv");
dotenv.config(); // Load environment variables from .env file

// Create a connection to the database using environment variables
const connection = mysql.createConnection({
  host: process.env.HOST, // MySQL host from .env
  user: process.env.USER, // MySQL username from .env
  password: process.env.PASS, // MySQL password from .env
  database: process.env.DB_NAME, // MySQL database from .env
});

const connectDb = () => {
  connection.connect((err) => {
    if (err) {
      console.error("Error connecting to the database:", err.stack);
      return;
    }
    console.log("Connected to the MySQL database as id " + connection.threadId);
  });
};

// Example function to close the connection
const closeDb = () => {
  connection.end((err) => {
    if (err) {
      console.error("Error closing the database connection:", err.stack);
    } else {
      console.log("Database connection closed.");
    }
  });
};

module.exports = { connectDb, connection, closeDb };
