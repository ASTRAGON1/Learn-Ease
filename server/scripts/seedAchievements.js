require('dotenv').config();
const mongoose = require('mongoose');
const Achievement = require('../models/Achievement');
const achievementsData = require('../data/achievements.json');

const seedAchievements = async () => {
    try {
        console.log('🔌 Connecting to MongoDB...');
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in .env');
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        console.log('🧹 Clearing existing achievements...');
        await Achievement.deleteMany({});
        console.log('✅ Cleared old achievements');

        console.log(`🌱 Seeding ${achievementsData.length} new achievements...`);
        await Achievement.insertMany(achievementsData);
        console.log('✅ Successfully seeded achievements');

        console.log('👋 Closing connection...');
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding achievements:', error);
        process.exit(1);
    }
};

seedAchievements();
