const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const HttpError = require("../models/http-error");
const Player = require("../models/player");
const World = require("../models/worldbuilding-models/world");
const Comment = require("../models/comment");

// Controllers for comments on world pages.

const addWorldComment = async (req, res, next) => {
  let player;
  let world;

  try {
    player = await Player.findById(req.params.playerid);
    world = await World.findById(req.params.worldid);
  } catch (err) {
    return next(
      new HttpError("Please check credentials and then try again.", 422)
    );
  }

  const newComment = new Comment({
    body: req.body.body,
    player: req.params.playerid,
    world: req.params.worldid,
  });

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await newComment.save({ session: sess });
    player.comments.push(newComment);
    await player.save({ session: sess });
    world.comments.push(newComment);
    await world.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    console.log(err);
    return next(
      new HttpError(
        "Unable to add comment at this time. Please try again later.",
        500
      )
    );
  }

  res.status(201).json({ message: "Comment added." });
};

const updateCommentById = async (req, res, next) => {
  let comment;
  try {
    comment = await Comment.findById(req.params.commentid);
  } catch (err) {
    return next(
      new HttpError("Unable to find comment. Please try again later", 500)
    );
  }

  comment.body = req.body.body;
  try {
    await comment.save();
  } catch (err) {
    return next(
      new HttpError("Unable to save changes. Please try again later.", 500)
    );
  }

  res.status(200).json({ message: "Comment updated." });
};

const deleteCommentById = async (req, res, next) => {
  let comment;
  try {
    comment = await Comment.findById(req.params.commentid).populate("player").populate("world");
  } catch (err) {
    return next(new HttpError("Unable to find comment", 422));
  }

  console.log(comment);

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await comment.deleteOne({session: sess});
    comment.world.comments.pull(comment);
    await comment.world.save({session: sess});
    comment.player.comments.pull(comment);
    await comment.player.save({session: sess});
    await sess.commitTransaction();
  } catch (err) {
    console.log(err);
    return next(new HttpError("Unable to delete at this time, please try again later.", 500));
  }


  res.status(200).json({message: "Comment Deleted!"});
};

exports.addWorldComment = addWorldComment;
exports.updateCommentbyId = updateCommentById;
exports.deleteCommentById = deleteCommentById;
