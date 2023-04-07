const express = require("express");
const { check } = require('express-validator');

const userControllers = require("../controllers/user-controllers");
const router = express.Router();

router.use((req, res, next) => {
  console.log("Hello World");
  next();
});

router.get("/", (req, res, next) => {
  console.log("GET REQUEST");
  res.json({ message: "It works!" });
});

router.post(
  "/login",
  userControllers.login
);

router.post(
  "/register",
  [
    check('username').not().isEmpty(),
    check('email').normalizeEmail().isEmail(),
    check('password').isLength({min: 6})
  ],
  userControllers.register
);


router.get("/")

module.exports = router;