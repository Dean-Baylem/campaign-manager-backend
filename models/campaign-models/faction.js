const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const factionSchema = new Schema({
  factionName: { type: String, required: true },
  factionMotto: {type: String },
  factionToken: { type: String },
  factionDesc: {type: String, required: true},
  factionNotes: [{title: {type: String}, note: {type: String}}],
  members: [{ type: mongoose.Types.ObjectId, ref: "NPC" }],
  campaign: { type: mongoose.Types.ObjectId, required: true, ref: "Campaign" },
});

module.exports = mongoose.model('Faction', factionSchema);