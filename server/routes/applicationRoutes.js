const express = require('express');
const Application = require('../models/Application');
const Teacher = require('../models/Teacher');
const auth = require('../middleware/auth');
const router = express.Router();

// POST /api/applications - Create application (for instructors)
router.post('/', auth(['teacher']), async (req, res) => {
  try {
    const teacherId = req.user.sub;

    // Check if application already exists
    const existingApplication = await Application.findOne({ teacherId });
    if (existingApplication) {
      return res.status(409).json({ error: 'Application already exists' });
    }

    // Get teacher data
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    // Create application
    const application = await Application.create({
      teacherId: teacher._id,
      email: teacher.email,
      fullName: teacher.fullName,
      cv: teacher.cv || '',
      bio: teacher.bio || '',
      description: teacher.bio || '',
      status: 'pending'
    });

    res.status(201).json({
      data: {
        id: application._id.toString(),
        status: application.status,
        submittedAt: application.createdAt.toISOString().slice(0, 10)
      }
    });
  } catch (error) {
    console.error('Error creating application:', error);
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Application already exists' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/applications - List all applications
router.get('/', async (req, res) => {
  try {
    const applications = await Application.find()
      .populate('teacherId', 'fullName email profilePic cv bio')
      .sort({ createdAt: -1 });

    const formattedApplications = applications.map(app => {
      // Get CV and bio from Teacher model if available, otherwise use application data
      const teacher = app.teacherId;
      const cvUrl = teacher?.cv || app.cv || '';
      const description = teacher?.bio || app.description || app.bio || '';

      return {
        id: app._id.toString(),
        teacherId: teacher?._id?.toString() || app.teacherId?.toString(),
        name: app.fullName || teacher?.fullName || '',
        email: app.email || teacher?.email || '',
        cvUrl: cvUrl,
        description: description,
        status: app.status,
        submittedAt: app.createdAt.toISOString().slice(0, 10),
        declinedReason: app.declinedReason || '',
        reviewedAt: app.reviewedAt ? app.reviewedAt.toISOString().slice(0, 10) : null
      };
    });

    res.json({ data: formattedApplications });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/applications/:id - Get single application
router.get('/:id', async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('teacherId', 'fullName email profilePic');

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json({ data: application });
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/applications/decide/:id - Accept or decline application
router.post('/decide/:id', async (req, res) => {
  try {
    const { decision, reason } = req.body;

    if (!decision || !['accept', 'decline'].includes(decision)) {
      return res.status(400).json({ error: 'Invalid decision. Must be "accept" or "decline"' });
    }

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({ error: 'Application has already been processed' });
    }

    const status = decision === 'accept' ? 'accepted' : 'declined';
    application.status = status;
    application.reviewedAt = new Date();

    if (decision === 'decline') {
      application.declinedReason = reason || '';
    }

    await application.save();

    // If accepted, update teacher's userStatus to 'active'
    if (decision === 'accept') {
      await Teacher.findByIdAndUpdate(application.teacherId, {
        userStatus: 'active'
      });

      // Notify teacher
      const { createNotification } = require('../controllers/notificationController');
      await createNotification({
        recipient: application.teacherId,
        recipientModel: 'Teacher',
        message: 'Your instructor application has been accepted! You can now start creating courses.',
        type: 'approved'
      });
    } else if (decision === 'decline') {
      // Notify teacher of rejection
      const { createNotification } = require('../controllers/notificationController');
      await createNotification({
        recipient: application.teacherId,
        recipientModel: 'Teacher',
        message: `Your instructor application was declined.${reason ? ` Reason: ${reason}` : ''}`,
        type: 'system'
      });
    }

    res.json({
      data: {
        id: application._id.toString(),
        status: application.status,
        reviewedAt: application.reviewedAt
      }
    });
  } catch (error) {
    console.error('Error processing application:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

