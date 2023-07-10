const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const HttpError = require("../../models/http-error");
const Campaign = require("../../models/campaign-models/campaign");
const NPC = require("../../models/campaign-models/NPC");
const Faction = require("../../models/campaign-models/faction");

const invalidEntry = "Invalid inputs, please check and try again";

const createFaction = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError(invalidEntry, 422));
  }

  let campaign;
  try {
    campaign = await Campaign.findById(req.params.campaignid);
  } catch (err) {
    return next(new HttpError(invalidEntry, 422));
  }

  let { factionName, factionMotto, factionToken, factionDesc } = req.body;

  const newFaction = Faction({
    factionName,
    factionMotto,
    factionDesc,
    factionToken,
    campaign: req.params.campaignid,
  });

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await newFaction.save({ session: sess });
    campaign.factions.push(newFaction);
    await campaign.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    return next(
      new HttpError("Unable to create new faction, please try again later", 500)
    );
  }

  res.status(201).json({ faction: newFaction.toObject({ getters: true }) });
};

const addFactionMembers = async (req, res, next) => {
  if (req.body.newMembers.length === 0) {
    return next(new HttpError("Please select NPC's to add.", 422));
  }

  let faction;
  try {
    faction = await Faction.findById(req.params.factionid);
  } catch (err) {
    return next(
      new HttpError("Please check the Faction details and try again", 422)
    );
  }

  for (let i = 0; i < req.body.newMembers.length; i++) {
    let npc;
    try {
      npc = await NPC.findById(req.body.newMembers[i]);
    } catch (err) {
      return err;
    }

    try {
      const sess = await mongoose.startSession();
      sess.startTransaction();
      faction.members.push(req.body.newMembers[i]);
      await faction.save({ session: sess });
      npc.faction = req.params.factionid;
      await npc.save({ session: sess });
      await sess.commitTransaction();
    } catch (err) {
      return next(
        new HttpError(
          "Unable to add NPC's to faction. Please try again later",
          500
        )
      );
    }
  }

  res
    .status(200)
    .json({ message: "All NPC's added to faction!", faction: faction });
};

const removeFactionMembers = async (req, res, next) => {
  if (req.body.toRemove.length === 0) {
    return next(new HttpError("Please select members to delete"), 422);
  }

  let faction;
  try {
    faction = await Faction.findById(req.params.factionid);
  } catch (err) {
    return next(
      new HttpError(
        "Unable to find faction. Please check details and try again",
        422
      )
    );
  }

  for (let i = 0; i < req.body.toRemove.length; i++) {
    let npc;
    try {
      npc = await NPC.findById(req.body.toRemove[i]);
    } catch (err) {}

    try {
      const sess = await mongoose.startSession();
      sess.startTransaction();
      faction.members.pull(npc);
      await faction.save({ session: sess });
      npc.faction = null;
      await npc.save({ session: sess });
      await sess.commitTransaction();
    } catch (err) {
      return next(
        new HttpError(
          "Could not remove NPC at this time. Please try again later",
          500
        )
      );
    }
  }

  res.status(200).json({
    message: "NPC's removed from Faction.",
    faction: faction.toObject({ getters: true }),
  });
};

const getFactionById = async (req, res, next) => {
  let faction;
  try {
    faction = await Faction.findById(req.params.factionid)
      .populate({ path: "campaign", select: "gameMaster" })
      .populate("members");
  } catch (err) {
    return next(
      new HttpError(
        "Unable to find faction. Please check details and try again",
        422
      )
    );
  }

  res.status(200).json({ faction: faction });
};

const getFactionsByCampaignId = async (req, res, next) => {
  let factions;
  let campaignId = req.params.campaignid;
  try {
    factions = await Faction.find({ campaign: campaignId });
  } catch (err) {
    console.log(err);
    return next(
      new HttpError("Please check campaign details and try again", 422)
    );
  }

  res.status(200).json({ factions: factions });
};

const deleteFactionById = async (req, res, next) => {
  let faction;
  try {
    faction = await Faction.findById(req.params.factionid)
      .populate("members")
      .populate("campaign");
  } catch (err) {
    return next(
      new HttpError(
        "Unable to find Faction, please check the details and try again",
        422
      )
    );
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    for (let i = 0; i < faction.members.length; i++) {
      faction.members[i].faction = null;
      await faction.members[i].save({ session: sess });
    }
    await faction.deleteOne({ session: sess });
    faction.campaign.factions.pull(faction);
    await faction.campaign.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    console.log(err);
  }

  res.status(200).json({ message: "Faction Deleted!" });
};

const updateFaction = async (req, res, next) => {
  let faction;
  try {
    faction = await Faction.findById(req.params.factionid);
  } catch (err) {
    return next(
      new HttpError(
        "Unable to find faction. Please check details and try again",
        422
      )
    );
  }

  let { factionName, factionMotto, factionToken, factionDesc } = req.body;

  faction.factionName = factionName;
  faction.factionMotto = factionMotto;
  faction.factionToken = factionToken;
  faction.factionDesc = factionDesc;

  try {
    await faction.save();
  } catch (err) {
    return next(
      new HttpError(
        "Unable to save changes at this time. Please try again later",
        500
      )
    );
  }

  res
    .status(200)
    .json({
      message: "Update complete",
      faction: faction.toObject({ getters: true }),
    });
};

const addFactionNote = async (req, res, next) => {
  let faction;
  try {
    faction = await Faction.findById(req.params.factionid);
  } catch (err) {
    return next(
      new HttpError(
        "Unable to find Faction with details provided. Please check and try again",
        422
      )
    );
  }

  let { title, note } = req.body;
  const newNote = {
    title,
    note,
  };

  try {
    faction.factionNotes.push(newNote);
    await faction.save();
  } catch (err) {
    return next(
      new HttpError("Unable to save note. Please try again later", 500)
    );
  }

  res.status(201).json({ message: "Node added", note: newNote });
};

const editFactionNote = async (req, res, next) => {
  let faction;
  try {
    faction = await Faction.findById(req.params.factionid);
  } catch (err) {
    return next(
      new HttpError(
        "Unable to find faction this note is for, please check details and try again",
        422
      )
    );
  }

  let notes = faction.factionNotes.filter(
    (note) => note.id !== req.params.noteid
  );

  let { title, note } = req.body;

  let editedNote = {
    title,
    note,
  };

  notes.push(editedNote);

  faction.factionNotes = notes;

  try {
    await faction.save();
  } catch (err) {
    return next(
      new HttpError("Unable to save at this time. Please try again later.", 500)
    );
  }

  res
    .status(200)
    .json({ message: "Okay!", factionNotes: faction.factionNotes });
};

exports.createFaction = createFaction;
exports.addFactionMembers = addFactionMembers;
exports.removeFactionMembers = removeFactionMembers;
exports.getFactionById = getFactionById;
exports.getFactionsByCampaignId = getFactionsByCampaignId;
exports.deleteFactionById = deleteFactionById;
exports.updateFaction = updateFaction;
exports.addFactionNote = addFactionNote;
exports.editFactionNote = editFactionNote;
