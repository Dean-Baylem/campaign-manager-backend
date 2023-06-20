const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const objectiveSchema = new Schema({
    objectiveTitle: { type: String, required: true },
    objectiveDesc: { type: String },
    main: { type: Boolean, default: false },
    completed: { type: Boolean, default: false },
    successful: {type: Boolean, default: false },
    campaign: { type: mongoose.Types.ObjectId, required: true, ref: "Campaign"}
})

module.exports = mongoose.model('Objective', objectiveSchema);