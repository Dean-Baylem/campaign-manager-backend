const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const worldSchema = new Schema({
  worldName: { type: String, required: true },
  worldMap: { type: String },
  worldDesc: { type: String, required: true },
  creator: { type: mongoose.Types.ObjectId, required: true, ref: 'Player' },
  campaigns: [{ type: mongoose.Types.ObjectId, required: true, ref: "Campaign" }],
  countries: [
    { type: mongoose.Types.ObjectId, required: true, ref: "Country" },
  ],
  religions: [
    { type: mongoose.Types.ObjectId, required: true, ref: "Religion" },
  ],
  mythologies: [
    { type: mongoose.Types.ObjectId, required: true, ref: "Mythology" },
  ],
  conflicts: [
    { type: mongoose.Types.ObjectId, required: true, ref: "Conflict" },
  ],
  magics: [{ type: mongoose.Types.ObjectId, required: true, ref: "Magic" }],
  ecologies: [
    { type: mongoose.Types.ObjectId, required: true, ref: "Ecology" },
  ],
  factions: [{ type: mongoose.Types.ObjectId, required: true, ref: "Faction" }],
  comologies: [
    { type: mongoose.Types.ObjectId, required: true, ref: "Cosmology" },
  ],
  misc: [
    { type: mongoose.Types.ObjectId, required: true, ref: "Miscellaneous" },
  ],
  heroicEvents: [
    { type: mongoose.Types.ObjectId, required: true, ref: "HeroicEvent" },
  ],
  comments: [
    { type: mongoose.Types.ObjectId, required: true, ref: "Comment" },
  ],
});

module.exports = mongoose.model('World', worldSchema);