const express = require("express");
const router = express.Router();
const { signup, login } = require("../controllers/authController");
const passport = require("passport");
const jwt = require("jsonwebtoken");

router.post("/signup", signup);
router.post("/login", login);
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  (req, res) => {
    const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    const isDev = process.env.DEV_MODE === "true";
    const redirectBase = isDev
      ? "http://localhost:3000"
      : "https://arcanatable.onrender.com";

    res.redirect(`${redirectBase}/?token=${token}`);
  }
);

module.exports = router;
