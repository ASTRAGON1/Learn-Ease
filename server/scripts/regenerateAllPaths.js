require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Student = require('../models/Student');
const Test = require('../models/Test');
const PathModel = require('../models/Path');
const Content = require('../models/Content');
const StudentPath = require('../models/StudentPath');
const OpenAI = require('openai');

// Check if MongoDB URI is loaded
if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables');
  console.log('💡 Make sure your .env file is in the root directory');
  process.exit(1);
}

async function regeneratePathForStudent(studentId) {
  try {
    // 1. Get student and test data
    const student = await Student.findById(studentId);
    if (!student) {
      console.log(`❌ Student ${studentId} not found`);
      return;
    }

    const testResults = await Test.findOne({ student: studentId });
    if (!testResults) {
      console.log(`⏭️  Skipping ${student.name} - No diagnostic test found`);
      return;
    }

    const { section1, section2, section3, accuracy, autismScore, downSyndromeScore, determinedType } = testResults;
    const studentType = determinedType;

    console.log(`\n🔄 Regenerating path for: ${student.name}`);
    console.log(`   Type: ${studentType}, Accuracy: ${(accuracy * 100).toFixed(0)}%`);

    // 2. Find the curriculum Path
    const curriculumPath = await PathModel.findOne({ type: studentType });
    if (!curriculumPath) {
      console.log(`❌ No curriculum path found for type: ${studentType}`);
      return;
    }

    // 3. Determine difficulty filter based on accuracy - MATCH skill level
    let difficultyFilter;
    const accuracyPercent = accuracy * 100;
    
    if (accuracyPercent < 50) {
      difficultyFilter = ['Easy'];
      console.log(`   🎯 Low accuracy (${accuracyPercent.toFixed(0)}% < 50%) - ONLY Easy`);
    } else if (accuracyPercent <= 80) {
      difficultyFilter = ['Medium'];
      console.log(`   🎯 Medium accuracy (${accuracyPercent.toFixed(0)}% = 50-80%) - ONLY Medium`);
    } else {
      difficultyFilter = ['Hard'];
      console.log(`   🎯 High accuracy (${accuracyPercent.toFixed(0)}% > 80%) - ONLY Hard`);
    }

    // 4. Analyze preferences
    let preferredContentType = null;
    const visualPreferenceIndicators = [0, 2];
    const hasVisualPreference = section1.some(answer => visualPreferenceIndicators.includes(answer));
    
    if (hasVisualPreference) {
      preferredContentType = 'video';
      console.log('   👁️  Prefers video content');
    }

    // 5. Build smart content query
    const contentQuery = {
      path: curriculumPath._id,
      status: 'published',
      difficulty: { $in: difficultyFilter }
    };

    const allFilteredContent = await Content.find(contentQuery)
      .select('_id title difficulty contentType topic description')
      .lean();

    console.log(`   📦 Found ${allFilteredContent.length} content items`);

    // 6. Prioritize content
    let prioritizedContent = [...allFilteredContent];
    
    if (preferredContentType) {
      prioritizedContent.sort((a, b) => {
        if (a.contentType === preferredContentType && b.contentType !== preferredContentType) return -1;
        if (a.contentType !== preferredContentType && b.contentType === preferredContentType) return 1;
        return 0;
      });
    }

    // 7. Create base assigned content (70%)
    const baseContentCount = Math.ceil(prioritizedContent.length * 0.7);
    const baseContent = prioritizedContent.slice(0, baseContentCount);
    
    const assignedContent = baseContent.map(c => ({
      content: c._id,
      status: 'pending',
      addedDate: new Date(),
      priority: 'normal'
    }));

    // 8. AI Personalization
    let aiRecommendedIds = [];
    if (process.env.OPENAI_API_KEY) {
      try {
        console.log('   🤖 Running AI personalization...');
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const availableContent = await Content.find({
          status: 'published',
          difficulty: { $in: difficultyFilter }
        }).select('_id title description duration difficulty topic contentType').limit(80).lean();

        if (availableContent.length > 0) {
          const prompt = `Student: ${studentType} (Autism: ${autismScore}, DS: ${downSyndromeScore})
Accuracy: ${accuracyPercent.toFixed(0)}%

Available Content (${availableContent.length}):
${availableContent.map((c, i) => `${i + 1}. "${c.title}" [${c.contentType}] ${c.difficulty}`).join('\n')}

Select 5-8 best items. Return JSON array: [1, 5, 3, ...]`;

          const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: "Expert special education AI. Return only JSON array." },
              { role: "user", content: prompt }
            ],
            temperature: 0.4
          });

          const responseText = completion.choices[0].message.content.trim();
          const indices = JSON.parse(responseText.match(/\[.*\]/s)?.[0] || "[]");

          if (indices.length > 0) {
            aiRecommendedIds = indices.map(idx => availableContent[idx - 1]?._id).filter(Boolean);
            console.log(`   🎯 AI selected ${aiRecommendedIds.length} priority items`);
          }
        }
      } catch (aiError) {
        console.log(`   ⚠️  AI error (non-blocking): ${aiError.message}`);
      }
    }

    // 9. Update or create StudentPath
    let studentPath = await StudentPath.findOne({ student: studentId });

    if (studentPath) {
      // Update existing
      studentPath.assignedContent = assignedContent;
      
      // Add AI recommendations
      if (aiRecommendedIds.length > 0) {
        const existingIds = new Set(assignedContent.map(c => c.content.toString()));
        const aiRecs = aiRecommendedIds
          .filter(id => !existingIds.has(id.toString()))
          .map(id => ({
            content: id,
            status: 'pending',
            addedDate: new Date(),
            priority: 'high',
            aiRecommended: true
          }));
        
        studentPath.assignedContent = [...aiRecs, ...studentPath.assignedContent];
      }

      await studentPath.save();
      console.log(`   ✅ Updated: ${studentPath.assignedContent.length} total items (${assignedContent.length} base + ${aiRecommendedIds.length} AI)`);
    } else {
      // Create new
      const newAssignedContent = [...assignedContent];
      
      if (aiRecommendedIds.length > 0) {
        const aiRecs = aiRecommendedIds.map(id => ({
          content: id,
          status: 'pending',
          addedDate: new Date(),
          priority: 'high',
          aiRecommended: true
        }));
        newAssignedContent.unshift(...aiRecs);
      }

      await StudentPath.create({
        student: studentId,
        StudentId: studentId,
        path: curriculumPath._id,
        assignedContent: newAssignedContent,
        status: 'in-progress'
      });
      console.log(`   ✅ Created: ${newAssignedContent.length} items`);
    }

  } catch (error) {
    console.error(`❌ Error for student ${studentId}:`, error.message);
  }
}

async function main() {
  try {
    console.log('🚀 Starting path regeneration for all students...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Find all students with a type assigned
    const students = await Student.find({ 
      type: { $exists: true, $ne: null } 
    }).select('_id name type');
    
    console.log(`Found ${students.length} students with assigned types\n`);
    console.log('='.repeat(60));

    // Process each student
    for (const student of students) {
      await regeneratePathForStudent(student._id);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('\n✅ Path regeneration completed for all students!\n');
    
    // Disconnect
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

main();
