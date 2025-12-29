const mongoose = require('mongoose');

const studentPathSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: [true, 'Student is required']
    },
    StudentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: [true, 'Student ID is required']
    },
    // Inherited path reference (determines autism/downSyndrome type via the Path model)
    path: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Path',
        required: [true, 'Path is required']
    },
    assignedContent: [{
        content: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Content',
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'in-progress', 'completed'],
            default: 'pending'
        },
        addedDate: {
            type: Date,
            default: Date.now
        }
    }],
    personalizedRecommendations: [{
        content: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Content',
            required: true
        },
        reason: {
            type: String,
            trim: true
        },
        generatedAt: {
            type: Date,
            default: Date.now
        }
    }],
    status: {
        type: String,
        enum: ['in-progress', 'completed'],
        default: 'in-progress'
    },
    completedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: { createdAt: 'addedDate', updatedAt: true },
    collection: 'StudentPath'
});

// Indexes for faster queries
studentPathSchema.index({ student: 1 });
studentPathSchema.index({ path: 1 });
studentPathSchema.index({ status: 1 });

const StudentPath = mongoose.model('StudentPath', studentPathSchema);

module.exports = StudentPath;
