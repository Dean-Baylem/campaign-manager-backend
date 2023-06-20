const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const HttpError = require("../../models/http-error");
const Campaign = require("../../models/campaign-models/campaign");
const Player = require("../../models/player");
const World = require("../../models/worldbuilding-models/world");
const NPC = require("../../models/campaign-models/NPC");

const createNPC = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid inputs, please try again!", 422));
  }

  let campaign;
  try {
    campaign = await Campaign.findById(req.params.campaignid);
  } catch (err) {
    return next(
      new HttpError(
        "Unable to find Campaign for this npc. Please check and try again.",
        422
      )
    );
  }

  let { name, species, occupation, appearance, age, npcImg, npcToken, notes, secretNotes, villain, faction } =
    req.body;

  const newNPC = NPC({
    name,
    species,
    age,
    npcImg,
    npcToken,
    notes,
    secretNotes,
    villain,
    occupation,
    appearance,
    faction,
    campaign: req.params.campaignid,
  });

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await newNPC.save({ session: sess });
    campaign.npcs.push(newNPC);
    await campaign.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    return next(
      new HttpError(
        "Unable to create new npc at this time, please try again later",
        500
      )
    );
  }

  res.status(201).json({ npc: newNPC.toObject({ getters: true }) });
};

const getNPCById = async (req, res, next) => {
  let npc;
  try {
    npc = await NPC.findById(req.params.npcid);
  } catch (err) {
    return next(
      new HttpError(
        "Unable to find npc. Please check inputs and try again",
        500
      )
    );
  }

  res.status(200).json({ npc: npc.toObject({ getters: true }) });
};

const getNPCsByCampaignId = async (req, res, next) => {
  let npcs;
  const campaignId = req.params.campaignid;
  try {
    npcs = await NPC.find({campaign: campaignId})
  } catch (err) {
    return next(new HttpError("Unable to find via Campaign Id - please check and try again", 422));
  }

  res.status(200).json({npcs: npcs});
}

const updateNPC = async (req, res, next) => {

  let npc;
  try {
    npc = await NPC.findById(req.params.npcid);
  } catch (err) {
    return next(
      new HttpError(
        "Unable to find character. Please check inputs and try again",
        500
      )
    );
  }

  let { name, species, age, notes, secretNotes, villain, occupation, appearance, faction } = req.body;

  npc.name = name;
  npc.species = species;
  npc.age = age;
  npc.notes = notes;
  npc.secretNotes = secretNotes;
  npc.villain = villain;
  npc.occupation = occupation;
  npc.appearance = appearance;
  if (faction !== "") { 
    npc.faction = faction;
  }

  try {
    await npc.save();
  } catch (err) {
    return next(
      new HttpError("Unable to save changes. Please try again later.", 500)
    );
  }

  res.status(200).json({ npc: npc.toObject({ getters: true }) });
};

const deleteNPC = async (req, res, next) => {
  let npc;
  try {
    npc = await NPC.findById(req.params.npcid).populate("campaign").populate("faction");
  } catch (err) {
    return next(
      new HttpError(
        "Unable to find npc to delete. Please check details and try again",
        500
      )
    );
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await npc.deleteOne({ session: sess });
    npc.campaign.npcs.pull(npc);
    await npc.campaign.save({ session: sess });
    if (npc.faction !== null) {
    npc.faction.members.pull(npc);
    await npc.faction.save({session: sess});
    }
    await sess.commitTransaction();
  } catch (err) {
    return next(new HttpError("Could not delete. Please try again later", 500));
  }

  res.status(200).json({message: "NPC deleted!"});
};

exports.createNPC = createNPC;
exports.getNPCById = getNPCById;
exports.getNPCsByCampaignId = getNPCsByCampaignId;
exports.updateNPC = updateNPC;
exports.deleteNPC = deleteNPC;
