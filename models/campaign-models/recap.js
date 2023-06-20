const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const recapSchema = new Schema({
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  notes: { type: String },
  secretNotes: { type: String },
  campaign: { type: mongoose.Types.ObjectId, required: true, ref: "Campaign" },
  date: { type: String }
});

module.exports = mongoose.model("Recap", recapSchema);