const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Student = require('../models/Student');
const Achievement = require('../models/Achievement');

const assignAchievements = async () => {
    try {
        console.log('🔌 Connecting to MongoDB...');
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in .env');
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // 1. Get the most active student
        const student = await Student.findOne().sort({ lastActivity: -1 });
        if (!student) {
            throw new Error('No students found');
        }
        console.log(`👤 Found student: ${student.name} (${student.email})`);

        // 2. Get all achievements
        const achievements = await Achievement.find({});
        if (achievements.length === 0) {
            throw new Error('No achievements found in DB. Run seedAchievements.js first.');
        }
        console.log(`🏆 Found ${achievements.length} achievements available`);

        // 3. Assign them
        // We'll map them to the student schema format
        const newAchievements = achievements.map(ach => ({
            achievement: ach._id,
            grade: 95, // Mock high grade
            earnedAt: new Date(),
            completedAt: new Date()
        }));

        // Replace or merge? User wants "17" which implies all.
        // Let's replace to be clean or merge if unique.
        // Simplest: Replace to ensure exact state.
        student.achievements = newAchievements;

        await student.save();
        console.log(`✅ Assigned ${newAchievements.length} achievements to ${student.name}`);
        console.log(`⭐ Total Stars (approx): ${newAchievements.length * 10}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

assignAchievements();
