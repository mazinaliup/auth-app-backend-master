const express = require("express");
const { createReview, getAllReviews, getUserReviews } = require("../controllers/reviewController");
const { verifyJwt } = require("../middleware/verifyJwt");
const router = express.Router();

router.post("/create", verifyJwt, createReview); // only logged-in user can create
router.get("/all", getAllReviews);
router.get("/user/:userId", getUserReviews);

module.exports = router;
