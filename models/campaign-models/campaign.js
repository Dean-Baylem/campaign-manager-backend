const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const campaignSchema = new Schema({
  campaignName: { type: String, required: true },
  gameMaster: { type: mongoose.Types.ObjectId, ref: "Player" },
  party: [{ type: mongoose.Types.ObjectId, ref: "Character" }],
  partyLevel: { type: Number, default: 1 },
  npcs: [{ type: mongoose.Types.ObjectId, ref: "NPC" }],
  bbeg: {type: mongoose.Types.ObjectId, ref: "NPC"},
  world: { type: mongoose.Types.ObjectId, required: true, ref: "World" },
  plot: { type: String },
  sessions: [{ type: mongoose.Types.ObjectId, ref: "Session" }],
  events: [{ type: mongoose.Types.ObjectId, ref: "Event" }],
  factions: [{ type: mongoose.Types.ObjectId, ref: "Faction" }],
  objectives: [{type: mongoose.Types.ObjectId, ref: "Objective"}],
  locations: [{type: mongoose.Types.ObjectId, ref: "Location"}]
});

module.exports = mongoose.model('Campaign', campaignSchema);