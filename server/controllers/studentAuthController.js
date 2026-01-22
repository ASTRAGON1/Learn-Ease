const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Track = require('../models/Track');
const Achievement = require('../models/Achievement');
const Course = require('../models/Course');
const Quiz = require('../models/Quiz');
const QuizResult = require('../models/QuizResult');
const Path = require('../models/Path');
const Lesson = require('../models/Lesson');
const Content = require('../models/Content');
const Notification = require('../models/Notification');

// Check if email exists
exports.checkEmail = async (req, res) => {
    try {
        const email = req.params.email.toLowerCase().trim();

        const studentExists = await Student.findOne({ email });
        const teacherExists = await Teacher.findOne({ email });

        res.json({
            exists: !!(studentExists || teacherExists),
            inStudent: !!studentExists,
            inTeacher: !!teacherExists
        });
    } catch (error) {
        console.error('Check email error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Register
exports.register = async (req, res) => {
    try {
        const { fullName, email, password, username, firebaseUID } = req.body;

        if (!fullName || !fullName.trim()) {
            return res.status(400).json({ error: 'fullName is required' });
        }
        if (!email) {
            return res.status(400).json({ error: 'email is required' });
        }
        if (!password) {
            return res.status(400).json({ error: 'password is required' });
        }

        // Check if email already exists in student database
        const studentExists = await Student.findOne({ email: email.toLowerCase().trim() });
        if (studentExists) {
            return res.status(409).json({ error: 'Email already used' });
        }

        // Check if email already exists in teacher database
        const teacherExists = await Teacher.findOne({ email: email.toLowerCase().trim() });
        if (teacherExists) {
            return res.status(409).json({ error: 'Email already used in teacher database' });
        }

        // If firebaseUID is provided, check if it's already linked
        if (firebaseUID) {
            const firebaseExists = await Student.findOne({ firebaseUID });
            if (firebaseExists) {
                return res.status(409).json({ error: 'Firebase account already linked' });
            }
        }

        // Hash password (only if password is provided and not a placeholder)
        let hashedPassword = '';
        if (password && password !== 'google-signup') {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        // Create student
        const studentData = {
            name: fullName.trim(),
            email: email.toLowerCase().trim()
            // type will be assigned after diagnostic test completion
        };

        if (hashedPassword) {
            studentData.pass = hashedPassword;
        }

        if (firebaseUID) {
            studentData.firebaseUID = firebaseUID;
        }

        const doc = await Student.create(studentData);

        // Generate token
        const token = jwt.sign({ sub: doc._id, role: 'student' }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({
            data: {
                token,
                student: {
                    id: doc._id,
                    fullName: doc.name,
                    name: doc.name,
                    email: doc.email
                }
            }
        });
    } catch (error) {
        console.error('Student registration error:', error);
        if (error.code === 11000) {
            return res.status(409).json({ error: 'Email already exists' });
        }
        res.status(500).json({ error: 'Server error' });
    }
};

// Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Determine valid search criteria
        const identifier = email.trim();
        const isEmail = identifier.includes('@');

        let student;
        if (isEmail) {
            // Find by email
            student = await Student.findOne({ email: identifier.toLowerCase() });
        } else {
            // Find by full name (case-insensitive exact match)
            student = await Student.findOne({
                name: { $regex: new RegExp(`^${identifier}$`, 'i') }
            });
        }

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, student.pass);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Update last activity and online status
        student.lastActivity = new Date();
        student.isOnline = true;
        await student.save();

        // Generate token
        const token = jwt.sign({ sub: student._id, role: 'student' }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({
            data: {
                token,
                student: {
                    id: student._id,
                    fullName: student.name,
                    name: student.name,
                    email: student.email
                }
            }
        });
    } catch (error) {
        console.error('Student login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get current student info (requires diagnostic quiz)
exports.getMe = async (req, res) => {
    try {
        const student = await Student.findById(req.user.sub).select('-pass');

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        res.json({
            data: {
                id: student._id,
                name: student.name,
                fullName: student.name,
                email: student.email,
                profilePic: student.profilePic,
                type: student.type,
                currentDifficulty: student.currentDifficulty,
                userStatus: student.userStatus,
                assignedPath: student.assignedPath,
                lastActivity: student.lastActivity
            }
        });
    } catch (error) {
        console.error('Get student info error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Logout
exports.logout = async (req, res) => {
    try {
        await Student.findByIdAndUpdate(req.user.sub, {
            lastActivity: new Date(),
            isOnline: false
        });

        res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        console.error('Student logout error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Update last activity and track time
exports.updateActivity = async (req, res) => {
    try {
        const studentId = req.user.sub;
        const now = new Date();

        // 1. Update Student model
        const student = await Student.findByIdAndUpdate(studentId, {
            lastActivity: now,
            isOnline: true
        });

        // 2. Update Track model (increment hoursStudied)
        // If it's just a ping (e.g. on page load), don't add time
        if (!req.body.ping) {
            let track = await Track.findOne({ student: studentId });
            if (track) {
                // Add 1 minute (1/60 of an hour)
                const increment = 1 / 60;
                track.hoursStudied = (track.hoursStudied || 0) + increment;
                track.lastActivityDate = now;
                await track.save();
            }
            res.json({ success: true, hours: track ? track.hoursStudied : 0 });
        } else {
            res.json({ success: true, message: "Ping received" });
        }
    } catch (error) {
        console.error('Student activity update error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get student progress
exports.getProgress = async (req, res) => {
    try {
        const student = await Student.findById(req.user.sub).select('type achievements');

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Fetch or create Track record
        let track = await Track.findOne({ student: req.user.sub })
            .populate('courses.course', 'title description');

        if (!track) {
            track = await Track.create({
                student: req.user.sub,
                hoursStudied: 0,
                currentStreak: 0,
                longestStreak: 0,
                coursesCompleted: 0,
                coursesInProgress: 0,
                quizzesCompleted: 0,
                quizzesPassed: 0,
                totalQuizScore: 0,
                lessonsCompleted: 0,
                courses: []
            });
        }

        // Calculate total courses and quizzes from learning path
        const studentType = student.type || 'autism';
        const normalizedType = studentType.toLowerCase() === 'down syndrome' ? 'downSyndrome' : studentType.toLowerCase();

        let totalCourses = 7; // Default fallback
        let totalQuizzes = 70; // Default fallback
        let calculatedQuizzesCompleted = track.quizzesCompleted;

        try {
            const path = await Path.findOne({
                $or: [
                    { type: normalizedType },
                    { title: new RegExp(normalizedType, 'i') },
                    // Legacy/Fallback checks
                    { id: new RegExp(normalizedType, 'i') },
                    { name: new RegExp(normalizedType, 'i') }
                ]
            });

            if (path && path.courses) {
                totalCourses = path.courses.length;

                // Fetch actual published quizzes for the courses in this path
                const pathQuizzes = await Quiz.find({
                    status: 'published',
                    course: { $in: path.courses }
                }).select('_id');

                totalQuizzes = pathQuizzes.length || 70;
                if (pathQuizzes.length > 0) totalQuizzes = pathQuizzes.length;

                const pathQuizIds = pathQuizzes.map(q => q._id);

                // Count ALL quiz attempts (any status) specific to this path
                calculatedQuizzesCompleted = await QuizResult.countDocuments({
                    student: req.user.sub,
                    quiz: { $in: pathQuizIds }
                });
            }
        } catch (err) {
            console.log('Error fetching learning path for progress:', err);
        }

        // --- Prepare Recent Data ---

        // 1. Recent Activity: Sort modified courses by lastAccessedAt
        const courseActivity = track.courses
            .filter(c => c.lastAccessedAt && c.course) // Ensure it has a date and populated course
            .sort((a, b) => new Date(b.lastAccessedAt) - new Date(a.lastAccessedAt))
            .slice(0, 5) // Top 5
            .map(c => ({
                id: c._id,
                action: c.status === 'completed' ? 'Completed course' : 'Studied',
                course: c.course.title,
                score: c.progressPercent + '%',
                time: new Date(c.lastAccessedAt).toLocaleDateString()
            }));

        // 2. Recent Achievements: Use Student achievements, sorted by earnedAt
        const studentWithAchievements = await Student.findById(req.user.sub).populate('achievements.achievement');
        const enrichedAchievements = (studentWithAchievements.achievements || [])
            .sort((a, b) => new Date(b.earnedAt) - new Date(a.earnedAt))
            .slice(0, 3)
            .map(a => {
                if (!a.achievement) return null;
                return {
                    id: a.achievement._id,
                    title: a.achievement.title,
                    desc: a.achievement.description,
                    icon: a.achievement.badge === 'platinum' ? '🏆' : '🥇',
                    date: new Date(a.earnedAt).toLocaleDateString()
                };
            })
            .filter(a => a !== null);


        res.json({
            success: true,
            data: {
                hoursStudied: track.hoursStudied,
                currentStreak: track.currentStreak,
                longestStreak: track.longestStreak,
                coursesCompleted: track.coursesCompleted,
                coursesInProgress: track.coursesInProgress,
                totalCourses: totalCourses,
                quizzesCompleted: calculatedQuizzesCompleted,
                quizzesPassed: track.quizzesPassed,
                totalQuizzes: totalQuizzes,
                lessonsCompleted: track.lessonsCompleted,
                courseProgress: track.courses,
                achievements: student.achievements || [], // Raw list for counts

                // New aggregated fields for Profile
                recentActivity: courseActivity,
                recentAchievementsDisplay: enrichedAchievements,

                lastActivityDate: track.lastActivityDate
            }
        });
    } catch (error) {
        console.error('Get student progress error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Complete course
exports.completeCourse = async (req, res) => {
    try {
        const { courseId } = req.body;
        const studentId = req.user.sub;

        if (!courseId) {
            return res.status(400).json({ error: 'Course ID is required' });
        }

        // 1. Get Course details
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        // 2. Update Track
        let track = await Track.findOne({ student: studentId });
        if (!track) {
            track = await Track.create({ student: studentId });
        }

        // Check if course is already tracked
        const existingCourseIndex = track.courses.findIndex(c => c.course.toString() === courseId);

        if (existingCourseIndex > -1) {
            // Update existing
            if (track.courses[existingCourseIndex].status !== 'completed') {
                track.courses[existingCourseIndex].status = 'completed';
                track.courses[existingCourseIndex].completedAt = new Date();
                track.courses[existingCourseIndex].progressPercent = 100;
                track.coursesCompleted += 1;
                track.coursesInProgress = Math.max(0, track.coursesInProgress - 1);
            }
        } else {
            // Add new completed course
            track.courses.push({
                course: courseId,
                status: 'completed',
                progressPercent: 100,
                startedAt: new Date(),
                completedAt: new Date(),
                lastAccessedAt: new Date()
            });
            track.coursesCompleted += 1;
        }

        await track.save();

        // 3. Award Achievement
        const achievement = await Achievement.findOne({ courseId: courseId });

        let achievementEarned = false;
        let newAchievement = null;

        if (achievement) {
            const student = await Student.findById(studentId);

            const alreadyEarned = student.achievements.some(a => a.achievement.toString() === achievement._id.toString());

            if (!alreadyEarned) {
                student.achievements.push({
                    achievement: achievement._id,
                    earnedAt: new Date()
                });
                await student.save();
                achievementEarned = true;
                newAchievement = achievement;

                // Send Notification
                await Notification.create({
                    recipient: studentId,
                    recipientModel: 'Student',
                    type: 'system',
                    message: `Congratulations! You've earned the "${achievement.title}" badge!`
                });
            }
        }

        res.json({
            success: true,
            data: {
                courseId,
                status: 'completed',
                achievementEarned,
                achievement: newAchievement
            }
        });

    } catch (error) {
        console.error('Complete course error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get achievements
exports.getAchievements = async (req, res) => {
    try {
        const student = await Student.findById(req.user.sub)
            .select('achievements')
            .populate({
                path: 'achievements.achievement',
                model: 'Achievement'
            });

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Transform achievements to match UI expectations
        const transformedAchievements = student.achievements
            .filter(ach => ach.achievement)
            .map(ach => ({
                id: ach.achievement._id.toString(),
                type: ach.achievement.type,
                title: ach.achievement.title,
                course: ach.achievement.course,
                grade: ach.grade || null,
                badge: ach.achievement.badge,
                completedAt: ach.completedAt ? new Date(ach.completedAt).toISOString().split('T')[0] : null,
                earnedAt: ach.earnedAt ? new Date(ach.earnedAt).toISOString().split('T')[0] : null,
                description: ach.achievement.description,
                category: ach.achievement.category
            }))
            .sort((a, b) => {
                const dateA = a.earnedAt ? new Date(a.earnedAt) : new Date(0);
                const dateB = b.earnedAt ? new Date(b.earnedAt) : new Date(0);
                return dateB - dateA;
            });

        res.json({
            success: true,
            data: {
                achievements: transformedAchievements,
                total: transformedAchievements.length
            }
        });
    } catch (error) {
        console.error('Get student achievements error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Update profile picture
exports.updateProfilePicture = async (req, res) => {
    try {
        const { profilePic } = req.body;

        if (!profilePic) {
            return res.status(400).json({ error: 'Profile picture URL is required' });
        }

        // Validate URL or base64 format
        if (!profilePic.startsWith('http') && !profilePic.startsWith('data:image/')) {
            return res.status(400).json({ error: 'Invalid profile picture format. Must be a URL or base64 data URI' });
        }

        const student = await Student.findByIdAndUpdate(
            req.user.sub,
            { profilePic },
            { new: true }
        ).select('-pass');

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        console.log(`✅ Profile picture updated for student: ${student._id}`);

        res.json({
            success: true,
            data: {
                profilePic: student.profilePic
            }
        });
    } catch (error) {
        console.error('Update profile picture error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Change password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current password and new password are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'New password must be at least 6 characters' });
        }

        const studentId = req.user.sub;
        const student = await Student.findById(studentId);

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Check if student has a password (not Firebase-only account)
        if (!student.pass) {
            // Student is Firebase-only, set new password
            const hashedNewPassword = await bcrypt.hash(newPassword, 10);
            await Student.findByIdAndUpdate(studentId, { pass: hashedNewPassword });
            return res.json({
                success: true,
                message: 'Password set successfully. You can now use both Firebase and email/password login.'
            });
        }

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, student.pass);
        if (!isCurrentPasswordValid) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        // Hash and update new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await Student.findByIdAndUpdate(studentId, { pass: hashedPassword });

        console.log(`✅ Password changed for student: ${studentId}`);

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Track active time
exports.trackTime = async (req, res) => {
    try {
        const { minutes } = req.body;
        const studentId = req.user.sub;

        if (!minutes || minutes <= 0) {
            return res.status(400).json({ error: 'Valid minutes required' });
        }

        // 1. Update Student model to keep them online!
        await Student.findByIdAndUpdate(studentId, {
            lastActivity: new Date(),
            isOnline: true
        });

        // 2. Update Track model
        let track = await Track.findOne({ student: studentId });
        if (!track) {
            track = await Track.create({ student: studentId });
        }

        // Increment hoursStudied
        track.hoursStudied = (track.hoursStudied || 0) + (minutes / 60);
        track.lastActivityDate = new Date();

        await track.save();

        res.json({ success: true, hoursStudied: track.hoursStudied });
    } catch (error) {
        console.error('Track time error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Retake lesson
exports.retakeLesson = async (req, res) => {
    try {
        const { courseId, lessonIndex } = req.body;
        const studentId = req.user.sub;

        if (!courseId || lessonIndex === undefined) {
            return res.status(400).json({ error: 'Missing courseId or lessonIndex' });
        }

        // Find Track record
        let track = await Track.findOne({ student: studentId });
        if (!track) {
            return res.status(404).json({ error: 'No progress found for this student' });
        }

        // Find course progress
        let courseProgressIndex = track.courses.findIndex(c => c.course.toString() === courseId);

        if (courseProgressIndex === -1) {
            return res.status(404).json({ error: 'Course progress not found' });
        }

        const courseProgress = track.courses[courseProgressIndex];

        // Check if the lesson is actually completed (can only retake completed lessons)
        if (lessonIndex >= courseProgress.completedLessonsCount) {
            return res.status(400).json({ error: 'Cannot retake a lesson that is not yet completed' });
        }

        // Reset progress to the specified lesson
        courseProgress.completedLessonsCount = lessonIndex;

        // Update progress percent
        if (courseProgress.totalLessons && courseProgress.totalLessons > 0) {
            courseProgress.progressPercent = Math.round((courseProgress.completedLessonsCount / courseProgress.totalLessons) * 100);
        }

        // If course was completed, change status back to in_progress
        if (courseProgress.status === 'completed') {
            courseProgress.status = 'in_progress';
            track.coursesCompleted = Math.max(0, track.coursesCompleted - 1);
            track.coursesInProgress += 1;
        }

        courseProgress.lastAccessedAt = new Date();

        await track.save();

        console.log(`🔄 Student ${studentId} is retaking lesson ${lessonIndex} in course ${courseId}`);

        return res.json({
            success: true,
            completedLessonsCount: courseProgress.completedLessonsCount,
            progressPercent: courseProgress.progressPercent,
            message: 'Lesson reset successfully. You can now retake this lesson.'
        });

    } catch (error) {
        console.error('Retake lesson error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Complete lesson
exports.completeLesson = async (req, res) => {
    try {
        const { courseId, lessonIndex } = req.body;
        const studentId = req.user.sub;

        if (!courseId || lessonIndex === undefined) {
            return res.status(400).json({ error: 'Missing courseId or lessonIndex' });
        }

        let track = await Track.findOne({ student: studentId });
        if (!track) {
            track = new Track({ student: studentId, courses: [] });
        }

        let courseProgressIndex = track.courses.findIndex(c => c.course.toString() === courseId);

        if (courseProgressIndex === -1) {
            track.courses.push({
                course: courseId,
                status: 'in_progress',
                completedLessonsCount: 0,
                progressPercent: 0,
                startedAt: new Date()
            });
            courseProgressIndex = track.courses.length - 1;
        }

        const courseProgress = track.courses[courseProgressIndex];

        if (lessonIndex === courseProgress.completedLessonsCount) {
            courseProgress.completedLessonsCount += 1;

            if (req.body.totalLessons) {
                courseProgress.totalLessons = req.body.totalLessons;
            }

            if (courseProgress.totalLessons > 0) {
                courseProgress.progressPercent = Math.round((courseProgress.completedLessonsCount / courseProgress.totalLessons) * 100);
            }

            if (courseProgress.completedLessonsCount >= courseProgress.totalLessons && courseProgress.totalLessons > 0) {
                courseProgress.status = 'completed';
                courseProgress.completedAt = new Date();
                track.coursesCompleted += 1;
                track.coursesInProgress = Math.max(0, track.coursesInProgress - 1);
            }

            courseProgress.lastAccessedAt = new Date();

            await track.save();

            // Award achievements
            const course = await Course.findById(courseId);
            const achievementsEarned = [];

            if (course) {
                const Lesson = require('../models/Lesson');
                const lessonDoc = await Lesson.findOne({ courseId: courseId }).sort({ order: 1 }).skip(lessonIndex);

                const achievementsToAward = [];

                if (lessonDoc && lessonDoc.achievementId) {
                    const ach = await Achievement.findById(lessonDoc.achievementId);
                    if (ach) achievementsToAward.push(ach);
                } else {
                    const allAchievements = await Achievement.find({ type: { $in: ['course', 'extra'] } });
                    const courseAchievements = allAchievements.filter(ach => {
                        if (!ach.course) return false;
                        const achCourse = ach.course.toLowerCase();
                        const courseTitle = course.title.toLowerCase();
                        return courseTitle.includes(achCourse) || achCourse.includes(courseTitle);
                    });

                    if (courseAchievements.length > 0) {
                        const totalLessons = courseProgress.totalLessons || 10;
                        const achievementsPerCourse = Math.min(courseAchievements.length, 3);
                        const lessonsPerAchievement = Math.ceil(totalLessons / achievementsPerCourse);
                        const currentLessonNumber = courseProgress.completedLessonsCount;
                        const achievementIndex = Math.floor((currentLessonNumber - 1) / lessonsPerAchievement);

                        if (achievementIndex < courseAchievements.length) {
                            achievementsToAward.push(courseAchievements[achievementIndex]);
                        }
                    }
                }

                if (achievementsToAward.length > 0) {
                    const student = await Student.findById(studentId);
                    if (student) {
                        for (const achievement of achievementsToAward) {
                            const alreadyHas = student.achievements.some(
                                a => a.achievement.toString() === achievement._id.toString()
                            );

                            if (!alreadyHas) {
                                student.achievements.push({
                                    achievement: achievement._id,
                                    completedAt: new Date(),
                                    earnedAt: new Date()
                                });
                                await student.save();

                                await Notification.create({
                                    recipient: studentId,
                                    recipientModel: 'Student',
                                    type: 'system',
                                    message: `🎉 Achievement Unlocked: "${achievement.title}"!`
                                });
                            }

                            achievementsEarned.push({
                                id: achievement._id,
                                title: achievement.title,
                                description: achievement.description,
                                badge: achievement.badge
                            });
                        }
                    }
                }
            }

            return res.json({
                success: true,
                completedLessonsCount: courseProgress.completedLessonsCount,
                progressPercent: courseProgress.progressPercent,
                isCourseCompleted: courseProgress.status === 'completed',
                achievementsEarned: achievementsEarned
            });
        } else if (lessonIndex < courseProgress.completedLessonsCount) {
            return res.json({ success: true, message: 'Lesson already completed' });
        } else {
            return res.status(403).json({ error: 'Cannot skip lessons. Please complete previous lessons first.' });
        }
    } catch (error) {
        console.error('Complete lesson error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Like/unlike content
exports.likeContent = async (req, res) => {
    try {
        const { id } = req.params;
        const { action } = req.body;

        const content = await Content.findById(id);
        if (!content) {
            return res.status(404).json({ success: false, error: 'Content not found' });
        }

        if (action === 'like') {
            content.likes = (content.likes || 0) + 1;
            content.lastLikedAt = new Date();
        } else if (action === 'unlike') {
            content.likes = Math.max(0, (content.likes || 0) - 1);
        } else {
            return res.status(400).json({ success: false, error: 'Invalid action' });
        }

        await content.save();

        res.json({
            success: true,
            data: {
                contentId: content._id,
                likes: content.likes
            }
        });
    } catch (error) {
        console.error('Error updating content likes:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// View content
exports.viewContent = async (req, res) => {
    try {
        const { id } = req.params;

        const content = await Content.findByIdAndUpdate(
            id,
            {
                $inc: { views: 1 },
                $set: { lastViewedAt: new Date() }
            },
            { new: true }
        );

        if (!content) {
            return res.status(404).json({ success: false, error: 'Content not found' });
        }

        res.json({
            success: true,
            data: {
                contentId: id,
                views: content.views
            }
        });
    } catch (error) {
        console.error('Error updating content views:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get student's personalized learning path
exports.getPersonalizedPath = async (req, res) => {
    try {
        const studentId = req.user.sub;
        
        // Get student info with current difficulty level
        const student = await Student.findById(studentId).select('type currentDifficulty');
        if (!student) {
            return res.status(404).json({ success: false, error: 'Student not found' });
        }

        // Get student's path
        const StudentPath = require('../models/StudentPath');
        const studentPath = await StudentPath.findOne({ student: studentId })
            .populate({
                path: 'path',
                select: 'title type'
            })
            .populate({
                path: 'assignedContent.content',
                populate: [
                    { path: 'course', select: 'title order' },
                    { path: 'topic', select: 'title' },
                    { path: 'lesson', select: 'title' }
                ]
            })
            .lean();

        if (!studentPath) {
            return res.status(404).json({ 
                success: false, 
                error: 'No personalized path found. Please complete the diagnostic quiz first.' 
            });
        }

        // Filter content by current difficulty level if it's set
        let filteredContent = studentPath.assignedContent;
        if (student.currentDifficulty) {
            filteredContent = studentPath.assignedContent.filter(item => {
                return item.content && item.content.difficulty === student.currentDifficulty;
            });
            console.log(`📊 Filtered ${filteredContent.length}/${studentPath.assignedContent.length} items for ${student.currentDifficulty} difficulty`);
        }

        // Group content by course
        const courseMap = new Map();
        filteredContent.forEach(item => {
            if (!item.content || !item.content.course) return;
            
            const courseId = item.content.course._id.toString();
            if (!courseMap.has(courseId)) {
                courseMap.set(courseId, {
                    _id: courseId,
                    title: item.content.course.title,
                    order: item.content.course.order,
                    topics: new Map()
                });
            }
            
            const course = courseMap.get(courseId);
            const topicId = item.content.topic?._id?.toString();
            if (topicId && !course.topics.has(topicId)) {
                course.topics.set(topicId, {
                    _id: topicId,
                    title: item.content.topic.title,
                    lessons: []
                });
            }
            
            if (topicId && item.content.lesson) {
                const topic = course.topics.get(topicId);
                if (!topic.lessons.some(l => l._id === item.content.lesson._id.toString())) {
                    topic.lessons.push({
                        _id: item.content.lesson._id,
                        title: item.content.lesson.title
                    });
                }
            }
        });

        // Convert maps to arrays and sort
        const courses = Array.from(courseMap.values())
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map(course => ({
                ...course,
                topics: Array.from(course.topics.values())
            }));

        res.json({
            success: true,
            data: {
                pathId: studentPath.path._id,
                pathTitle: studentPath.path.title,
                pathType: studentPath.path.type,
                currentDifficulty: student.currentDifficulty,
                totalContent: studentPath.assignedContent.length,
                filteredContent: filteredContent.length,
                courses: courses,
                status: studentPath.status
            }
        });

    } catch (error) {
        console.error('Error getting personalized path:', error);
        res.status(500).json({ success: false, error: 'Server error', details: error.message });
    }
};
