const Content = require('../models/Content');

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
      .sort({ createdAt: -1 }) // Newest first
      .select('title category status createdAt previousStatus storagePath deletedAt');
    
    return res.status(200).json({ data: content });
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
      url, storagePath, fileType, size, firebaseUid, status 
    } = req.body;
    
    if (!url || !storagePath) {
      console.error('Missing url/storagePath:', { url: !!url, storagePath: !!storagePath });
      return res.status(400).json({ error: 'Missing url/storagePath' });
    }
    if (!title || !category || !type || !topic || !lesson || !course) {
      console.error('Missing required fields:', { title: !!title, category: !!category, type: !!type, topic: !!topic, lesson: !!lesson, course: !!course });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Normalize category
    const categoryMap = { 'Autism': 'autism', 'Down Syndrome': 'downSyndrome' };
    const normalizedCategory = categoryMap[category] || category.toLowerCase();

    console.log('Creating Content document with:', {
      teacher: teacherId,
      title,
      category: normalizedCategory,
      type,
      topic,
      lesson,
      course
    });

    const doc = await Content.create({
      teacher: teacherId,
      title,
      category: normalizedCategory,
      type,
      topic,
      lesson,
      course,
      description: description || '',
      difficulty: difficulty || null,
      fileURL: url,
      status: status || 'draft',
      firebaseUid: firebaseUid || null,
      storagePath,
      fileType,
      size
    });

    console.log('Content created successfully:', doc._id);
    return res.status(201).json({ data: doc });
  } catch (e) {
    console.error('createContent error:', e);
    console.error('Error details:', {
      name: e.name,
      message: e.message,
      stack: e.stack
    });
    return res.status(500).json({ error: 'Server error', message: e.message });
  }
};