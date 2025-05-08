const mongoose = require("mongoose");

const contentFeedbackSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  content_id: { type: mongoose.Schema.Types.ObjectId, ref: "Content" },
  liked: Boolean,
  feedbackComment: String,
  feedbackTime: { type: Date, default: Date.now }
});

module.exports = mongoose.model("ContentFeedback", contentFeedbackSchema);
