const mongoose = require("mongoose");

const AlertSchema = new mongoose.Schema(
  {
    message: { type: String, required: true },
    type: { type: String, enum: ["info", "warning", "danger"], default: "info" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Alert", AlertSchema);