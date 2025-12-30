const Post = require('../models/Post');
const Teacher = require('../models/Teacher');

// Get all posts (with pagination and filters)
exports.getPosts = async (req, res) => {
    try {
        const { page = 1, limit = 10, category, tag, search } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build query
        const query = {};
        if (category) query.category = category;
        if (tag) query.tags = { $in: [tag] };
        if (search) {
            query.$or = [
                { content: { $regex: search, $options: 'i' } },
                { authorName: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } }
            ];
        }

        // Get posts (pinned first, then by date)
        const posts = await Post.find(query)
            .sort({ isPinned: -1, createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        // Get total count for pagination
        const total = await Post.countDocuments(query);

        res.json({
            data: posts,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'Server error while fetching posts' });
    }
};

// Get trending posts
exports.getTrendingPosts = async (req, res) => {
    try {
        // Get posts with most likes in the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const posts = await Post.find({
            createdAt: { $gte: sevenDaysAgo }
        })
            .sort({ 'likes.length': -1, createdAt: -1 })
            .limit(10)
            .lean();

        res.json({ data: posts });
    } catch (error) {
        console.error('Error fetching trending posts:', error);
        res.status(500).json({ error: 'Server error while fetching trending posts' });
    }
};

// Get single post
exports.getPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).lean();
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Increment views
        await Post.updateOne({ _id: req.params.id }, { $inc: { views: 1 } });

        res.json({ data: post });
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).json({ error: 'Server error while fetching post' });
    }
};

// Create a new post
exports.createPost = async (req, res) => {
    try {
        const { content, image, tags, category } = req.body;
        const teacherId = req.user.sub;

        if (!content || !content.trim()) {
            return res.status(400).json({ error: 'Post content is required' });
        }

        // Get teacher info
        const teacher = await Teacher.findById(teacherId).select('fullName profilePic');
        if (!teacher) {
            return res.status(404).json({ error: 'Teacher not found' });
        }

        // Process tags
        const processedTags = tags && Array.isArray(tags)
            ? tags.filter(tag => tag && tag.trim()).map(tag => tag.trim().toLowerCase())
            : [];

        const post = await Post.create({
            author: teacherId,
            authorName: teacher.fullName,
            authorProfilePic: teacher.profilePic || '',
            content: content.trim(),
            image: image || '',
            tags: processedTags,
            category: category || 'general'
        });

        res.status(201).json({ data: post });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ error: 'Server error while creating post' });
    }
};

// Like/unlike a post
exports.likePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const teacherId = req.user.sub;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const likeIndex = post.likes.findIndex(
            id => id.toString() === teacherId.toString()
        );

        if (likeIndex > -1) {
            // Unlike
            post.likes.splice(likeIndex, 1);
        } else {
            // Like
            post.likes.push(teacherId);
        }

        await post.save();

        res.json({
            data: {
                likes: post.likes.length,
                isLiked: likeIndex === -1
            }
        });
    } catch (error) {
        console.error('Error toggling like:', error);
        res.status(500).json({ error: 'Server error while toggling like' });
    }
};

// Add a comment
exports.addComment = async (req, res) => {
    try {
        const { content } = req.body;
        const postId = req.params.id;
        const teacherId = req.user.sub;

        if (!content || !content.trim()) {
            return res.status(400).json({ error: 'Comment content is required' });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Get teacher info
        const teacher = await Teacher.findById(teacherId).select('fullName profilePic');
        if (!teacher) {
            return res.status(404).json({ error: 'Teacher not found' });
        }

        const comment = {
            author: teacherId,
            authorName: teacher.fullName,
            authorProfilePic: teacher.profilePic || '',
            content: content.trim(),
            likes: []
        };

        post.comments.push(comment);
        await post.save();

        res.status(201).json({ data: post.comments[post.comments.length - 1] });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ error: 'Server error while adding comment' });
    }
};

// Like/unlike a comment
exports.likeComment = async (req, res) => {
    try {
        const { postId, commentId } = req.params;
        const teacherId = req.user.sub;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const comment = post.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        const likeIndex = comment.likes.findIndex(
            id => id.toString() === teacherId.toString()
        );

        if (likeIndex > -1) {
            comment.likes.splice(likeIndex, 1);
        } else {
            comment.likes.push(teacherId);
        }

        await post.save();

        res.json({
            data: {
                likes: comment.likes.length,
                isLiked: likeIndex === -1
            }
        });
    } catch (error) {
        console.error('Error toggling comment like:', error);
        res.status(500).json({ error: 'Server error while toggling comment like' });
    }
};

// Delete a post
exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Check if user is the author
        if (post.author.toString() !== req.user.sub.toString()) {
            return res.status(403).json({ error: 'You can only delete your own posts' });
        }

        await Post.deleteOne({ _id: req.params.id });

        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ error: 'Server error while deleting post' });
    }
};

// Delete a comment
exports.deleteComment = async (req, res) => {
    try {
        const { postId, commentId } = req.params;
        const teacherId = req.user.sub;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const comment = post.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        // Check if user is the comment author
        if (comment.author.toString() !== teacherId.toString()) {
            return res.status(403).json({ error: 'You can only delete your own comments' });
        }

        comment.deleteOne();
        await post.save();

        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ error: 'Server error while deleting comment' });
    }
};
