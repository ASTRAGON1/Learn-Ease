const mongoose = require('mongoose');

const trackSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
        unique: true
    },
    // Overall Stats
    hoursStudied: {
        type: Number,
        default: 0,
        min: 0
    },
    currentStreak: {
        type: Number,
        default: 0,
        min: 0
    },
    longestStreak: {
        type: Number,
        default: 0,
        min: 0
    },
    lastActivityDate: {
        type: Date,
        default: Date.now
    },
    // Aggregated Counts
    coursesCompleted: {
        type: Number,
        default: 0,
        min: 0
    },
    coursesInProgress: {
        type: Number,
        default: 0,
        min: 0
    },
    quizzesCompleted: {
        type: Number,
        default: 0,
        min: 0
    },
    quizzesPassed: {
        type: Number,
        default: 0,
        min: 0
    },
    totalQuizScore: {
        type: Number,
        default: 0,
        min: 0
    },

    // Detailed Course Progress
    courses: [{
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
            required: true
        },
        status: {
            type: String,
            enum: ['not_started', 'in_progress', 'completed'],
            default: 'not_started'
        },

        totalLessons: {
            type: Number,
            default: 0
        },
        lastLesson: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Lesson'
        },
        lastContent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Content'
        },
        progressPercent: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },
        startedAt: {
            type: Date,
            default: Date.now
        },
        completedAt: Date,
        lastAccessedAt: {
            type: Date,
            default: Date.now
        }
    }],
    // For "Resume where you left off" functionality
    lastActivePath: {
        type: String, // e.g., "/course/123/lesson/456"
        trim: true
    }
}, {
    timestamps: true,
    collection: 'Track'
});

trackSchema.index({ 'courses.course': 1 });

const Track = mongoose.model('Track', trackSchema);

module.exports = Track;
