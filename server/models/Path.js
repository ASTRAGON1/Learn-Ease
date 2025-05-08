const mongoose = require("mongoose");

const pathSchema = new mongoose.Schema({
  pathType: String,
  pathName: String
});

module.exports = mongoose.model("Path", pathSchema);
