const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const characterSchema = new Schema({
  name: { type: String, required: true },
  species: { type: String, required: true },
  age: { type: String, required: true },
  playerClass: { type: String, required: true },
  subclass: { type: String },
  level: { type: Number, required: true },
  appearance: { type: String },
  description: { type: String },
  notes: { type: String },
  secretNotes: { type: String },
  DMNotes: { type: String },
  active: { type: Boolean },
  player: { type: mongoose.Types.ObjectId, ref: "Player", required: true },
  campaign: { type: mongoose.Types.ObjectId, required: true, ref: "Campaign" },
});

module.exports = mongoose.model('Character', characterSchema);