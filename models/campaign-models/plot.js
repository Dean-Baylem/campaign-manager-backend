const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const plotSchema = new Schema({
  act: { type: Number },
  name: { type: String },
  description: { type: String },
  levelStart: { type: Number },
  levelFinish: { type: Number },
  ongoing: { type: Boolean },
  visible: { type: Boolean },
  campaign: { type: mongoose.Types.ObjectId, required: true, ref: "Campaign" },
});

module.exports = mongoose.model("Plot", plotSchema);