const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  enrolledCourses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
  ],
  quizScores: [
    {
      quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
      score: Number,
    },
  ],
});

module.exports = mongoose.model("Student", studentSchema);
