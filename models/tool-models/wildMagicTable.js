const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const wildMagicSchema = new Schema({
  player: { type: mongoose.Types.ObjectId, ref: "Player" },
  name: { type: String, required: true },
  list: [
    {
        id: {type: Number },
        die: {type: String },
        result: {type: String }
    }
  ]
});

module.exports = mongoose.model("WildMagicTable", wildMagicSchema);
