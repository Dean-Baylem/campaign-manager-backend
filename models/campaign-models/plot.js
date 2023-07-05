const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const plotSchema = new Schema({
  act: { type: Number, default: 1 },
  name: { type: String },
  description: { type: String },
  levelStart: { type: Number, default: 1 },
  levelFinish: { type: Number, default: 3 },
  ongoing: { type: Boolean, default: true, },
  visible: { type: Boolean, default: false },
  campaign: { type: mongoose.Types.ObjectId, required: true, ref: "Campaign" },
});

module.exports = mongoose.model("Plot", plotSchema);