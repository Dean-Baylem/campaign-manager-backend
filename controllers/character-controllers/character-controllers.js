const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const HttpError = require("../../models/http-error");
const Campaign = require("../../models/campaign-models/campaign");
const Player = require("../../models/player");
const World = require("../../models/worldbuilding-models/world");
const Character = require("../../models/campaign-models/character");

const createCharacter = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid inputs, please try again!", 422));
  }

  let player;
  let campaign;
  try {
    player = await Player.findById(req.params.playerid);
    campaign = await Campaign.findById(req.params.campaignid);
  } catch (err) {
    return next(
      new HttpError(
        "Unable to find Player or Campaign for this character. Please check and try again.",
        422
      )
    );
  }

  let { name, species, age, playerClass, subclass, level, active, appearance, description } = req.body;

  const newCharacter = Character({
    name,
    species,
    age,
    playerClass,
    subclass: subclass || "none",
    level: level || 1,
    active: active || false,
    appearance,
    description,
    player: req.params.playerid,
    campaign: req.params.campaignid,
  });

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await newCharacter.save({ session: sess });
    player.characters.push(newCharacter);
    await player.save();
    campaign.party.push(newCharacter);
    await campaign.save();
    await sess.commitTransaction();
  } catch (err) {
    console.log(err);
    return next(
      new HttpError(
        "Unable to create new character at this time, please try again later",
        500
      )
    );
  }

  res.status(201).json({ character: newCharacter.toObject({ getters: true }) });
};

const updateCharacter = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid inputs, please try again!", 422));
  }

  const characterId = req.params.characterid;

  let character;
  try {
    character = await Character.findById(characterId);
  } catch (err) {
    return next(
      new HttpError(
        "Unable to find character. Please check inputs and try again",
        500
      )
    );
  }

  const { name, species, age, playerClass, subclass, level, appearance, description } = req.body;

  character.name = name;
  character.species = species;
  character.age = age;
  character.playerClass = playerClass;
  character.subclass = subclass;
  character.level = level;
  character.appearance = appearance;
  character.description = description;

  try {
    await character.save();
  } catch (err) {
    return next(
      new HttpError("Unable to save changes. Please try again later.", 500)
    );
  }

  res.status(200).json({ character: character.toObject({ getters: true }) });
};

const getCharacterById = async (req, res, next) => {
  const characterId = req.params.characterid;

  let character;
  try {
    character = await Character.findById(characterId);
  } catch (err) {
    return next(
      new HttpError(
        "Unable to find character. Please check inputs and try again",
        500
      )
    );
  }

  res.status(200).json({ character: character.toObject({ getters: true }) });
};

const getCharactersByCampaignId = async (req, res, next) => {
  const campaignId = req.params.campaignid;
  let characters
  try {
    characters = await Character.find({campaign: campaignId});
  } catch (err) {
    return next(new HttpError("Unable to find characters, please check campaign details and try again"));
  }

  res.status(200).json({characters: characters});
}

const deleteCharacter = async (req, res, next) => {
  const characterId = req.params.characterid;

  let character;
  try {
    character = await Character.findById(characterId)
      .populate("campaign")
      .populate("player");
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
    await character.deleteOne({ session: sess });
    character.campaign.party.pull(character);
    await character.campaign.save({ session: sess });
    character.player.characters.pull(character);
    await character.player.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    console.log(err);
    return next(new HttpError("Could not delete. Please try again later", 500));
  }

  res.status(200).json({ message: "Character deleted Successfully!" });
};

exports.createCharacter = createCharacter;
exports.getCharacterById = getCharacterById;
exports.getCharactersByCampaignId = getCharactersByCampaignId;
exports.updateCharacter = updateCharacter;
exports.deleteCharacter = deleteCharacter;
