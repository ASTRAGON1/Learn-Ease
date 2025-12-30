const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');

// Register a new teacher
exports.register = async (req, res) => {
    try {
        const { fullName, email, password, cv, profilePic, bio, firebaseUID } = req.body;
        if (!fullName || !fullName.trim()) {
            return res.status(400).json({ error: 'fullName is required' });
        }
        if (!email) {
            return res.status(400).json({ error: 'email is required' });
        }

        // Check if email already exists in teacher database
        const teacherExists = await Teacher.findOne({ email: email.toLowerCase().trim() });
        if (teacherExists) {
            return res.status(409).json({ error: 'Email already used' });
        }

        // Check if email already exists in student database
        const studentExists = await Student.findOne({ email: email.toLowerCase().trim() });
        if (studentExists) {
            return res.status(409).json({ error: 'Email already used in student database' });
        }

        // If firebaseUID is provided, check if it's already linked
        if (firebaseUID) {
            const firebaseExists = await Teacher.findOne({ firebaseUID });
            if (firebaseExists) return res.status(409).json({ error: 'Firebase account already linked' });
        }

        let hashedPassword = '';
        if (password && password !== 'google-signup') {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        const teacherData = {
            fullName: fullName.trim(),
            email,
            cv: cv || '',
            profilePic: profilePic || '',
            bio: bio || ''
        };

        if (hashedPassword) {
            teacherData.password = hashedPassword;
        }

        if (firebaseUID) {
            teacherData.firebaseUID = firebaseUID;
        }

        // Set userStatus to 'pending' for new instructors (requires admin approval)
        teacherData.userStatus = 'pending';

        const doc = await Teacher.create(teacherData);

        res.status(201).json({
            data: {
                id: doc._id,
                fullName: doc.fullName,
                email: doc.email,
                firebaseUID: doc.firebaseUID || null,
                userStatus: doc.userStatus
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        if (error.code === 11000) {
            return res.status(409).json({ error: 'Email or Firebase UID already exists' });
        }
        res.status(500).json({ error: 'Server error' });
    }
};

// Login teacher
exports.login = async (req, res) => {
    try {
        const { email, password, firebaseUID } = req.body;

        // Determine valid search criteria
        const identifier = email ? email.trim() : '';
        const isEmail = identifier.includes('@');

        let t;
        if (isEmail) {
            t = await Teacher.findOne({ email: identifier.toLowerCase() });
        } else {
            // Search by fullName if not an email
            t = await Teacher.findOne({
                fullName: { $regex: new RegExp(`^${identifier}$`, 'i') }
            });
        }

        if (!t) return res.status(404).json({ error: 'Teacher not found' });

        // If firebaseUID is provided, verify it matches or update it
        if (firebaseUID) {
            if (t.firebaseUID && t.firebaseUID !== firebaseUID) {
                return res.status(401).json({ error: 'Invalid Firebase credentials' });
            }
            // If firebaseUID is not set in MongoDB, update it
            if (!t.firebaseUID) {
                t.firebaseUID = firebaseUID;
                await t.save();
            }
        } else {
            // Traditional password login
            if (!t.password) {
                return res.status(401).json({ error: 'This account uses Firebase authentication. Please sign in with Firebase.' });
            }
            const ok = await bcrypt.compare(password, t.password);
            if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Mark teacher as online
        t.isOnline = true;
        t.lastActivity = new Date();
        await t.save();

        const token = jwt.sign({ sub: t._id, role: 'teacher' }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({
            data: {
                token,
                teacher: {
                    id: t._id,
                    fullName: t.fullName,
                    email: t.email,
                    profilePic: t.profilePic,
                    areasOfExpertise: t.areasOfExpertise || [],
                    cv: t.cv || '',
                    informationGatheringComplete: t.informationGatheringComplete || false,
                    userStatus: t.userStatus || 'pending'
                }
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get current teacher
exports.getMe = async (req, res) => {
    try {
        const me = await Teacher.findById(req.user.sub).select('-password');
        if (!me) return res.status(404).json({ error: 'Not found' });

        // Check if teacher has a password set (not Firebase-only)
        const teacherWithPassword = await Teacher.findById(req.user.sub);
        const hasPassword = !!(teacherWithPassword && teacherWithPassword.password);

        const response = me.toObject();
        response.hasPassword = hasPassword;

        res.json({ data: response });
    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Logout teacher
exports.logout = async (req, res) => {
    try {
        await Teacher.findByIdAndUpdate(req.user.sub, {
            isOnline: false,
            lastActivity: new Date()
        });

        res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        console.error('Teacher logout error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Update activity
exports.updateActivity = async (req, res) => {
    try {
        await Teacher.findByIdAndUpdate(req.user.sub, {
            lastActivity: new Date(),
            isOnline: true
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Teacher activity update error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
