const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// In the future I will add NPC's and stores to this Schema

const locationSchema = new Schema({
    locationName: { type: String, required: true },
    locationDesc: { type: String },
    currentLoaction: { type: Boolean, default: false },
    campaign: { type: mongoose.Types.ObjectId, required: true, ref: "Campaign" }
})

module.exports = mongoose.model('Location', locationSchema);