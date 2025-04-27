const Review = require("../models/reviewModel");

exports.createReview = async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.userId; // 👈 We'll set this from token (I'll show below)

    const newReview = new Review({
      title,
      description,
      user: userId,
    });

    await newReview.save();
    res.status(201).send({ message: "Review created successfully", review: newReview });
  } catch (err) {
    console.error(err);
    res.status(500).send({ errorMessage: "Internal server error" });
  }
};

exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find().populate("user", "userName email"); // 👈 Populate user info
    res.status(200).send(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).send({ errorMessage: "Internal server error" });
  }


};


exports.getUserReviews = async (req, res) => {
    try {
      // Extract userId from request parameters
      const userId = req.params.userId;
  
      // Log to ensure correct userId is being received
      console.log("Requested userId:", userId);
  
      // Convert userId to ObjectId and find reviews
      const userReviews = await reviewModel.find({
        user_id: mongoose.Types.ObjectId(userId), // Ensure ObjectId comparison
      })
        .populate({
          path: "user_id", // This will populate user details like name and email
          select: "userName email", // Only select required fields
        })
        .exec();
  
      // Log to check the result of the query
      console.log("Reviews found for user:", userReviews);
  
      // If no reviews found, return error
      if (userReviews.length === 0) {
        return res.status(404).send({ message: "No reviews found for this user." });
      }
  
      // Return the reviews with user details
      res.status(200).json(userReviews);
    } catch (err) {
      console.log("Error in getUserReviews:", err.message);
      res.status(500).send({ errorMessage: "Internal server error" });
    }
  };


