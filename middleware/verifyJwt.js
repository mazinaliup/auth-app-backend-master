require("dotenv").config();
const jwt = require("jsonwebtoken");

const verifyJwt = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).json({ errorMessage: "Unauthorized: No auth header" });
    
    console.log("Authorization Header:", authHeader); // Bearer token
    
    const token = authHeader.split(" ")[1];
    
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.log("JWT verification error:", err.message);
        return res.status(403).json({ errorMessage: "Forbidden: Invalid Token" });
      }
      
      req.userId = decoded.userId; // ✅ Save userId properly
      console.log("Decoded JWT:", decoded);
      
      next();
    });
  } catch (err) {
    console.log("verifyJwt.js Error:", err.message);
    res.status(500).send({ errorMessage: "Internal server error" });
  }
};

module.exports = { verifyJwt };
