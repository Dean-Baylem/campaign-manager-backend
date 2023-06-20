const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const WildMagicTable = require("../models/tool-models/wildMagicTable");
const Player = require("../models/player");
const Item = require("../models/item");

// Allows additional Items to be added.
// First Additions made via Postman.
const addItmes = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Incorrect inputs, please check and try again.", 422)
    );
  }

  let items = req.body;

  for (let i = 0; i < items.length; i++) {
    const newItem = new Item({
      name: items[i].Name,
      type: items[i].Type,
      rarity: items[i].Rarity,
      attunement: items[i].Attunement === "yes" ? true : false,
      source: items[i].Source,
    });

    await newItem.save();
  }

  res.status(200).json({ message: "Okay" });
};

const getItems = async (req, res, next) => {
  let { itemType, itemRarity } = req.body;

  let items;
  try {
    items = await Item.find({ type: itemType, rarity: itemRarity });
  } catch (err) {
    return next(new HttpError("There was an error. Please try again", 500));
  }

  res.status(200).json({ items: items });
};

// Wild Magic CRUD Functions

const addWildMagicTable = async (req, res, next) => {
  let player;
  try {
    player = await Player.findById(req.params.playerid);
  } catch (err) {
    return next(
      new HttpError("Unable to find Player. Please check and try again.", 422)
    );
  }

  let { name, list } = req.body;

  const newTable = new WildMagicTable({
    name,
    list,
    player: req.params.playerid,
  });

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await newTable.save({ session: sess });
    player.wildMagicTables.push(newTable);
    await player.save();
    await sess.commitTransaction();
  } catch (err) {
    console.log(err);
    return next(
      new HttpError(
        "Unable to create new wild magic table at this time, please try again later",
        500
      )
    );
  }

  res.status(201).json({ table: newTable.toObject({ getters: true }) });
};

const getWildMagicTablesByPlayerId = async (req, res, next) => {
  let tables;
  try {
    tables = await WildMagicTable.find({ player: req.params.playerid });
  } catch (err) {
    return next(
      new HttpError("Unable to find Tables. Please try again later.", 500)
    );
  }

  if (tables.length === 0) {
    res.status(200).json({ tables: [] });
  } else {
    res.status(200).json({ tables: tables });
  }
};

const updateWildMagicTable = async (req, res, next) => {
  let tableToUpdate;
  try {
    tableToUpdate = await WildMagicTable.findById(req.params.tableid);
  } catch (err) {
    return next(
      new HttpError("Unable to find Table. Please try again later.", 500)
    );
  }

  const { name, list } = req.body;

  tableToUpdate.name = name;
  tableToUpdate.list = list.list;

  try {
    await tableToUpdate.save();
  } catch (err) {
    console.log(err)
    return next(
      new HttpError("Unable to update. Please try again later.", 500)
    );
  }

  res.status(200).json({ table: tableToUpdate.toObject({ getters: true }) });
};

const deleteWildMagicTableById = async (req, res, next) => {
  let wildMagicTable;
  try {
    wildMagicTable = await WildMagicTable.findById(req.params.tableid).populate(
      "player"
    );
  } catch (err) {
    console.log(err);
    return next(
      new HttpError("Unable to find Table. Please try again later.", 500)
    );
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await wildMagicTable.deleteOne({ session: sess });
    wildMagicTable.player.wildMagicTables.pull(wildMagicTable);
    await wildMagicTable.player.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    console.log(err);
    return next(new HttpError("Could not delete. Please try again later", 500));
  }

  res.status(200).json({ message: "Deleted" });
};

const setStandardTable = async (req, res, next) => {
  const { name, list } = req.body;

  const standardTable = new WildMagicTable({
    name,
    list,
  });

  try {
    standardTable.save();
  } catch (err) {
    console.log(err);
  }
};

const getStandardTable = async (req, res, next) => {
  let table;
  try {
    table = await WildMagicTable.find({ name: "Standard Table" });
  } catch (err) {
    console.log(err);
  }

  res.status(200).json({ table: table });
};

exports.addItmes = addItmes;
exports.getItems = getItems;

// Wild Magic Exports
exports.addWildMagicTable = addWildMagicTable;
exports.getWildMagicTablesByPlayerId = getWildMagicTablesByPlayerId;
exports.updateWildMagicTable = updateWildMagicTable;
exports.deleteWildMagicTableById = deleteWildMagicTableById;
exports.getStandardTable = getStandardTable;
exports.setStandardTable = setStandardTable;
