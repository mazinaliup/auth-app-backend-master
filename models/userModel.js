const mongoose = require("mongoose");


const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: [true, "Please provide username"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    refreshToken: [String], // <--- THIS MUST EXIST
    delFlag: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
