import { Router } from "express";
import Comment from "../models/comments.model.js";
import Post from "../models/posts.model.js";

const router = Router({ mergeParams: true });

// Get comments for a post
router.get("/", async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId }).sort({
      createdAt: -1,
    });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a new comment
router.post("/", async (req, res) => {
  try {
    // Validate input
    if (!req.body.content || typeof req.body.content !== "string") {
      return res.status(400).json({ message: "Comment content is required" });
    }

    // Create new comment
    const newComment = new Comment({
      content: req.body.content,
      post: req.params.postId,
    });

    // Save comment
    const savedComment = await newComment.save();

    // Update the post's comments array
    await Post.findByIdAndUpdate(req.params.postId, {
      $push: { comments: savedComment._id },
    });

    // Return the created comment
    res.status(201).json(savedComment);
  } catch (err) {
    res.status(400).json({
      message: "Error creating comment",
      error: err.message,
    });
  }
});