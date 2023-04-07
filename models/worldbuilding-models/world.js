const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const worldSchema = new Schema({
  worldName: { type: String, required: true },
  worldMap: { type: String },
  worldDesc: { type: String, required: true },
  creator: { type: mongoose.Types.ObjectId, required: true, ref: "Player" },
  campaigns: [
    { type: mongoose.Types.ObjectId, required: true, ref: "Campaign" },
  ],
  countries: [
    { type: mongoose.Types.ObjectId, required: true, ref: "WorldSubject" },
  ],
  religions: [
    { type: mongoose.Types.ObjectId, required: true, ref: "WorldSubject" },
  ],
  mythologies: [
    { type: mongoose.Types.ObjectId, required: true, ref: "WorldSubject" },
  ],
  conflicts: [
    { type: mongoose.Types.ObjectId, required: true, ref: "WorldSubject" },
  ],
  magics: [
    { type: mongoose.Types.ObjectId, required: true, ref: "WorldSubject" },
  ],
  ecologies: [
    { type: mongoose.Types.ObjectId, required: true, ref: "WorldSubject" },
  ],
  factions: [
    { type: mongoose.Types.ObjectId, required: true, ref: "WorldSubject" },
  ],
  comologies: [
    { type: mongoose.Types.ObjectId, required: true, ref: "WorldSubject" },
  ],
  misc: [
    { type: mongoose.Types.ObjectId, required: true, ref: "WorldSubject" },
  ],
  heroicEvents: [
    { type: mongoose.Types.ObjectId, required: true, ref: "HeroicEvent" },
  ],
  comments: [{ type: mongoose.Types.ObjectId, required: true, ref: "Comment" }],
});

module.exports = mongoose.model('World', worldSchema);