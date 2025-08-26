const mongoose = require("mongoose");
const { stringifyCookie } = require("next/dist/compiled/@edge-runtime/cookies");

const contentSchema = new mongoose.Schema({
  contentTitle: String,
  title: String,
  type: String,
  fileUrl: String,
  CourseId: String,
  TeacherId: String,
  testField: String
});


module.exports = mongoose.model("Content", contentSchema, "Contents");
