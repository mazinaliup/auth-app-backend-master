const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

const handleRefreshToken = async (req, res) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(401);
    const refreshToken = cookies.jwt;
    const foundUser = await userModel.findOne({ refreshToken });
    if (!foundUser) return res.sendStatus(403); //Forbidden
    // evaluate jwt
    jwt.verify(refreshToken, process.env.REFRESH_JWT_SECRET, (err, decoded) => {
      if (err || foundUser._id.toString() !== decoded.userId)
        return res.sendStatus(403);
      const accessToken = jwt.sign(
        { userId: foundUser._id },
        process.env.JWT_SECRET,
        { expiresIn: "1m" }
      );
      res.json({ accessToken });
    });
  } catch (err) {
    res.status(500).send({ errorMessage: "Internal server error" });
  }
};

module.exports = { handleRefreshToken };
