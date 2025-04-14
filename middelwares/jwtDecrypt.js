const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.SECRET_KEY;

exports.jwtDecrypt = async (req, res, next) => {
  try {
    const token =
      req.headers.authorization && req.headers.authorization.split(" ")[1];
 
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Invalid or expired token" });
      }

      req.user = decoded;

      next();
    });
  } catch (error) {
    console.error("Error decrypting token:", error);
    return res
      .status(500)
      .json({ message: "Server error during token decryption" });
  }
};
