const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const HttpError = require("../../models/http-error");
const Campaign = require("../../models/campaign-models/campaign");
const Player = require("../../models/player");
const World = require("../../models/worldbuilding-models/world");

const createCampaign = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid inputs. Please try again!", 422));
  }

  let { campaignName, worldId, partyLevel } = req.body;

  let player;
  try {
    player = await Player.findById(req.params.playerid);
  } catch (err) {
    return next(new HttpError("Finding player details failed.", 500));
  }

  if (!player) {
    return next(new HttpError("Please log in to make a new world.", 404));
  }

  let world;
  try {
    world = await World.findById(worldId);
  } catch (err) {
    return next(new HttpError("Finding world details failed.", 500));
  }

  if (!world) {
    return next(
      new HttpError("A campaign needs a world for it's setting.", 404)
    );
  }

  const newCampaign = Campaign({
    campaignName,
    partyLevel,
    gameMaster: req.params.playerid,
    world: worldId,
  });

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await newCampaign.save({ session: sess });
    player.campaigns.push(newCampaign);
    await player.save({ session: sess });
    world.campaigns.push(newCampaign);
    await world.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    return next(
      new HttpError("Failed to create new world. Please try again later", 500)
    );
  }

  res.status(201).json({ campaign: newCampaign.toObject({ getters: true }) });
};

const getCampaignById = async (req, res, next) => {
  const campaignID = req.params.campaignid;

  let campaign;
  try {
    campaign = await Campaign.findById(campaignID)
      .populate({ path: "gameMaster", select: "playername" })
      .populate({ path: "world" })
      .populate({path: "events"})
      .populate({path: "npcs"})
      .populate({path: "party"})
      .populate({path: "sessions"})
      .populate({path: "factions"})
      .populate({path: "locations"})
      .populate({path: "objectives"})
      .populate({path: "bbeg"})
      .populate({path: "plots"})
  } catch (err) {
    return next(
      new HttpError("Unable to find campaign, please try again later.", 500)
    );
  }

  if (!campaign) {
    return next(
      new HttpError(
        "No campaign found. Please check details and try again",
        404
      )
    );
  }

  res.status(200).json({ campaign: campaign.toObject({ getters: true }) });
};

const getCampaignsByplayerId = async (req, res, next) => {
  const playerId = req.params.playerid;

  let campaigns = [];
  try {
    campaigns = await Campaign.find({ gameMaster: playerId });
  } catch (err) {
    return next(
      new HttpError(
        "Unable to find player's campaigns. Please try again later.",
        500
      )
    );
  }

  if (campaigns.length === 0) {
    res.status(200).json({ campaigns: "none" });
  } else {
    res.status(200).json({ campaigns: campaigns });
  }
};

const updateCampaign = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid inputs. Please try again.", 422));
  }

  const { campaignName, partyLevel } = req.body;
  const campaignID = req.params.campaignid;

  let campaign;
  try {
    campaign = await Campaign.findById(campaignID);
  } catch (err) {
    return next(
      new HttpError(
        "Unable to find campaign on server, please try again later",
        500
      )
    );
  }

  campaign.campaignName = campaignName;
  campaign.partyLevel = partyLevel;
  try {
    await campaign.save();
  } catch (err) {
    return next(
      new HttpError(
        "Unable to save campaign updates. Please try again later",
        500
      )
    );
  }

  res.status(200).json({ campaign: campaign.toObject({ getters: true }) });
};

const deleteCampaign = async (req, res, next) => {
  const campaignID = req.params.campaignid;

  let campaign;
  try {
    campaign = await Campaign.findById(campaignID)
      .populate("gameMaster")
      .populate("world");
  } catch (err) {
    return next(
      new HttpError(
        "Unable to find campaign to delete. Please check details and try again",
        500
      )
    );
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await campaign.deleteOne({ session: sess });
    campaign.world.campaigns.pull(campaign);
    await campaign.world.save({ session: sess });
    campaign.gameMaster.campaigns.pull(campaign);
    await campaign.gameMaster.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    return next(new HttpError("Could not delete. Please try again later", 500));
  }

  res.status(200).json({ message: "Campaign deleted successfully!" });
};


const setMainVillain = async (req, res, next) => {
  let campaign;
  try {
    campaign = await Campaign.findById(req.params.campaignid);
  } catch (err) {
    return next(new HttpError("Unable to find the Campaign, please check the details", 422));
  }

  campaign.bbeg = req.params.npcid;
  try {
    campaign.save();
  } catch (err) {
    return next(new HttpError("Unable to save.", 500));
  }

  res.status(200).json({message: "Main Villain updated."});
}


exports.createCampaign = createCampaign;
exports.getCampaignById = getCampaignById;
exports.getCampaignsByplayerId = getCampaignsByplayerId;
exports.updateCampaign = updateCampaign;
exports.deleteCampaign = deleteCampaign;
exports.setMainVillain = setMainVillain;
