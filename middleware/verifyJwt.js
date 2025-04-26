require("dotenv").config();
const jwt = require("jsonwebtoken");

const verifyJwt = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.sendStatus(401);
    console.log(authHeader); // Bearer token
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return res.sendStatus(403); //invalid token
      req.user = decoded.username;
      next();
    });
    // console.log(req.cookies?.jwt);
    // const authHeader = req.headers["authorization"];
    // if (!authHeader) return res.sendStatus(401);
    // console.log(authHeader); // Bearer token
    // const token = authHeader.split(" ")[1];
    // const token = req.cookies?.jwt.toString();
    // console.log(token);
    // if (!token) return res.sendStatus(401);
    // jwt.verify(token, process.env.REFRESH_JWT_SECRET, (err, decoded) => {
    //   if (err) console.log(err.message, process.env.JWT_SECRET);
    //   if (err) return res.sendStatus(403); //invalid token
    //   req.user = decoded.userId;
    //   console.log("decoded", decoded);
    //   next();
    // });
  } catch (err) {
    console.log("err", err.message);
    res.status(500).send({ errorMessage: "Internal server error" });
  }
};

module.exports = { verifyJwt };
