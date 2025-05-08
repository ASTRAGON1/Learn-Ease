const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  adminName: { type: String, required: true },
  adminEmail: { type: String, required: true, unique: true },
  adminPass: { type: String, required: true }
});

module.exports = mongoose.model("Admin", adminSchema);
