const Content = require('../models/Content');

exports.createContent = async (req, res) => {
  try {
    const teacherId = req.user.sub;
    const { 
      title, category, type, topic, lesson, course, description,
      url, storagePath, fileType, size, kind, firebaseUid, status 
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
      fileURL: url,
      status: status || 'draft',
      firebaseUid: firebaseUid || null,
      storagePath,
      fileType,
      size,
      kind
    });

    return res.status(201).json({ data: doc });
  } catch (e) {
    console.error('createContent error', e);
    return res.status(500).json({ error: 'Server error', message: e.message });
  }
};