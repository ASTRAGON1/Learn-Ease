const { Lesson } = require('../models');
const { generateLessonId } = require('../utils/idGenerator');

/**
 * Create a new lesson
 * POST /api/lessons
 */
const createLesson = async (req, res) => {
  try {
    const { title } = req.body;
    
    // Validate input
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    // Auto-generate ID
    const lessonId = await generateLessonId(Lesson);
    
    // Create lesson
    const newLesson = new Lesson({
      _id: lessonId,
      title: title.trim()
    });
    
    await newLesson.save();
    
    res.status(201).json({
      success: true,
      message: 'Lesson created successfully',
      data: newLesson
    });
  } catch (error) {
    console.error('Error creating lesson:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

/**
 * Get all lessons
 * GET /api/lessons
 */
const getAllLessons = async (req, res) => {
  try {
    const lessons = await Lesson.find().sort({ _id: 1 });
    
    res.status(200).json({
      success: true,
      count: lessons.length,
      data: lessons
    });
  } catch (error) {
    console.error('Error fetching lessons:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

/**
 * Get single lesson by ID
 * GET /api/lessons/:id
 */
const getLessonById = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    
    if (!lesson) {
      return res.status(404).json({ 
        success: false,
        error: 'Lesson not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      data: lesson
    });
  } catch (error) {
    console.error('Error fetching lesson:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

/**
 * Update lesson
 * PUT /api/lessons/:id
 */
const updateLesson = async (req, res) => {
  try {
    const { title } = req.body;
    
    const lesson = await Lesson.findByIdAndUpdate(
      req.params.id,
      { title: title.trim() },
      { new: true, runValidators: true }
    );
    
    if (!lesson) {
      return res.status(404).json({ 
        success: false,
        error: 'Lesson not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Lesson updated successfully',
      data: lesson
    });
  } catch (error) {
    console.error('Error updating lesson:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

/**
 * Delete lesson
 * DELETE /api/lessons/:id
 */
const deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndDelete(req.params.id);
    
    if (!lesson) {
      return res.status(404).json({ 
        success: false,
        error: 'Lesson not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Lesson deleted successfully',
      data: lesson
    });
  } catch (error) {
    console.error('Error deleting lesson:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

module.exports = {
  createLesson,
  getAllLessons,
  getLessonById,
  updateLesson,
  deleteLesson
};