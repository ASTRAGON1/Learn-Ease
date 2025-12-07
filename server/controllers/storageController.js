const Content = require('../models/Content');

exports.getContent = async (req, res) => {
  try {
    const teacherId = req.user.sub;
    const { status } = req.query; // Optional filter by status
    
    const query = { teacher: teacherId };
    if (status) {
      query.status = status;
    }
    
    const content = await Content.find(query)
      .sort({ createdAt: -1 }) // Newest first
      .select('title category status createdAt');
    
    return res.status(200).json({ data: content });
  } catch (e) {
    console.error('getContent error', e);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.createContent = async (req, res) => {
  try {
    const teacherId = req.user.sub;
    const { 
      title, category, type, topic, lesson, course, description, difficulty,
      url, storagePath, fileType, size, firebaseUid, status 
    } = req.body;
    
    if (!url || !storagePath) return res.status(400).json({ error: 'Missing url/storagePath' });
    if (!title || !category || !type || !topic || !lesson || !course) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Normalize category
    const categoryMap = { 'Autism': 'autism', 'Down Syndrome': 'downSyndrome' };
    const normalizedCategory = categoryMap[category] || category.toLowerCase();

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

    return res.status(201).json({ data: doc });
  } catch (e) {
    console.error('createContent error', e);
    return res.status(500).json({ error: 'Server error', message: e.message });
  }
};