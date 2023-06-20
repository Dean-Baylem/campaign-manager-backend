const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const HttpError = require("../../models/http-error");
const Campaign = require("../../models/campaign-models/campaign");
const Recap = require("../../models/campaign-models/recap");

const addRecap = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid inputs. Please try again!", 422));
  }

  let campaign;
  try {
    campaign = await Campaign.findById(req.params.campaignid);
  } catch (err) {
    return next(new HttpError("Finding campaign details failed.", 500));
  }

  const { title, subtitle, notes, secretNotes } = req.body;

  const newRecap = Recap({
    title,
    subtitle,
    notes,
    secretNotes,
    campaign: req.params.campaignid,
  });

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await newRecap.save({ session: sess });
    campaign.recaps.push(newRecap);
    await campaign.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    console.log(err);
    return next(
      new HttpError(
        "Unable to create new Recap at this time, please try again later",
        500
      )
    );
  }

  res.status(201).json({ recap: newRecap.toObject({ getters: true }) });
};

const getRecapsByCampaignId = async (req, res, next) => {
  let recaps = [];
  try {
    recaps = await Recap.find({ campaign: req.params.campaignid });
  } catch (err) {
    return next(
      new HttpError("Unable to find Recaps. Please try again later.", 500)
    );
  }

  if (recaps.length === 0) {
    res.status(200).json({ recaps: "none" });
  } else {
    res.status(200).json({ recaps: recaps });
  }
};

const getRecapById = async (req, res, next) => {
  let recap;
  try {
    recap = await Recap.findById(req.params.recapid);
  } catch (err) {
    return next(
      new HttpError("Unable to find recaps. Please try again later.", 500)
    );
  }

  res.status(200).json({ recap: recap.toObject({ getters: true }) });
};

const updateRecapById = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid inputs. Please try again!", 422));
  }

  let recap;
  try {
    recap = await Recap.findById(req.params.recapid);
  } catch (err) {
    return next(
      new HttpError("Unable to find recap. Please try again later.", 500)
    );
  }

  const { title, subtitle, notes, secretNotes } = req.body;

  recap.title = title;
  recap.subtitle = subtitle;
  recap.notes = notes;
  recap.secretNotes = secretNotes;

  try {
    await recap.save();
  } catch (err) {
    return next(
      new HttpError("Unable to update. Please try again later.", 500)
    );
  }

  res.status(200).json({ recap: recap.toObject({ getters: true }) });
};

const deleteRecapById = async (req, res, next) => {
  let recap;

  try {
    recap = await Recap.findById(req.params.recapid).populate("campaign");
  } catch (err) {
    return next(new HttpError("Unable to find recap. Please try again later.", 500));
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await recap.deleteOne({ session: sess });
    recap.campaign.recaps.pull(recap);
    await recap.campaign.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    return next(new HttpError("Could not delete. Please try again later", 500));
  }

  res.status(200).json({message: "delete successful"});
};

exports.addRecap = addRecap;
exports.getRecapsByCampaignId = getRecapsByCampaignId;
exports.getRecapById = getRecapById;
exports.updateRecapById = updateRecapById;
exports.deleteRecapById = deleteRecapById;
