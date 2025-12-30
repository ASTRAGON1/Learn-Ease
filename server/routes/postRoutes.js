const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const postController = require('../controllers/postController');

// GET /api/posts - Get all posts (with pagination and filters)
router.get('/', postController.getPosts);

// GET /api/posts/trending - Get trending posts
router.get('/trending', postController.getTrendingPosts);

// GET /api/posts/:id - Get single post
router.get('/:id', postController.getPost);

// POST /api/posts - Create a new post
router.post('/', auth(['teacher']), postController.createPost);

// POST /api/posts/:id/like - Like/unlike a post
router.post('/:id/like', auth(['teacher']), postController.likePost);

// POST /api/posts/:id/comment - Add a comment to a post
router.post('/:id/comment', auth(['teacher']), postController.addComment);

// POST /api/posts/:postId/comment/:commentId/like - Like/unlike a comment
router.post('/:postId/comment/:commentId/like', auth(['teacher']), postController.likeComment);

// DELETE /api/posts/:id - Delete a post
router.delete('/:id', auth(['teacher']), postController.deletePost);

// DELETE /api/posts/:postId/comment/:commentId - Delete a comment
router.delete('/:postId/comment/:commentId', auth(['teacher']), postController.deleteComment);

module.exports = router;
