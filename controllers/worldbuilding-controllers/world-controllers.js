const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const HttpError = require("../../models/http-error");
const Player = require("../../models/user");
const World = require("../../models/worldbuilding-models/world");
const Country = require('../../models/worldbuilding-models/subject-models/country');


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


exports.createWorld = createWorld;