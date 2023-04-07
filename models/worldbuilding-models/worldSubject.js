const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const worldSubjectSchema = new Schema({
  subjectType: {type: String, required: true },
  subjectName: { type: String, required: true },
  cardImg: { type: String },
  hasImg: { type: Boolean, default: false },
  desc: { type: String, required: true },
  records: [{ type: mongoose.Types.ObjectId, required: true, ref: "Record" }],
  world: { type: mongoose.Types.ObjectId, required: true, ref:"World"},
});

module.exports = mongoose.model("WorldSubject", worldSubjectSchema);