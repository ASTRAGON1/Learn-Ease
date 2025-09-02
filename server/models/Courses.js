const mongoose = require('mongoose');
const CourseSchema = new mongoose.Schema({
    title: String,
    description: String,
    contentIds: [String],
    category: String,
});

module.exports = mongoose.model('course', CourseSchema, 'Courses');
