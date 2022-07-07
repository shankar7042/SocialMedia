const express = require("express");
const { register, login, followUser, logout } = require("../controllers/user");
const { isAuthenticated } = require("../middleware/auth");

const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/follow/:id").get(isAuthenticated, followUser);
router.route("/logout").get(logout);

module.exports = router;
