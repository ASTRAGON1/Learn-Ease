const mongoose = require("mongoose");

const contentSchema = new mongoose.Schema({
  contentTitle: String,
  teacher_id: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  contentType: String, // e.g., "video", "pdf", "audio"
  fileURL: String
});

module.exports = mongoose.model("Content", contentSchema);
