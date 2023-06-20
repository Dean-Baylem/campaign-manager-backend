const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const HttpError = require("../models/http-error");
const Player = require("../models/player");

const login = async (req, res, next) => {
  let { email, password } = req.body;

  let player;
  try {
    player = await Player.findOne({ email: email });
  } catch (err) {
    return next(
      new HttpError(
        "Unable to find Player details. Please try again later.",
        500
      )
    );
  }

  if (!player) {
    return next(
      new HttpError(
        "Unable to find Player details. Please try again later.",
        500
      )
    );
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, player.password);
  } catch (err) {
    return next(
      new HttpError(
        "Unable to log in, please check credentials and try again.",
        401
      )
    );
  }

  if (!isValidPassword) {
    return next(
      new HttpError(
        "Unable to log in, please check credentials and try again.",
        401
      )
    );
  }

  let token;
  try {
    token = jwt.sign(
      { playerId: player.id, email: player.email },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
  } catch (err) {
    return next(
      new HttpError(
        "Unable to log in, please check credentials and try again.",
        401
      )
    );
  }

  res.json({playerId: player.id, email: player.email, token: token});
};

// Register Player details to MongoDB
const register = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs. Please check and try again.", 422)
    );
  }

  let { playername, email, password } = req.body;

  // Check for exisiting player by email
  let exisitingplayer;
  try {
    exisitingplayer = await Player.findOne({ email: email });
  } catch (err) {
    return next(
      new HttpError("Registration failed, please try again later", 500)
    );
  }

  if (exisitingplayer) {
    return next(
      new HttpError(
        "An account already exists with this email. Try to log in instead.",
        422
      )
    );
  }
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    return next(
      new HttpError("Registration failed, please try again later", 500)
    );
  }

  const newPlayer = Player({
    playername,
    email,
    password: hashedPassword, // !!! Note - Change to encrypted password later !!!
    worlds: [],
  });

  try {
    await newPlayer.save();
  } catch (err) {
    console.log(err);
    return next(
      new HttpError("Oh no! Signup failed, please try again later", 500)
    );
  }

  let token;
  try {
    token = jwt.sign(
      { playerId: newPlayer.id, email: newPlayer.email },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
  } catch (err) {
    return next(new HttpError("Signup failed, please try again", 500));
  }

  res
    .status(201)
    .json({ playedId: newPlayer.id, email: newPlayer.email, token: token });
};

exports.register = register;
exports.login = login;
