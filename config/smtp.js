// sendEmail.js
const dotenv = require("dotenv");
dotenv.config();
const nodemailer = require("nodemailer");

// Create a reusable function to send an email
function sendEmail(to, subject, text, html ) {
  return new Promise((resolve, reject) => {
    console.log(to)
    // Create a transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      service: "gmail", // You can use any other SMTP service like Outlook, Yahoo, etc.
      auth: {
        user: process.env.email, // Replace with your email
        pass: process.env.password, // Replace with your email password or app-specific password
      },
    });

    // Define the email options
    const mailOptions = {
      from: process.env.email || "your-email@gmail.com", // Sender's email
      to, // Receiver's email
      subject, // Email subject
      text: text || "Hello, this is a test email sent from Node.js using SMTP!", // Email body
      html: html || "", // Optional HTML body
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return reject(error);
      }
      resolve(info.response);
    });
  });
}

module.exports = sendEmail;
//
