const mongoose = require('mongoose');
const TeacherSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    cv: String,
    uploadedContent: [String],
    age: Number,
    avatar: String,
    bio: String
});

module.exports = mongoose.model('teacher', TeacherSchema, 'Teachers');