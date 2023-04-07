const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const countrySchema = new Schema({
  countryName: { type: String, required: true },
  cardImg: { type: String },
  hasImg: { type: Boolean, default: false },
  desc: { type: String, required: true },
  countryRecords: [{ type: mongoose.Types.ObjectId, required: true, ref: "CountryRecord" }],
  world: { type: mongoose.Types.ObjectId, required: true, ref:"World"},
});

module.exports = mongoose.model("Country", countrySchema);