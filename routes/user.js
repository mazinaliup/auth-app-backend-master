const {
  userSignup,
  userLogin,
  getUsers,
  logout,
} = require("../controllers/userController");
const express = require("express");
const { verifyJwt } = require("../middleware/verifyJwt");
const router = express.Router();

router.post("/signup", userSignup);
router.post("/login", userLogin);
router.get("/get-users", verifyJwt, getUsers);
router.get("/logout", logout);

module.exports = router;
