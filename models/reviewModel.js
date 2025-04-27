const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide review title"],
    },
    description: {
      type: String,
      required: [true, "Please provide review description"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // 👈 Connects to User model
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);
