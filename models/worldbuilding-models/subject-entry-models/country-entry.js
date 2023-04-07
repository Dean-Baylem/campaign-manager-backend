const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const countryEntrySchema = new Schema({
    entryTitle: { type: String, required: true },
    entryDesc: { type: String, required: true },
    hasImg: { type: Boolean, default: false },
    entryImg: { type: String },
    country: { type: mongoose.Types.ObjectId, required: true, ref: "Country"},
})

module.exports("CountryEntry", countryEntrySchema);