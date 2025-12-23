const Content = require('../models/Content');
const Path = require('../models/Path');
const mongoose = require('mongoose');

exports.getContent = async (req, res) => {
  try {
    const teacherId = req.user.sub;
    const { status, includeDeleted } = req.query; // Optional filter by status, includeDeleted flag

    const query = { teacher: teacherId };

    // By default, exclude deleted content unless explicitly requested
    if (status) {
      query.status = status;
    } else if (includeDeleted !== 'true') {
      query.status = { $ne: 'deleted' };
    }

    const content = await Content.find(query)
      .populate('path', 'type') // Populate path to get the type (autism/downSyndrome)
      .sort({ createdAt: -1 }) // Newest first
      .select('title path contentType status createdAt previousStatus storagePath deletedAt');

    // Transform the data to include pathType for backward compatibility with frontend
    const transformedContent = content.map(item => ({
      _id: item._id,
      title: item.title,
      pathType: item.path?.type || null, // Extract type from populated path
      contentType: item.contentType,
      status: item.status,
      createdAt: item.createdAt,
      previousStatus: item.previousStatus,
      storagePath: item.storagePath,
      deletedAt: item.deletedAt
    }));

    return res.status(200).json({ data: transformedContent });
  } catch (e) {
    console.error('getContent error', e);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.createContent = async (req, res) => {
  try {
    const teacherId = req.user.sub;
    console.log('Creating content for teacher:', teacherId);
    console.log('Request body:', req.body);

    const {
      title, category, type, topic, lesson, course, description, difficulty,
      url, storagePath, fileType, size, firebaseUid, status,
      pathId, courseId, topicId, lessonId
    } = req.body;

    console.log('Received category value:', category, 'Type:', typeof category);
    console.log('Received type value:', type, 'Type:', typeof type);

    if (!url || !storagePath) {
      console.error('Missing url/storagePath:', { url: !!url, storagePath: !!storagePath });
      return res.status(400).json({ error: 'Missing url/storagePath' });
    }
    if (!title || !type) {
      console.error('Missing required fields:', { title: !!title, type: !!type });
      return res.status(400).json({ error: 'Missing required fields: title and type are required' });
    }

    // Validate that IDs are provided (required for new schema)
    if (!pathId || !courseId || !topicId || !lessonId) {
      return res.status(400).json({ error: 'Missing required IDs: pathId, courseId, topicId, and lessonId are required' });
    }

    // Validate that IDs are valid ObjectIds
    if (!mongoose.Types.ObjectId.isValid(pathId) ||
      !mongoose.Types.ObjectId.isValid(courseId) ||
      !mongoose.Types.ObjectId.isValid(topicId) ||
      !mongoose.Types.ObjectId.isValid(lessonId)) {
      return res.status(400).json({ error: 'Invalid ID format: All IDs must be valid ObjectIds' });
    }

    // Normalize pathType (category from frontend) - derive from pathId
    let normalizedPathType = null;
    try {
      const path = await Path.findById(pathId).select('type');
      if (path && path.type) {
        normalizedPathType = path.type; // path.type is 'autism' or 'downSyndrome'
        console.log('Derived pathType from pathId:', normalizedPathType);
      } else {
        return res.status(400).json({ error: 'Invalid pathId: Path not found' });
      }
    } catch (pathError) {
      console.error('Error fetching path:', pathError);
      return res.status(400).json({ error: 'Error validating path' });
    }

    // Normalize contentType (type from frontend)
    let normalizedContentType = type;
    if (typeof normalizedContentType === 'string') {
      normalizedContentType = normalizedContentType.toLowerCase().trim();
    }

    // Validate contentType
    if (!['video', 'document', 'image'].includes(normalizedContentType)) {
      console.error('Invalid contentType value:', type);
      return res.status(400).json({
        error: 'Invalid content type',
        message: `Content type must be 'video', 'document', or 'image', received: '${type}'`
      });
    }

    console.log('Final normalized contentType:', normalizedContentType);

    console.log('Creating Content document with:', {
      teacher: teacherId,
      title,
      path: pathId,
      course: courseId,
      topic: topicId,
      lesson: lessonId,
      contentType: normalizedContentType
    });

    // Prepare content data
    const contentData = {
      teacher: teacherId,
      title: title.trim(),
      path: pathId,
      course: courseId,
      topic: topicId,
      lesson: lessonId,
      contentType: normalizedContentType,
      description: description ? description.trim() : '',
      fileURL: url,
      status: status || 'draft',
      firebaseUid: firebaseUid || null,
      storagePath,
      fileType: fileType || null,
      size: size || null
    };

    // Only add difficulty if it's provided and valid
    if (difficulty && ['Easy', 'Medium', 'Hard'].includes(difficulty)) {
      contentData.difficulty = difficulty;
    }

    // Log the final data being sent to MongoDB
    console.log('Final contentData being saved:', JSON.stringify(contentData, null, 2));

    const doc = await Content.create(contentData);

    console.log('Content created successfully:', doc._id);

    // Create notification for the teacher
    const { createNotification } = require('./notificationController');
    await createNotification({
      recipient: teacherId,
      recipientModel: 'Teacher',
      message: 'Your content got uploaded successfully',
      type: 'upload'
    });

    return res.status(201).json({ data: doc });
  } catch (e) {
    console.error('createContent error:', e);
    console.error('Error details:', {
      name: e.name,
      message: e.message,
      stack: e.stack
    });

    // If it's a validation error, provide more details
    if (e.name === 'ValidationError') {
      const validationErrors = Object.values(e.errors || {}).map(err => ({
        field: err.path,
        message: err.message,
        value: err.value
      }));
      console.error('Validation errors:', JSON.stringify(validationErrors, null, 2));
      return res.status(400).json({
        error: 'Validation error',
        message: e.message,
        details: validationErrors
      });
    }

    return res.status(500).json({ error: 'Server error', message: e.message });
  }
};

exports.getPublishedContent = async (req, res) => {
  try {
    const { courseId, lessonId, contentType } = req.query;
    const query = { status: 'published' };

    if (courseId) query.course = courseId;
    if (lessonId) query.lesson = lessonId;
    if (contentType) query.contentType = contentType;

    const content = await Content.find(query)
      .select('title contentType fileURL lesson topic course status description')
      .sort({ createdAt: -1 });

    const transformed = content.map(c => ({
      _id: c._id,
      title: c.title,
      contentType: c.contentType,
      fileURL: c.fileURL,
      description: c.description,
      lesson: c.lesson,
      topic: c.topic,
      course: c.course
    }));

    return res.status(200).json({ data: transformed });
  } catch (e) {
    console.error('getPublishedContent error', e);
    return res.status(500).json({ error: 'Server error' });
  }
};