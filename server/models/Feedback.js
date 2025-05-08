const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  feedbackMessage: String,
  feedbackType: String,
  feedbackTime: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Feedback", feedbackSchema);
