const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  authorName: {
    type: String,
    required: true
  },
  authorProfilePic: {
    type: String,
    default: ''
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher'
  }]
}, {
  timestamps: true
});

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  authorName: {
    type: String,
    required: true
  },
  authorProfilePic: {
    type: String,
    default: ''
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: [5000, 'Post content cannot exceed 5000 characters']
  },
  image: {
    type: String,
    default: ''
  },
  tags: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    enum: ['general', 'teaching-tips', 'resources', 'questions', 'announcements', 'success-stories'],
    default: 'general'
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher'
  }],
  comments: [commentSchema],
  views: {
    type: Number,
    default: 0,
    min: 0
  },
  isPinned: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  collection: 'Posts'
});

// Indexes for faster queries
postSchema.index({ author: 1 });
postSchema.index({ category: 1 });
postSchema.index({ tags: 1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ likes: -1 });
postSchema.index({ isPinned: -1, createdAt: -1 });

const Post = mongoose.model('Post', postSchema);

module.exports = Post;

