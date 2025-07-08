import { Router } from "express";
import Comment from "../models/comments.model.js";
import Post from "../models/posts.model.js";

const router = Router({ mergeParams: true });

// Get comments for a post
router.get("/", async (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;
    const postId = req.params.postId; 
    const limit = parseInt(pageSize)
    const skip = (parseInt(page) - 1) * limit
    
    const [comments, totalCount] = await Promise.all([
      Comment.find({ post: postId })
      .sort({ createAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
      Comment.countDocuments({ post: postId })
    ])

    const commentsWithTimeStamps = comments.map((comment) => ({
      ...comment,
      createdAt: comment.createdAt || new Date(),
      updatedAt: comment.updatedAt || new Date()
    }));

    res.json({
      comments: commentsWithTimeStamps,
      totalCount
    })
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a new comment
router.post("/", async (req, res) => {
  try {
    const { content } = req.body
    const postId = req.params.postId
    // Validate input
    if (!content|| typeof content !== "string") {
      return res.status(400).json({ message: "Comment content is required" });
    }

    // Create new comment
    const newComment = new Comment({
      content,
      post: postId,
    });

    // Save comment
    const savedComment = await newComment.save();

    // Update the post's comments array
    await Post.findByIdAndUpdate(req.params.postId, {
      $push: { comments: savedComment._id },
    });

    // Return the created comment
    res.status(201).json({
      _id: savedComment._id,
      content: savedComment.content,
      post: savedComment.post,
      createdAt: savedComment.createdAt,
      updatedAt: savedComment.updatedAt
    });
  } catch (err) {
    res.status(400).json({
      message: "Error creating comment",
      error: err.message,
    });
  }
});

export default router