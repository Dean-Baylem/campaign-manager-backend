const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const recordsSchema = new Schema({
    recordTitle: {type: String, required: true},
    recordDesc: {type: String, required: true},
    subject: { type: mongoose.Types.ObjectId, required: true, ref: "WorldSubject" }
});

module.exports = mongoose.model("Record", recordsSchema);