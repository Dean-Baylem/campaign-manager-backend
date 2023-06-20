const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const playerSchema = new Schema({
  playername: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  avatar: {
    type: String,
    default:
      "https://cdn-icons-png.flaticon.com/512/847/847970.png?w=740&t=st=1680774864~exp=1680775464~hmac=3c4b0fbb9ad31dba235c733a231ba12c905c2ba55faf334cf6b4b4ca5d639b80",
  },
  worlds: [{ type: mongoose.Types.ObjectId, required: true, ref: "World" }],
  campaigns: [{ type: mongoose.Types.ObjectId, ref: "Campaign" }],
  characters: [{ type: mongoose.Types.ObjectId, ref: "Character" }],
  sessions: [{ type: mongoose.Types.ObjectId, ref: "Character" }],
  wildMagicTables: [{ type: mongoose.Types.ObjectId, ref: "Character" }],
  comments: [{type: mongoose.Types.ObjectId, ref: "Comment"}]
});

module.exports = mongoose.model('Player', playerSchema);