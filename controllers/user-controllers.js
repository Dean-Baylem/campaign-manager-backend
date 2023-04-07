const { validationResult } = require('express-validator');
const HttpError = require('../models/http-error');
const Player = require('../models/user');

const login = async (req, res, next) => {
  let {email, password} = req.body;

  let user;
  try {
    user = await Player.findOne({email: email})
  } catch (err) {
    return next(new HttpError("Unable to find Player details. Please try again later.", 500));
  }

  if (!user) {
    return next(
      new HttpError(
        "Unable to find Player details. Please try again later.",
        500
      )
    );
  }

  try {
    if (user.password === password) {
    console.log("Logged in");
    res.status(201).json({message: "Log in successful!"})
  } 
  } catch {
    console.log("Did not work.")
    res.status(422).json({message: "Did not log in! Try again."})
  }
}

// Register Player details to MongoDB
const register = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError("Invalid inputs. Please check and try again.", 422));
    }

    let { username, email, password } = req.body;

    // Check for exisiting User by email
    let exisitingUser;
    try {
      exisitingUser = await Player.findOne({email: email})
    } catch (err) {
      return next(new HttpError("Registration failed, please try again later", 500));
    }

    if (exisitingUser) {
      return next(new HttpError("An account already exists with this email. Try to log in instead.", 422));
    }

    const newPlayer = Player({
        username,
        email, 
        password, // !!! Note - Change to encrypted password later !!!
        worlds: []
    })

    try {
      await newPlayer.save();
    } catch (err) {
      console.log(err);
      return next(new HttpError("Oh no! Signup failed, please try again later", 500));
    }

    res.status(201).json({ user: newPlayer});
}

exports.register = register;
exports.login = login;