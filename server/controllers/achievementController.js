const Achievement = require('../models/Achievement');

// Get all achievements
exports.getAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.find().sort({ createdAt: -1 });
    res.json({ ok: true, data: achievements });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ ok: false, error: 'Failed to fetch achievements' });
  }
};

// Create achievement
exports.createAchievement = async (req, res) => {
  try {
    const { type, title, course, badge, description, category } = req.body;

    // Validation
    if (!type || !title || !course || !badge || !description || !category) {
      return res.status(400).json({ ok: false, error: 'Missing required fields' });
    }

    const achievement = new Achievement({
      type,
      title,
      course,
      badge,
      description,
      category
    });

    await achievement.save();
    res.json({ ok: true, data: achievement });
  } catch (error) {
    console.error('Error creating achievement:', error);
    res.status(500).json({ ok: false, error: 'Failed to create achievement' });
  }
};

// Update achievement
exports.updateAchievement = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const achievement = await Achievement.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!achievement) {
      return res.status(404).json({ ok: false, error: 'Achievement not found' });
    }

    res.json({ ok: true, data: achievement });
  } catch (error) {
    console.error('Error updating achievement:', error);
    res.status(500).json({ ok: false, error: 'Failed to update achievement' });
  }
};

// Delete achievement
exports.deleteAchievement = async (req, res) => {
  try {
    const { id } = req.params;

    const achievement = await Achievement.findByIdAndDelete(id);

    if (!achievement) {
      return res.status(404).json({ ok: false, error: 'Achievement not found' });
    }

    res.json({ ok: true, message: 'Achievement deleted successfully' });
  } catch (error) {
    console.error('Error deleting achievement:', error);
    res.status(500).json({ ok: false, error: 'Failed to delete achievement' });
  }
};


// Bulk import achievements
exports.bulkImportAchievements = async (req, res) => {
  try {
    const { achievements } = req.body;
    console.log('📥 Bulk import achievements request received');
    console.log('📊 Number of achievements to import:', achievements?.length);

    if (!Array.isArray(achievements) || achievements.length === 0) {
      console.error('❌ Invalid achievements data');
      return res.status(400).json({ ok: false, error: 'Invalid achievements data' });
    }

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    console.log('🔄 Starting import process...');

    // Import achievements one by one to handle duplicates and validation
    for (const achievementData of achievements) {
      try {
        // Remove id and student-specific fields if present
        const { id, grade, completedAt, ...dataToSave } = achievementData;

        // Validate required fields
        if (!dataToSave.type || !dataToSave.title || !dataToSave.course ||
          !dataToSave.badge || !dataToSave.description || !dataToSave.category) {
          throw new Error('Missing required fields: type, title, course, badge, description, category');
        }

        // Check if achievement with same title already exists
        const existing = await Achievement.findOne({ title: dataToSave.title });

        if (existing) {
          // Update existing achievement
          await Achievement.findByIdAndUpdate(existing._id, dataToSave, { new: true, runValidators: true });
          console.log(`✅ Updated achievement: ${dataToSave.title}`);
          successCount++;
        } else {
          // Create new achievement
          const created = await Achievement.create(dataToSave);
          console.log(`✅ Created achievement: ${dataToSave.title} (ID: ${created._id})`);
          successCount++;
        }
      } catch (error) {
        console.error(`❌ Failed to import achievement ${achievementData.title || 'Unknown'}:`, error.message);
        errorCount++;
        errors.push({
          achievement: achievementData.title || achievementData.id || 'Unknown',
          error: error.message
        });
      }
    }

    const message = `Successfully imported ${successCount} achievements to MongoDB${errorCount > 0 ? `, ${errorCount} failed` : ''}`;
    console.log('✅ Bulk import completed:', message);
    console.log('📊 Total achievements in DB:', await Achievement.countDocuments());

    res.json({
      ok: true,
      count: successCount,
      message,
      errors: errorCount > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('❌ Bulk import error:', error);
    res.status(500).json({ ok: false, error: 'Failed to bulk import achievements: ' + error.message });
  }
};
