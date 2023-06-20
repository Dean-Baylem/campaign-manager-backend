const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const sessionSchema = new Schema({
  campaign: { type: mongoose.Types.ObjectId, required: true, ref: "Campaign" },
  day: { type: String, required: true },
  hour: { type: Number, required: true },
  mins: { type: Number, required: true },
  am: { type: Boolean, required: true },
  timeZone: { type: String, required: true },
  player: { type: mongoose.Types.ObjectId, required: true, ref: "Player" },
});

module.exports = mongoose.model("Session", sessionSchema);