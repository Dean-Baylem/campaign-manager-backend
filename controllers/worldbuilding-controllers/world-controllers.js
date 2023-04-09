const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const HttpError = require("../../models/http-error");
const Player = require("../../models/user");
const World = require("../../models/worldbuilding-models/world");
const WorldSubject = require("../../models/worldbuilding-models/worldSubject");

const getWorldById = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid inputs. Please try again.", 422));
  }

  const worldId = req.params.worldid;

  let world;
  try {
    world = await World.findById(worldId);
  } catch (err) {
    console.log(err);
    return next(
      new HttpError("Unable to find world. Please try again later.", 500)
    );
  }

  if (!world) {
    return next(
      new HttpError(
        "Unable to locate world by id. Please check and try again.",
        404
      )
    );
  }

  res.json({ world: world.toObject({ getters: true }) });
};

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

const updateWorld = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid inputs. Please try again.", 422));
  }

  const { worldName, worldDesc } = req.body;
  const worldId = req.params.worldid;

  let world;
  try {
    world = await World.findById(worldId);
  } catch (err) {
    return next(new HttpError("Would not locate world on server. Please try again later", 500));
  }

  world.worldName = worldName;
  world.worldDesc = worldDesc;
  try {
    await world.save();
  } catch (err) {
    return next(
      new HttpError(
        "Would not locate world on server. Please try again later",
        500
      )
    );
  }

  res.status(200).json({world: world.toObject({ getters: true })});
}

const deleteWorldById = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid inputs. Please try again.", 422));
  }

  const worldId = req.params.worldid;

  let world;
  try {
    world = await World.findById(worldId).populate('creator');
  } catch (err) {
    return next(new HttpError("Unable to find world to delete. Please try again later.", 500));
  }
  

  if (!world) {
    return next(new HttpError("Could not find world. Please check details and try again.", 404));
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await world.deleteOne({session: sess});
    world.creator.worlds.pull(world);
    await world.creator.save({session: sess});
    await sess.commitTransaction();
  } catch (err) {
    return next(new HttpError("Could not delete. Please try again later", 500));
  }

  res.status(200).json({message: "World successfully deleted!"});
}


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
exports.updateWorld = updateWorld;
exports.getWorldById = getWorldById;
exports.deleteWorldById = deleteWorldById;
exports.createSubject = createSubject;