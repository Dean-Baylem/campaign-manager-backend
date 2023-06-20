const mongoose = require("mongoose");

const HttpError = require("../../models/http-error");
const Campaign = require("../../models/campaign-models/campaign");
const Session = require("../../models/campaign-models/sessions");
const Player = require("../../models/player");

const createSession = async (req, res, next) => {
  let campaign;
  try {
    campaign = await Campaign.findById(req.params.campaignid);
  } catch (err) {
    return next(
      new HttpError(
        "Unable to find campaign. Please check details and try again",
        500
      )
    );
  }

  let player;
  try {
    player = await Player.findById(req.params.playerid);
  } catch (err) {
    return next(
      new HttpError(
        "Unable to find player. Please check details and try again",
        500
      )
    );
  }

  const { day, hour, mins, am, timeZone } = req.body;

  const newSession = new Session({
    day,
    hour,
    mins,
    am,
    timeZone,
    campaign: req.params.campaignid,
    player: req.params.playerid,
  });

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await newSession.save({ session: sess });
    campaign.sessions.push(newSession);
    await campaign.save({ session: sess });
    player.sessions.push(newSession);
    await player.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    console.log(err);
    return next(
      new HttpError("Failed to create session. Please try again later", 500)
    );
  }

  res.status(201).json({ session: newSession.toObject({ getters: true }) });
};

const getSessionById = async (req, res, next) => {
  let session;
  try {
    session = await Session.findById(req.params.sessionid);
  } catch (err) {
    return next(
      new HttpError(
        "Unable to find session. Please check details and try again",
        500
      )
    );
  }

  res.status(200).json({ session: session.toObject({ getters: true }) });
};

const getAllSessionsByCampaignId = async (req, res, next) => {
  let sessions;
  try {
    sessions = await Session.find({ campaign: req.params.campaignid });
  } catch (err) {
    return next(
      new HttpError(
        "Unable to find sessions. Please check details and try again",
        500
      )
    );
  }

  if (sessions.length === 0) {
    res.status(200).json({ message: "No Sessions found for this campaign" });
  } else {
    res.status(200).json({ sessions: sessions });
  }
};

const getAllSessionsByPlayerId = async (req, res, next) => {
  let sessions;
  try {
    sessions = await Session.find({ player: req.params.playerid });
  } catch (err) {
    return next(
      new HttpError(
        "Unable to find sessions. Please check details and try again",
        500
      )
    );
  }

  if (sessions.length === 0) {
    res.status(200).json({ message: "No Sessions found for this player" });
  } else {
    res.status(200).json({ sessions: sessions });
  }
};

const updateSession = async (req, res, next) => {
  let session;
  try {
    session = await Session.findById(req.params.sessionid);
  } catch (err) {
    return next(
      new HttpError(
        "Unable to find sessions. Please check details and try again",
        500
      )
    );
  }

  const { day, hour, mins, am, timeZone } = req.body;

  session.day = day;
  session.hour = hour;
  session.mins = mins;
  session.am = am;
  session.timeZone = timeZone;

  try {
    await session.save();
  } catch (err) {
    console.log(err);
    return next(
      new HttpError("Unable to update. Please check details and try again", 422)
    );
  }

  res.status(200).json({ session: session.toObject({ getters: true }) });
};

const deleteSession = async (req, res, next) => {
  let session;
  try {
    session = await Session.findById(req.params.sessionid).populate("player").populate("campaign");
  } catch (err) {
    return next(
      new HttpError(
        "Unable to find sessions. Please check details and try again",
        500
      )
    );
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await session.deleteOne({session: sess});
    session.campaign.sessions.pull(session);
    await session.campaign.save({session: sess});
    session.player.sessions.pull(session);
    await session.player.save({session: sess});
    await sess.commitTransaction();
  } catch (err) {
    return next(new HttpError("Could not delete. Please try again later", 500));
  }

  res.status(200).json({message: "Delete successful"});
};

exports.createSession = createSession;
exports.getSessionById = getSessionById;
exports.getAllSessionsByCampaignId = getAllSessionsByCampaignId;
exports.getAllSessionsByPlayerId = getAllSessionsByPlayerId;
exports.updateSession = updateSession;
exports.deleteSession = deleteSession;
