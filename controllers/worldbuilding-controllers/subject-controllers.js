const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const HttpError = require("../../models/http-error");
const World = require("../../models/worldbuilding-models/world");
const Country = require("../../models/worldbuilding-models/subject-models/country");

const createCountry = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid inputs. Please try again.", 422));
  }

  let homeWorld;
  try {
    homeWorld = await World.findById(req.params.worldid);
  } catch (err) {
    return next(new HttpError("Could not find world.", 500));
  }

  let { countryName, cardImg, hasImg, desc, world } = req.body;

  const newCountry = Country({
    countryName,
    cardImg,
    hasImg,
    desc,
    world,
  });

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await newCountry.save({session: sess});
    homeWorld.countries.push(newCountry);
    await homeWorld.save({session: sess});
    await sess.commitTransaction();
  } catch (err) {
    return next(new HttpError("Could not create country. Please try again later", 500));
  }

  res.status(201).json({country: newCountry});

};

exports.createCountry = createCountry;