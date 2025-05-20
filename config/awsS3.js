const AWS = require("aws-sdk");

// Load environment variables from the .env file
require("dotenv").config();

// Set up AWS credentials and configuration
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID, // Your AWS Access Key ID
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // Your AWS Secret Access Key
  region: process.env.AWS_REGION, // The AWS region where your bucket is located
});

// Function to upload a file to S3
const uploadFileToS3 = async (fileBuffer, bucketName, s3Key) => {
  try {
    // Set up the S3 upload parameters
    const params = {
      Bucket: bucketName,
      Key: s3Key, // The key (path) within the S3 bucket
      Body: fileBuffer, // The file content as a buffer
      ContentType: "application/octet-stream", // Optional: set the content type
      ACL: "public-read", // Optional: to make the file public
    };

    // Upload the file to S3
    const data = await s3.upload(params).promise();

    console.log("File uploaded successfully:", data.Location);
    return data.Location; // Return the URL of the uploaded file
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error; // Rethrow the error for further handling
  }
};

module.exports = {
  BUCKET_NAME: "samprunnerbucket",
  BUCKET_PATH: "https://samprunnerbucket.s3.amazonaws.com/",
  uploadFileToS3,
};
