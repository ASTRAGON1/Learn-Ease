const mongoose = require('mongoose');
const StudentSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    enrolledCourses: [String], // Array of Course IDs
    age: Number,
    avatar: String
});

module.exports =  mongoose.model('student', StudentSchema, 'Students');