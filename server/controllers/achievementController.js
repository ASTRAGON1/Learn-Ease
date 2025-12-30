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



