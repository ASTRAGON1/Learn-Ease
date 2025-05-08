const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
  teacherName: { type: String, required: true },
  teacherEmail: { type: String, required: true, unique: true },
  teacherPass: { type: String, required: true },
  teacherType: String,
  teacherCV: String,
  teacherPIC: String
});

module.exports = mongoose.model("Teacher", teacherSchema);
