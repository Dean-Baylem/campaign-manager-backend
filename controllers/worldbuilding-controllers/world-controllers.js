const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const HttpError = require("../../models/http-error");
const Player = require("../../models/user");
const World = require("../../models/worldbuilding-models/world");
const WorldSubject = require("../../models/worldbuilding-models/worldSubject");

const getWorldById = async (req, res, next) => {

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
    let { worldName, worldDesc } = req.body;

    const newWorld = World({
        worldName,
        worldDesc,
        creator: req.params.userid,
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

  let { subjectName, cardImg, hasImg, subjectDesc, subjectType } = req.body;

  const newSubject = WorldSubject({
    subjectType,
    subjectName,
    cardImg,
    hasImg,
    subjectDesc,
    world: req.params.worldid
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

const getSubjectById = async (req, res, next) => {

  subjectId = req.body.subjectId

  let subject;
  try {
    subject = await WorldSubject.findById(subjectId)
  } catch (err) {
    return next(new HttpError("Could not find subjects at this time. Please try again later.", 500));
  }

  if (!subject) {
    return next(new HttpError("Unable to find subject, please check inputs and try again.", 404));
  }

  res.status(200).json({subject: subject.toObject({getters: true})});

}

const getSubjectsByWorldId = async (req, res, next) => {
  const worldId = req.params.worldid;

  let subjects;

  try {
    subjects = await WorldSubject.find({world: worldId})
  } catch (err) {
    return next(new HttpError("There was a problem searching for subjects. Please try again later", 500));
  }

  if (!subjects) {
    return next(new HttpError("No subjects found for this world", 404));
  }

  res.status(200).json({allSubjects: subjects});
}

const updateSubjectById = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid inputs. Please try again.", 422));
  }

  let { subjectId, subjectName, subjectDesc } = req.body;

  let subject;
  try {
    subject = await WorldSubject.findById(subjectId)
  } catch (err) {
    return next(new HttpError("Could not find subject. Please try again later", 500));
  }

  if (!subject) {
    return next(new HttpError("Could not find subject. Please check details and try again.", 404));
  }

  subject.subjectName = subjectName;
  subject.subjectDesc = subjectDesc;
  try {
    await subject.save();
  } catch (err) {
    return next(new HttpError("Unable to save changes. Please try again later.", 500));
  }

  res.status(200).json({subject: subject.toObject({getters: true})});
}

const deleteSubjectById = async (req, res, next) => {
  const subjectId = req.body.subjectId;

  let subject;
  try {
    subject = await WorldSubject.findById(subjectId).populate('world');
  } catch (err) {
    return next(new HttpError("There was problem locating the subject. Please try again later.", 500));
  }

  if (!subject) {
    return next(new HttpError("Could not find subject, please check details and try again.", 404));
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await subject.deleteOne({ session: sess });
    switch (subject.subjectType) {
      case "country":
        subject.world.countries.pull(subject);
        break;
      case "religion":
        subject.world.religions.pull(subject);
        break;
      case "mythology":
        subject.world.mythologies.pull(subject);
        break;
      case "conflict":
        subject.world.conflicts.pull(subject);
        break;
      case "magic":
        subject.world.magics.pull(subject);
        break;
      case "ecology":
        subject.world.ecologies.pull(subject);
        break;
      case "faction":
        subject.world.factions.pull(subject);
        break;
      case "miscellaneous":
        subject.world.misc.pull(subject);
        break;
      default:
        break;
    }  
    await subject.world.save({session: sess});
    await sess.commitTransaction();
  } catch (err) {
    // console.log(err);
    return next(new HttpError("There was a problem deleting the subject. Please try again later.", 500));
  }

  res.status(200).json({ message: "Subject successfully deleted!" });
}

exports.createWorld = createWorld;
exports.updateWorld = updateWorld;
exports.getWorldById = getWorldById;
exports.deleteWorldById = deleteWorldById;
exports.createSubject = createSubject;
exports.updateSubjectById = updateSubjectById;
exports.getSubjectById = getSubjectById;
exports.getSubjectsByWorldId = getSubjectsByWorldId;
exports.deleteSubjectById = deleteSubjectById;