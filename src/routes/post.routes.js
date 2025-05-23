const express = require("express");
const router = express.Router();
const {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  getPostsByUser,
  friendPost,
} = require("../controllers/post.controller");
const {
  validatePostCreation,
  validatePostId,
} = require("../middlewares/post.middlewares");
const { conditionalAuth } = require("../middlewares/auth.middleware");

// Public routes
router.get("/", getAllPosts);
router.get("/:postId", getPostById);
router.get("/user/:userId?", conditionalAuth, getPostsByUser);

// Protected routes
router.post("/", conditionalAuth, createPost);
router.put("/:id", conditionalAuth, validatePostId, updatePost);
router.delete("/:id", conditionalAuth, validatePostId, deletePost);
router.post("/:id/like", conditionalAuth, validatePostId, likePost);
router.get("/friends-post/:friendId", conditionalAuth, friendPost);

module.exports = router;
