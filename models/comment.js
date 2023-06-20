const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    body: { type: String },
    player: { type: mongoose.Types.ObjectId, ref: "Player"},
    world: { type: mongoose.Types.ObjectId, ref: "World"}
})

module.exports = mongoose.model('Comment', commentSchema);