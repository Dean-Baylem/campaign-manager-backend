const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const NPCSchema = new Schema({
  name: { type: String, required: true },
  species: { type: String, required: true },
  occupation: { type: String, default: "Unknown" },
  age: { type: Number, default: null },
  appearance: {type: String},
  npcImg: { type: String, default: "#" },
  npcToken: { type: String, default: "#" },
  notes: {type: String},
  secretNotes: {type: String},
  villain: { type: Boolean, default: false },
  campaign: { type: mongoose.Types.ObjectId, required: true, ref: "Campaign" },
  faction: { type: mongoose.Types.ObjectId, required: false, ref: "Faction", default: null },
});

module.exports = mongoose.model("NPC", NPCSchema);