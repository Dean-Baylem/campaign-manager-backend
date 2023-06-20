const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const itemSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  rarity: { type: String, required: true },
  attunement: { type: Boolean, required: true },
  source: {type: String, required: true }
});

module.exports = mongoose.model("Item", itemSchema);
