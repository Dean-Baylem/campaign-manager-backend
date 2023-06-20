const express = require("express");
const { check } = require('express-validator');

const playerControllers = require("../controllers/player-controllers");
const router = express.Router();


router.get("/", (req, res, next) => {
  console.log("GET REQUEST");
  res.json({ message: "It works!" });
});

router.post(
  "/login",
  playerControllers.login
);

router.post(
  "/register",
  [
    check('playername').not().isEmpty(),
    check('email').normalizeEmail().isEmail(),
    check('password').isLength({min: 6})
  ],
  playerControllers.register
);


router.get("/")

module.exports = router;