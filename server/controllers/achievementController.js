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
    const { name, description, icon, category, points, requirement, rarity } = req.body;

    // Validation
    if (!name || !description || !icon || !category || !requirement) {
      return res.status(400).json({ ok: false, error: 'Missing required fields' });
    }

    if (!requirement.type || !requirement.threshold) {
      return res.status(400).json({ ok: false, error: 'Requirement type and threshold are required' });
    }

    const achievement = new Achievement({
      name,
      description,
      icon,
      category,
      points: points || 10,
      requirement,
      rarity: rarity || 'common',
      createdBy: req.user?.name || 'admin'
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

// Toggle achievement active status
exports.toggleAchievementStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const achievement = await Achievement.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    if (!achievement) {
      return res.status(404).json({ ok: false, error: 'Achievement not found' });
    }

    res.json({ ok: true, data: achievement });
  } catch (error) {
    console.error('Error toggling achievement status:', error);
    res.status(500).json({ ok: false, error: 'Failed to toggle achievement status' });
  }
};

// Bulk import achievements
exports.bulkImportAchievements = async (req, res) => {
  try {
    const { achievements } = req.body;

    if (!Array.isArray(achievements) || achievements.length === 0) {
      return res.status(400).json({ ok: false, error: 'Invalid achievements data' });
    }

    const createdAchievements = await Achievement.insertMany(achievements);
    res.json({ ok: true, data: createdAchievements, count: createdAchievements.length });
  } catch (error) {
    console.error('Error bulk importing achievements:', error);
    res.status(500).json({ ok: false, error: 'Failed to bulk import achievements' });
  }
};
