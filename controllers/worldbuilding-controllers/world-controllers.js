const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const HttpError = require("../../models/http-error");
const Player = require("../../models/user");
const World = require("../../models/worldbuilding-models/world");
const WorldSubject = require("../../models/worldbuilding-models/worldSubject");


const createWorld = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError("Invalid inputs. Please try again.", 422));
    }

    // Find user the world belongs to.
    let player;
    try {
        player = await Player.findById(req.params.userid)
    } catch (err) {
        return next(new HttpError("Finding player details failed.", 500));
    }

    if (!player) {
        return next (new HttpError("Please log in to make a new world.", 404));
    }

    // Prepare new world model  
    let { worldName, worldDesc, creator } = req.body;

    const newWorld = World({
        worldName,
        worldDesc,
        creator,
    });

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await newWorld.save({session: sess});
        player.worlds.push(newWorld);
        await player.save({session: sess});
        await sess.commitTransaction();
    } catch (err) {
        console.log(err);
        return next(new HttpError("Unable to create new world. Please try again later", 500));
    }

  res.status(201).json({world: newWorld});
};

const createSubject = async (req, res, next) => {
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

  let { subjectName, cardImg, hasImg, desc, world, subjectType } = req.body;

  const newSubject = WorldSubject({
    subjectType,
    subjectName,
    cardImg,
    hasImg,
    desc,
    world,
  });

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await newSubject.save({ session: sess });
    switch (subjectType) {
      case "country":
        homeWorld.countries.push(newSubject);
        break
      case "religion":
        homeWorld.religions.push(newSubject);
        break
      case "mythology":
        homeWorld.mythologies.push(newSubject);
        break
      case "conflict":
        homeWorld.conflicts.push(newSubject);
        break
      case "magic":
        homeWorld.magics.push(newSubject);
        break
      case "ecology":
        homeWorld.ecologies.push(newSubject);
        break
      case "faction":
        homeWorld.factions.push(newSubject);
        break
      case "miscellaneous":
        homeWorld.misc.push(newSubject);
        break
      default:
        return next(new HttpError("Invalid subject type. Please check and try again", 422));
    }
    await homeWorld.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    console.log(err);
    return next(
      new HttpError("Could not create country. Please try again later", 500)
    );
  }

  res.status(201).json({ country: newSubject });
};

exports.createWorld = createWorld;
exports.createSubject = createSubject;