const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Admin = require('../models/Admin');
const Path = require('../models/Path');
const Course = require('../models/Course');
const Topic = require('../models/Topic');
const Lesson = require('../models/Lesson');
const Content = require('../models/Content');
const Quiz = require('../models/Quiz');
const QuizResult = require('../models/QuizResult');
const Track = require('../models/Track');
const { deleteFirebaseUser } = require('../config/firebase');
const { createNotification } = require('./notificationController');

// Helper for inactivity check
const INACTIVITY_THRESHOLD = 30 * 60 * 1000; // 30 minutes

// Admin Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Email and password are required' });
        }

        const admin = await Admin.findOne({ email: email.toLowerCase().trim() });

        if (!admin || admin.password !== password) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        res.json({
            success: true,
            message: 'Login successful',
            adminName: 'Admin',
            token: 'admin_token_' + Date.now()
        });
    } catch (error) {
        console.error('Error during admin login:', error);
        res.status(500).json({ success: false, error: 'Server error during login' });
    }
};

// Get all users
exports.getUsers = async (req, res) => {
    try {
        const students = await Student.find({}).select('name email type status suspended createdAt profilePic lastActivity isOnline');
        const teachers = await Teacher.find({}).select('fullName email userStatus ranking profilePic headline bio createdAt isOnline lastActivity');

        const now = new Date();

        const studentUsers = students.map(student => {
            const isActive = student.isOnline && student.lastActivity && (now - new Date(student.lastActivity)) < INACTIVITY_THRESHOLD;
            if (student.isOnline && !isActive) {
                Student.findByIdAndUpdate(student._id, { isOnline: false }).catch(err => console.error(err));
            }
            return {
                id: student._id.toString(),
                name: student.name,
                email: student.email,
                role: 'student',
                status: student.userStatus || 'active',
                online: isActive,
                category: student.type === 'autism' ? 'Autism' : student.type === 'downSyndrome' ? 'Down Syndrome' : 'Not Assigned',
                avatar: student.profilePic,
                createdAt: student.createdAt,
                lastActivity: student.lastActivity
            };
        });

        const teacherUsers = teachers.map(teacher => {
            const isActive = teacher.isOnline && teacher.lastActivity && (now - new Date(teacher.lastActivity)) < INACTIVITY_THRESHOLD;
            if (teacher.isOnline && !isActive) {
                Teacher.findByIdAndUpdate(teacher._id, { isOnline: false }).catch(err => console.error(err));
            }
            return {
                id: teacher._id.toString(),
                name: teacher.fullName,
                email: teacher.email,
                role: 'instructor',
                status: teacher.userStatus === 'suspended' ? 'suspended' : teacher.userStatus === 'pending' ? 'pending' : 'active',
                online: isActive,
                category: 'N/A',
                avatar: teacher.profilePic,
                headline: teacher.headline,
                bio: teacher.bio,
                description: teacher.bio,
                ranking: teacher.ranking || 0,
                createdAt: teacher.createdAt,
                joinedAt: teacher.createdAt,
                lastActivity: teacher.lastActivity
            };
        });

        const allUsers = [...studentUsers, ...teacherUsers].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json({ success: true, count: allUsers.length, data: allUsers });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get student performance profiles
exports.getStudentProfiles = async (req, res) => {
    try {
        const students = await Student.find({}).select('_id name type');

        const studentProfiles = await Promise.all(
            students.map(async (student) => {
                try {
                    const track = await Track.findOne({ student: student._id });
                    const minutesStudied = track ? Math.round((track.hoursStudied || 0) * 60) : 0;
                    const studentType = student.type || 'autism';
                    const normalizedType = studentType.toLowerCase() === 'down syndrome' ? 'downSyndrome' : studentType.toLowerCase();

                    const path = await Path.findOne({
                        $or: [{ type: normalizedType }, { title: new RegExp(normalizedType, 'i') }]
                    });

                    let avgScore = 0;
                    let completionRate = 0;

                    if (path && path.courses) {
                        const pathQuizzes = await Quiz.find({ status: 'published', course: { $in: path.courses } }).select('_id');
                        const pathQuizIds = pathQuizzes.map(q => q._id);
                        const quizResults = await QuizResult.find({ student: student._id, quiz: { $in: pathQuizIds }, status: 'completed' }).select('grade');

                        if (quizResults.length > 0) {
                            const totalScore = quizResults.reduce((sum, result) => sum + (result.grade || 0), 0);
                            avgScore = Math.round(totalScore / quizResults.length);
                        }

                        const totalCourses = path.courses.length;
                        const completedCourses = track ? (track.coursesCompleted || 0) : 0;
                        completionRate = totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0;
                    }

                    return {
                        userId: student._id.toString(),
                        hours: minutesStudied,
                        performance: { avgScore, completionRate }
                    };
                } catch (err) {
                    console.error(`Error calculating stats for student ${student._id}:`, err);
                    return { userId: student._id.toString(), hours: 0, performance: { avgScore: 0, completionRate: 0 } };
                }
            })
        );

        res.json({ success: true, data: studentProfiles });
    } catch (error) {
        console.error('Error fetching student profiles:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get instructor profiles
exports.getInstructorProfiles = async (req, res) => {
    try {
        const teachers = await Teacher.find({}).select('_id fullName');

        const instructorProfiles = await Promise.all(
            teachers.map(async (teacher) => {
                try {
                    const latestContent = await Content.findOne({ teacher: teacher._id, status: { $ne: 'deleted' } })
                        .sort({ createdAt: -1 }).select('title').limit(1);

                    return {
                        userId: teacher._id.toString(),
                        latestUpload: latestContent ? latestContent.title : null
                    };
                } catch (err) {
                    return { userId: teacher._id.toString(), latestUpload: null };
                }
            })
        );

        res.json({ success: true, data: instructorProfiles });
    } catch (error) {
        console.error('Error fetching instructor profiles:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Suspend user
exports.suspendUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!role) return res.status(400).json({ success: false, error: 'Role is required' });

        if (role === 'student') {
            const student = await Student.findById(id);
            if (!student) return res.status(404).json({ success: false, error: 'Student not found' });
            if (student.status === 'pending') return res.status(400).json({ success: false, error: 'Cannot suspend a pending student.' });

            student.suspended = true;
            student.status = 'inactive';
            await student.save();

            await createNotification({ recipient: student._id, recipientModel: 'Student', message: 'Your account has been suspended.', type: 'suspended' });
            return res.json({ success: true, data: { id, role: 'student', status: 'suspended' } });
        } else if (role === 'instructor') {
            const teacher = await Teacher.findById(id);
            if (!teacher) return res.status(404).json({ success: false, error: 'Teacher not found' });
            if (teacher.userStatus === 'pending') return res.status(400).json({ success: false, error: 'Cannot suspend a pending instructor.' });

            teacher.userStatus = 'suspended';
            await teacher.save();

            await createNotification({ recipient: teacher._id, recipientModel: 'Teacher', message: 'Your account has been suspended.', type: 'suspended' });
            return res.json({ success: true, data: { id, role: 'instructor', status: 'suspended' } });
        }
        return res.status(400).json({ success: false, error: 'Invalid role' });
    } catch (error) {
        console.error('Error suspending user:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Reinstate user
exports.reinstateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!role) return res.status(400).json({ success: false, error: 'Role is required' });

        if (role === 'student') {
            const student = await Student.findByIdAndUpdate(id, { suspended: false, status: 'active' }, { new: true });
            if (!student) return res.status(404).json({ success: false, error: 'Student not found' });

            await createNotification({ recipient: student._id, recipientModel: 'Student', message: 'Your account has been reinstated.', type: 'system' });
            return res.json({ success: true, data: { id, role: 'student', status: 'active' } });
        } else if (role === 'instructor') {
            const teacher = await Teacher.findByIdAndUpdate(id, { userStatus: 'active' }, { new: true });
            if (!teacher) return res.status(404).json({ success: false, error: 'Teacher not found' });

            await createNotification({ recipient: teacher._id, recipientModel: 'Teacher', message: 'Your account has been reinstated.', type: 'system' });
            return res.json({ success: true, data: { id, role: 'instructor', status: 'active' } });
        }
        return res.status(400).json({ success: false, error: 'Invalid role' });
    } catch (error) {
        console.error('Error reinstating user:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Delete user
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!role) return res.status(400).json({ success: false, error: 'Role is required' });

        if (role === 'student') {
            const student = await Student.findById(id);
            if (!student) return res.status(404).json({ success: false, error: 'Student not found' });

            if (student.firebaseUID) {
                await deleteFirebaseUser(student.firebaseUID);
            }
            await Student.findByIdAndDelete(id);
            return res.json({ success: true, message: 'Student deleted successfully' });
        } else if (role === 'instructor') {
            const teacher = await Teacher.findById(id);
            if (!teacher) return res.status(404).json({ success: false, error: 'Teacher not found' });

            if (teacher.firebaseUID) {
                await deleteFirebaseUser(teacher.firebaseUID);
            }
            await Teacher.findByIdAndDelete(id);
            return res.json({ success: true, message: 'Teacher deleted successfully' });
        }
        return res.status(400).json({ success: false, error: 'Invalid role' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Cleanup inactive users
exports.cleanupInactiveUsers = async (req, res) => {
    try {
        const cutoffTime = new Date(Date.now() - INACTIVITY_THRESHOLD);
        const teachersResult = await Teacher.updateMany({ isOnline: true, lastActivity: { $lt: cutoffTime } }, { isOnline: false });
        // Note: Students are handled ad-hoc in getUsers but could be added here if needed.
        // The original route only updated teachers in the 'updateMany' call variable 'teachersResult',
        // but the response referenced 'studentsUpdated'. Assuming logic was to update teachers only or both?
        // Based on original code: 'studentsUpdated: studentsResult.modifiedCount' (where studentsResult was undefined)
        // I will just return teachersResult for now as that's what was effectively doing something.
        res.json({ success: true, message: 'Inactive users marked as offline', teachersUpdated: teachersResult.modifiedCount });
    } catch (error) {
        console.error('Error cleaning up inactive users:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get teacher content
exports.getTeacherContent = async (req, res) => {
    try {
        const teacher = await Teacher.findOne({ email: req.params.email });
        if (!teacher) return res.status(404).json({ success: false, error: 'Teacher not found' });

        const content = await Content.find({ teacher: teacher._id, status: { $ne: 'deleted' } })
            .populate('path', 'type') // Populate path to get category
            .select('title path contentType topic lesson course description difficulty status createdAt views likes')
            .sort({ createdAt: -1 });

        // Transform data to include category from path.type
        const transformedContent = content.map(item => ({
            _id: item._id,
            title: item.title,
            category: item.path?.type || null, // Extract category from path
            contentType: item.contentType,
            topic: item.topic,
            lesson: item.lesson,
            course: item.course,
            description: item.description,
            difficulty: item.difficulty,
            status: item.status,
            createdAt: item.createdAt,
            views: item.views,
            likes: item.likes
        }));

        res.json({ success: true, data: transformedContent });
    } catch (error) {
        console.error('Error fetching teacher content:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get teacher quizzes
exports.getTeacherQuizzes = async (req, res) => {
    try {
        const teacher = await Teacher.findOne({ email: req.params.email });
        if (!teacher) return res.status(404).json({ success: false, error: 'Teacher not found' });

        const quizzes = await Quiz.find({ teacher: teacher._id })
            .populate('path', 'type') // Populate path to get category
            .select('title path topic lesson course difficulty status createdAt questionsAndAnswers views likes')
            .sort({ createdAt: -1 });

        // Transform data to include category from path.type
        const transformedQuizzes = quizzes.map(item => ({
            _id: item._id,
            title: item.title,
            category: item.path?.type || null, // Extract category from path
            topic: item.topic,
            lesson: item.lesson,
            course: item.course,
            difficulty: item.difficulty,
            status: item.status,
            createdAt: item.createdAt,
            questionsAndAnswers: item.questionsAndAnswers,
            views: item.views,
            likes: item.likes
        }));

        res.json({ success: true, data: transformedQuizzes });
    } catch (error) {
        console.error('Error fetching teacher quizzes:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get teacher quiz results
exports.getTeacherQuizResults = async (req, res) => {
    try {
        const teacher = await Teacher.findOne({ email: req.params.email });
        if (!teacher) return res.status(404).json({ success: false, error: 'Teacher not found' });

        const quizzes = await Quiz.find({ teacher: teacher._id }).select('_id');
        const quizIds = quizzes.map(q => q._id);

        const results = await QuizResult.find({ quiz: { $in: quizIds } })
            .populate('student', 'fullName profilePic')
            .sort({ updatedAt: -1 })
            .limit(50);

        const formattedResults = results.map(result => ({
            student: result.student?.fullName || 'Student',
            profilePic: result.student?.profilePic || '',
            date: new Date(result.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
            grade: result.status === 'completed' && result.grade != null ? `${Math.round(result.grade)}%` : '--%',
            status: result.status === 'completed' ? 'Complete' : 'Paused'
        }));

        res.json({ success: true, data: formattedResults });
    } catch (error) {
        console.error('Error fetching quiz results:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get weekly metrics (current week only - Monday to Sunday)
exports.getWeeklyMetrics = async (req, res) => {
    try {
        const teacher = await Teacher.findOne({ email: req.params.email });
        if (!teacher) return res.status(404).json({ success: false, error: 'Teacher not found' });

        // Calculate current week range (Monday to Sunday)
        const now = new Date();
        const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        
        // Calculate days to subtract to get to Monday
        const daysToMonday = currentDay === 0 ? 6 : currentDay - 1;
        
        // Start of week (Monday at 00:00:00)
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - daysToMonday);
        weekStart.setHours(0, 0, 0, 0);
        
        // End of week (Sunday at 23:59:59)
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        console.log(`📊 Fetching weekly metrics for ${req.params.email}`);
        console.log(`📅 Current week: ${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`);

        const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const weeklyData = daysOfWeek.map(day => ({ day, views: 0, likes: 0 }));

        // Fetch content and quizzes
        const content = await Content.find({ teacher: teacher._id, status: { $ne: 'deleted' } })
            .select('views likes lastViewedAt lastLikedAt');
        const quizzes = await Quiz.find({ teacher: teacher._id })
            .select('views likes lastViewedAt lastLikedAt');

        const allItems = [...content, ...quizzes];

        // Only count views/likes that happened THIS WEEK
        allItems.forEach(item => {
            // Check if lastViewedAt is within current week
            if (item.lastViewedAt && item.views > 0) {
                const viewedDate = new Date(item.lastViewedAt);
                if (viewedDate >= weekStart && viewedDate <= weekEnd) {
                    const dayIndex = viewedDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
                    const dIdx = dayIndex === 0 ? 6 : dayIndex - 1; // Convert to 0=Monday, 6=Sunday
                    weeklyData[dIdx].views += item.views;
                }
            }
            
            // Check if lastLikedAt is within current week
            if (item.lastLikedAt && item.likes > 0) {
                const likedDate = new Date(item.lastLikedAt);
                if (likedDate >= weekStart && likedDate <= weekEnd) {
                    const dayIndex = likedDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
                    const dIdx = dayIndex === 0 ? 6 : dayIndex - 1; // Convert to 0=Monday, 6=Sunday
                    weeklyData[dIdx].likes += item.likes;
                }
            }
        });

        console.log(`✅ Weekly data:`, weeklyData);

        res.json({ success: true, data: weeklyData });
    } catch (error) {
        console.error('Error fetching weekly metrics:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get deleted content
exports.getDeletedContent = async (req, res) => {
    try {
        const teacher = await Teacher.findOne({ email: req.params.email });
        if (!teacher) return res.status(404).json({ success: false, error: 'Teacher not found' });

        const deletedContent = await Content.find({ teacher: teacher._id, status: 'deleted' })
            .populate('path', 'type') // Populate path to get category
            .select('title path contentType topic lesson course description difficulty status previousStatus deletedAt createdAt')
            .sort({ deletedAt: -1 });

        // Transform data to include category from path.type
        const transformedContent = deletedContent.map(item => ({
            _id: item._id,
            title: item.title,
            category: item.path?.type || null, // Extract category from path
            contentType: item.contentType,
            topic: item.topic,
            lesson: item.lesson,
            course: item.course,
            description: item.description,
            difficulty: item.difficulty,
            status: item.status,
            previousStatus: item.previousStatus,
            deletedAt: item.deletedAt,
            createdAt: item.createdAt
        }));

        res.json({ success: true, data: transformedContent });
    } catch (error) {
        console.error('Error fetching deleted teacher content:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get deleted quizzes
exports.getDeletedQuizzes = async (req, res) => {
    try {
        const teacher = await Teacher.findOne({ email: req.params.email });
        if (!teacher) return res.status(404).json({ success: false, error: 'Teacher not found' });

        const deletedQuizzes = await Quiz.find({ teacher: teacher._id, status: 'archived' })
            .populate('path', 'type') // Populate path to get category
            .select('title path topic lesson course difficulty status previousStatus createdAt updatedAt')
            .sort({ updatedAt: -1 });

        // Transform data to include category from path.type
        const transformedQuizzes = deletedQuizzes.map(item => ({
            _id: item._id,
            title: item.title,
            category: item.path?.type || null, // Extract category from path
            topic: item.topic,
            lesson: item.lesson,
            course: item.course,
            difficulty: item.difficulty,
            status: item.status,
            previousStatus: item.previousStatus,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt
        }));

        res.json({ success: true, data: transformedQuizzes });
    } catch (error) {
        console.error('Error fetching deleted teacher quizzes:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Learning Paths: Get All
exports.getLearningPaths = async (req, res) => {
    try {
        const paths = await Path.find({ isPublished: true }).sort({ createdAt: 1 });
        const pathsWithData = await Promise.all(paths.map(async (path) => {
            const courses = await Course.find({ pathId: path._id }).sort({ order: 1 });
            const coursesWithData = await Promise.all(courses.map(async (course) => {
                const topics = await Topic.find({ courseId: course._id, pathId: path._id }).sort({ order: 1 });
                const topicsWithData = await Promise.all(topics.map(async (topic) => {
                    const lessons = await Lesson.find({ topicId: topic._id, courseId: course._id, pathId: path._id })
                        .sort({ order: 1 }).populate('achievementId');
                    return {
                        id: topic._id, name: topic.title,
                        lessons: lessons.map(l => ({ id: l._id, name: l.title, achievement: l.achievementId }))
                    };
                }));
                return { id: course._id, name: course.title, topics: topicsWithData };
            }));
            return { id: path._id, name: path.title, type: path.type, courses: coursesWithData };
        }));
        res.json({ success: true, data: pathsWithData });
    } catch (error) {
        console.error('Error fetching learning paths:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Create Learning Path
exports.createLearningPath = async (req, res) => {
    try {
        const { name, type } = req.body;
        if (!name || !type) return res.status(400).json({ success: false, error: 'Name and type are required' });
        if (!['autism', 'downSyndrome'].includes(type)) return res.status(400).json({ success: false, error: 'Invalid type' });

        const path = await Path.create({ type, title: name, courses: [], isPublished: true });
        res.json({ success: true, data: { id: path._id, name: path.title, courses: [] } });
    } catch (error) {
        console.error('Error creating learning path:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Create Course
exports.createCourse = async (req, res) => {
    try {
        const { pathId } = req.params;
        const { name } = req.body;
        if (!name) return res.status(400).json({ success: false, error: 'Course name is required' });

        const path = await Path.findById(pathId);
        if (!path) return res.status(404).json({ success: false, error: 'Path not found' });

        const course = await Course.create({ title: name, pathId, topics: [], order: path.courses.length, isPublished: true });
        path.courses.push(course._id);
        await path.save();

        res.json({ success: true, data: { id: course._id, name: course.title, topics: [] } });
    } catch (error) {
        console.error('Error creating course:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Create Topic
exports.createTopic = async (req, res) => {
    try {
        const { pathId, courseId } = req.params;
        const { name } = req.body;
        if (!name) return res.status(400).json({ success: false, error: 'Topic name is required' });

        const course = await Course.findById(courseId);
        if (!course || course.pathId.toString() !== pathId) return res.status(404).json({ success: false, error: 'Course not found' });

        const topic = await Topic.create({ title: name, courseId, pathId, lessons: [], order: course.topics.length });
        course.topics.push(topic._id);
        await course.save();

        res.json({ success: true, data: { id: topic._id, name: topic.title, lessons: [] } });
    } catch (error) {
        console.error('Error creating topic:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Create Lesson
exports.createLesson = async (req, res) => {
    try {
        const { pathId, courseId, topicId } = req.params;
        const { name } = req.body;
        if (!name) return res.status(400).json({ success: false, error: 'Lesson name is required' });

        const topic = await Topic.findById(topicId);
        if (!topic || topic.courseId.toString() !== courseId || topic.pathId.toString() !== pathId) return res.status(404).json({ success: false, error: 'Topic not found' });

        const lesson = await Lesson.create({ title: name, topicId, courseId, pathId, order: topic.lessons.length });
        topic.lessons.push(lesson._id);
        await topic.save();

        res.json({ success: true, data: { id: lesson._id, name: lesson.title } });
    } catch (error) {
        console.error('Error creating lesson:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Rename Course
exports.renameCourse = async (req, res) => {
    try {
        const { pathId, courseId } = req.params;
        const { name } = req.body;
        if (!name) return res.status(400).json({ success: false, error: 'Course name is required' });

        const course = await Course.findByIdAndUpdate(courseId, { title: name }, { new: true });
        if (!course || course.pathId.toString() !== pathId) return res.status(404).json({ success: false, error: 'Course not found' });

        res.json({ success: true, data: { id: course._id, name: course.title } });
    } catch (error) {
        console.error('Error renaming course:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Rename Topic
exports.renameTopic = async (req, res) => {
    try {
        const { pathId, courseId, topicId } = req.params;
        const { name } = req.body;
        if (!name) return res.status(400).json({ success: false, error: 'Topic name is required' });

        const topic = await Topic.findByIdAndUpdate(topicId, { title: name }, { new: true });
        if (!topic || topic.courseId.toString() !== courseId || topic.pathId.toString() !== pathId) return res.status(404).json({ success: false, error: 'Topic not found' });

        res.json({ success: true, data: { id: topic._id, name: topic.title } });
    } catch (error) {
        console.error('Error renaming topic:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Rename Lesson
exports.renameLesson = async (req, res) => {
    try {
        const { pathId, courseId, topicId, lessonId } = req.params;
        const { name } = req.body;
        if (!name) return res.status(400).json({ success: false, error: 'Lesson name is required' });

        const lesson = await Lesson.findByIdAndUpdate(lessonId, { title: name }, { new: true });
        if (!lesson || lesson.topicId.toString() !== topicId) return res.status(404).json({ success: false, error: 'Lesson not found' });

        res.json({ success: true, data: { id: lesson._id, name: lesson.title } });
    } catch (error) {
        console.error('Error renaming lesson:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Bulk Import
exports.bulkImportLearningPaths = async (req, res) => {
    try {
        const { data } = req.body;
        if (!data || !Array.isArray(data)) return res.status(400).json({ success: false, error: 'Invalid data format' });

        let totals = { paths: 0, courses: 0, topics: 0, lessons: 0 };
        const errors = [];

        for (const pathData of data) {
            try {
                let pathType = 'autism';
                const gp = (pathData.GeneralPath || '').toLowerCase();
                if (gp.includes('down')) pathType = 'downSyndrome';
                else if (gp.includes('autism')) pathType = 'autism';

                const path = await Path.create({
                    type: pathType,
                    title: pathData.pathTitle || pathData.name || `Path ${totals.paths + 1}`,
                    courses: [],
                    isPublished: true
                });
                totals.paths++;

                const courses = pathData.Courses || pathData.courses || [];
                for (let i = 0; i < courses.length; i++) {
                    try {
                        const cData = courses[i];
                        const course = await Course.create({
                            title: cData.CoursesTitle || cData.name || cData.title || `Course ${i + 1}`,
                            pathId: path._id,
                            topics: [],
                            order: i + 1,
                            isPublished: true
                        });
                        path.courses.push(course._id);
                        totals.courses++;

                        const topics = cData.Topics || cData.topics || [];
                        for (let j = 0; j < topics.length; j++) {
                            try {
                                const tData = topics[j];
                                const topic = await Topic.create({
                                    title: tData.TopicsTitle || tData.name || tData.title || `Topic ${j + 1}`,
                                    courseId: course._id,
                                    pathId: path._id,
                                    lessons: [],
                                    order: j + 1
                                });
                                course.topics.push(topic._id);
                                totals.topics++;

                                const lessons = tData.lessons || [];
                                for (let k = 0; k < lessons.length; k++) {
                                    const lName = typeof lessons[k] === 'string' ? lessons[k] : (lessons[k].name || lessons[k].title);
                                    const lesson = await Lesson.create({
                                        title: lName || `Lesson ${k + 1}`,
                                        topicId: topic._id,
                                        courseId: course._id,
                                        pathId: path._id,
                                        order: k + 1
                                    });
                                    topic.lessons.push(lesson._id);
                                    totals.lessons++;
                                }
                                await topic.save();
                            } catch (e) { errors.push(`Topic error: ${e.message}`); }
                        }
                        await course.save();
                    } catch (e) { errors.push(`Course error: ${e.message}`); }
                }
                await path.save();
            } catch (e) { errors.push(`Path error: ${e.message}`); }
        }

        res.json({ success: true, message: 'Bulk import completed', summary: totals, errors: errors.length > 0 ? errors : undefined });
    } catch (error) {
        console.error('Bulk import error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Delete Path
exports.deleteLearningPath = async (req, res) => {
    try {
        const { pathId } = req.params;
        const path = await Path.findById(pathId);
        if (!path) return res.status(404).json({ success: false, error: 'Path not found' });

        const courses = await Course.find({ pathId });
        for (const c of courses) {
            const topics = await Topic.find({ courseId: c._id });
            for (const t of topics) {
                await Lesson.deleteMany({ topicId: t._id });
                await Topic.findByIdAndDelete(t._id);
            }
            await Course.findByIdAndDelete(c._id);
        }
        await Path.findByIdAndDelete(pathId);

        res.json({ success: true, message: 'Path deleted successfully' });
    } catch (error) {
        console.error('Delete path error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Delete Course
exports.deleteCourse = async (req, res) => {
    try {
        const { pathId, courseId } = req.params;
        const course = await Course.findById(courseId);
        if (!course || course.pathId.toString() !== pathId) return res.status(404).json({ success: false, error: 'Course not found' });

        const topics = await Topic.find({ courseId });
        for (const t of topics) {
            await Lesson.deleteMany({ topicId: t._id });
            await Topic.findByIdAndDelete(t._id);
        }

        const path = await Path.findById(pathId);
        if (path) {
            path.courses = path.courses.filter(id => id.toString() !== courseId);
            await path.save();
        }
        await Course.findByIdAndDelete(courseId);

        res.json({ success: true, message: 'Course deleted successfully' });
    } catch (error) {
        console.error('Delete course error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Delete Topic
exports.deleteTopic = async (req, res) => {
    try {
        const { pathId, courseId, topicId } = req.params;
        const topic = await Topic.findById(topicId);
        if (!topic || topic.courseId.toString() !== courseId) return res.status(404).json({ success: false, error: 'Topic not found' });

        await Lesson.deleteMany({ topicId });

        const course = await Course.findById(courseId);
        if (course) {
            course.topics = course.topics.filter(id => id.toString() !== topicId);
            await course.save();
        }
        await Topic.findByIdAndDelete(topicId);

        res.json({ success: true, message: 'Topic deleted successfully' });
    } catch (error) {
        console.error('Delete topic error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Delete Lesson
exports.deleteLesson = async (req, res) => {
    try {
        const { pathId, courseId, topicId, lessonId } = req.params;
        const lesson = await Lesson.findById(lessonId);
        if (!lesson || lesson.topicId.toString() !== topicId) return res.status(404).json({ success: false, error: 'Lesson not found' });

        const topic = await Topic.findById(topicId);
        if (topic) {
            topic.lessons = topic.lessons.filter(id => id.toString() !== lessonId);
            await topic.save();
        }
        await Lesson.findByIdAndDelete(lessonId);

        res.json({ success: true, message: 'Lesson deleted successfully' });
    } catch (error) {
        console.error('Delete lesson error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
