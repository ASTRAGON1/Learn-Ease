/**
 * Script to assign currentDifficulty to existing students based on their diagnostic test results
 * Run this ONCE to fix students who completed the test before difficulty feature was added
 */

const mongoose = require('mongoose');
const Student = require('../server/models/Student');
const Test = require('../server/models/Test');

// MongoDB connection string - UPDATE THIS!
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/learnease';

async function fixStudentDifficulties() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all students who have completed diagnostic test but don't have currentDifficulty
    const studentsWithoutDifficulty = await Student.find({
      type: { $exists: true, $ne: null },
      currentDifficulty: { $exists: false }
    });

    console.log(`📊 Found ${studentsWithoutDifficulty.length} students without currentDifficulty\n`);

    if (studentsWithoutDifficulty.length === 0) {
      console.log('✅ All students already have difficulty assigned!');
      await mongoose.disconnect();
      return;
    }

    let updatedCount = 0;
    let skippedCount = 0;

    for (const student of studentsWithoutDifficulty) {
      // Get their diagnostic test result
      const testResult = await Test.findOne({ student: student._id });

      if (!testResult) {
        console.log(`⚠️ Student ${student._id} (${student.name}) - No test found, skipping`);
        skippedCount++;
        continue;
      }

      // Calculate difficulty based on accuracy
      const accuracy = testResult.accuracy;
      const accuracyPercent = accuracy * 100;
      let difficulty;

      if (accuracyPercent < 50) {
        difficulty = 'Easy';
      } else if (accuracyPercent <= 80) {
        difficulty = 'Medium';
      } else {
        difficulty = 'Hard';
      }

      // Update student with difficulty
      await Student.findByIdAndUpdate(student._id, {
        $set: { currentDifficulty: difficulty }
      });

      console.log(`✅ Updated ${student.name} (${student.email}) - Accuracy: ${accuracyPercent.toFixed(0)}% → ${difficulty}`);
      updatedCount++;
    }

    console.log('\n' + '='.repeat(60));
    console.log(`✅ Successfully updated ${updatedCount} students`);
    console.log(`⚠️ Skipped ${skippedCount} students (no test found)`);
    console.log('='.repeat(60));

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the script
fixStudentDifficulties();
