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
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).send({ errorMessage: "User not found" });
    }
    const comparePassword = await bcrypt.compare(password, user.password);
    if (!comparePassword) {
      return res
        .status(400)
        .send({ errorMessage: "Username or password invalid" });
    }
    const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1m",
    });
    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.REFRESH_JWT_SECRET,
      { expiresIn: "1h" }
    );
    let newRefreshTokenArray = !cookies?.jwt
      ? user.refreshToken
      : user.refreshToken.filter((rt) => rt !== cookies.jwt);
    if (cookies?.jwt) {
      const refreshToken = cookies.jwt;
      const foundToken = await userModel.findOne({ refreshToken });

      if (!foundToken) {
        newRefreshTokenArray = [];
      }

      res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: "None",
        secure: true,
      });
    }
    user.refreshToken = [...newRefreshTokenArray, refreshToken];
    await user.save();
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.json({ message: "user login successfull", accessToken });
  } catch (err) {
    console.log("err", err.message);
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
