const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const eventSchema = new Schema({
    eventTitle: { type: String, required: true },
    eventDesc: { type: String, },
    eventType: { type: String, },
    eventImgs: [String],
    heroic: {type: Boolean},
    campaign: { type: mongoose.Types.ObjectId, required: true, ref: "Campaign"},
})

module.exports = mongoose.model("Event", eventSchema);