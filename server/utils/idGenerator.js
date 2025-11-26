/**
 * Utility functions to auto-generate sequential IDs for lessons, topics, courses, and paths
 */

/**
 * Generate next Lesson ID (L001, L002, ...)
 */
const generateLessonId = async (Lesson) => {
    try {
      const lastLesson = await Lesson. findOne().sort({ _id: -1 }). select('_id');
      
      if (!lastLesson) {
        return 'L001'; // First lesson
      }
      
      const lastNumber = parseInt(lastLesson._id.substring(1)); // "L093" → 93
      const nextNumber = lastNumber + 1;
      return `L${String(nextNumber). padStart(3, '0')}`; // → "L094"
    } catch (error) {
      throw new Error(`Error generating lesson ID: ${error.message}`);
    }
  };
  
  /**
   * Generate next Topic ID (TOP001, TOP002, ...)
   */
  const generateTopicId = async (Topic) => {
    try {
      const lastTopic = await Topic.findOne().sort({ _id: -1 }).select('_id');
      
      if (!lastTopic) {
        return 'TOP001'; // First topic
      }
      
      const lastNumber = parseInt(lastTopic._id.substring(3)); // "TOP030" → 30
      const nextNumber = lastNumber + 1;
      return `TOP${String(nextNumber).padStart(3, '0')}`; // → "TOP031"
    } catch (error) {
      throw new Error(`Error generating topic ID: ${error.message}`);
    }
  };
  
  /**
   * Generate next Course ID (C001, C002, ...)
   */
  const generateCourseId = async (Course) => {
    try {
      const lastCourse = await Course.findOne().sort({ _id: -1 }).select('_id');
      
      if (!lastCourse) {
        return 'C001'; // First course
      }
      
      const lastNumber = parseInt(lastCourse._id.substring(1)); // "C016" → 16
      const nextNumber = lastNumber + 1;
      return `C${String(nextNumber).padStart(3, '0')}`; // → "C017"
    } catch (error) {
      throw new Error(`Error generating course ID: ${error.message}`);
    }
  };
  
  /**
   * Generate next Path ID based on type (PATH_AUTISM, PATH_DOWN_SYNDROME)
   */
  const generatePathId = async (Path, type) => {
    try {
      // For paths, we use descriptive IDs
      const typeUpper = type.toUpperCase();
      const pathId = `PATH_${typeUpper}`;
      
      // Check if it already exists
      const exists = await Path.findById(pathId);
      if (exists) {
        // If you want multiple paths per type, use numbering
        const pathsOfType = await Path.find({ _id: new RegExp(`^PATH_${typeUpper}`) }). sort({ _id: -1 });
        const nextNum = pathsOfType.length + 1;
        return `PATH_${typeUpper}_${nextNum}`;
      }
      
      return pathId;
    } catch (error) {
      throw new Error(`Error generating path ID: ${error.message}`);
    }
  };
  
  module.exports = {
    generateLessonId,
    generateTopicId,
    generateCourseId,
    generatePathId
  };