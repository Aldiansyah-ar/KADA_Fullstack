import { Router } from "express";
import commentRouter from "./comment.js"
import Post from "../models/posts.model.js"
import { isUserValidator } from "./validators/post.validator.js";

const router = Router();

router.use('/:postId/comments', commentRouter)

router.get('/:postId', async (req, res) => {
    const result = await Post.findById(req.params.postId)
    res.json(result)
})

router.get('/', async (req, res) => {
    const keyword = req.query.keyword
    const page = Number(req.query.page)
    const pageSize = Number(req.query.pageSize)

    const skip = (page - 1) * pageSize;

    if (!keyword) {
        const total = await Post.countDocuments();
        const findPosts = await Post.find().skip(skip).limit(pageSize);
        res.json({
            data: findPosts,
            total,
            page,
            pageSize
        })
    }
    
    const total = await Post.countDocuments({
        $or: [
            {title: {$regex: `.*${keyword}.*`}},
            {content: {$regex: `.*${keyword}.*`}}
        ]
    })

    const findPosts = await Post.find({
        $or: [
            {title: {$regex: `.*${keyword}.*`}},
            {content: {$regex: `.*${keyword}.*`}}
        ]
    }).skip(skip).limit(pageSize)
    res.json({
        data: findPosts,
        total,
        page,
        pageSize
    })
})

router.post('/', isUserValidator, async (req, res) => {
    const {title, content} = req.body;
    const createdPost = await Post.create({
        title,
        content
    })
    res.status(201).json(createdPost);
})

router.put('/:postId', async (req, res) => {
    const postId = req.params.postId;
    const {title, content} = req.body;

    const updatedPost = await Post.findByIdAndUpdate(postId, {
        title,
        content
    }, {
        returnDocument: "after"
    })
    res.json(updatedPost);
})

router.delete("/:postId", async (req, res) => {
    try {
        const postId = req.params.postId;
        const deletedPost = await Post.findByIdAndDelete(postId);

        if (!deletedPost) {
            return res.status(404).json({ message: "Post not found" });
        }

        res.json({
            success: true,
            message: "Post deleted successfully",
            deletedPost
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting post",
            error: error.message
        });
    }
});

export default router