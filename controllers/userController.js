const bcrypt = require("bcryptjs");
const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");

exports.userSignup = async (req, res) => {
  try {
    const { userName, email, password } = req.body;
    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = new userModel({
      userName,
      email,
      password: hashPassword,
    });
    await newUser.save();
    res.status(200).send({ message: "User signup successfull" });
  } catch (err) {
    res.status(500).send({ errorMessage: "Internal server error" });
  }
};

exports.userLogin = async (req, res) => {
  try {
    const cookies = req.cookies;
    const { email, password } = req.body;

    // Find user by email
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).send({ errorMessage: "User not found" });
    }

    // Compare passwords
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res
        .status(400)
        .send({ errorMessage: "Username or password invalid" });
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1m" }
    );
    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.REFRESH_JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Handle refresh token rotation
    let newRefreshTokenArray = user.refreshToken || [];

    if (cookies?.jwt) {
      const oldRefreshToken = cookies.jwt;

      // Check if the refresh token exists in DB
      const foundUser = await userModel.findOne({ refreshToken: { $in: [oldRefreshToken] } });

      if (!foundUser) {
        newRefreshTokenArray = []; // If old token invalid, empty array
      } else {
        // Remove old refreshToken from array
        newRefreshTokenArray = newRefreshTokenArray.filter((rt) => rt !== oldRefreshToken);
      }

      // Clear old cookie
      res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: "None",
        secure: true,
      });
    }

    // Save new refreshToken to DB
    user.refreshToken = [...newRefreshTokenArray, refreshToken];
    await user.save();

    // Set new refreshToken as cookie
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    // Send access token in response
    res.status(200).json({ message: "User login successful", accessToken });
  } catch (err) {
    console.error("Login error:", err); // Full error
    res.status(500).send({ errorMessage: "Internal server error" });
  }
};


exports.getUsers = async (req, res) => {
  try {
    const users = await userModel.find({});
    res.status(200).send(users);
  } catch (err) {
    res.status(500).send({ errorMessage: "Internal server error" });
  }
};

exports.logout = async (req, res) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204); //No content
    const refreshToken = cookies.jwt;

    // Is refreshToken in db?
    const foundUser = await userModel.findOne({ refreshToken });
    if (!foundUser) {
      res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: "None",
        secure: true,
      });
      return res.sendStatus(204);
    }

    // Delete refreshToken in db
    const otherUsers = foundUser.refreshToken.filter(
      (val) => val !== refreshToken
    );
    foundUser.refreshToken = otherUsers;
    await foundUser.save();
    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "None",
      secure: true,
    });
    res.sendStatus(204);
  } catch (err) {
    res.status(500).send({ errorMessage: "Internal server error" });
  }
};
