import { Router } from "express";
import commentRouter from "./comment.js"
import Post from "../models/posts.model.js"

const router = Router();

router.use('/:postId/comments', commentRouter)

router.get('/:postId', async (req, res) => {
    const result = await Post.findById(req.params.postId)
    res.json(result)
})

router.get('/', async (req, res) => {
    const {keyword} = req.query;
    if (!keyword) {
        res.json(await Post.find())
    }
    // if (keyword) {
    //     const lowerKeyword = keyword.toLocaleString();
    //     result = posts.filter(
    //         post => post.title.toLowerCase().includes(lowerKeyword) || post.content.toLowerCase().includes(lowerKeyword)
    //     )
    // }
    
    const findPosts = Post.find({
        $or: [
            {title: {$regex: `.*${keyword}.*`}},
            {content: {$regex: `.*${keyword}.*`}}
        ]
    })
    res.json(findPosts)
})

router.post('/', async (req, res) => {
    const {title, content} = req.body;
    const createdPost = await Post.create({
        title,
        content
    })
    res.status(201).json(createdPost);
})

router.put('/:postId', async (req, res) => {
    const postId = Number(req.params.postId);
    const {title, content} = req.body;

    const updatedPost = await Post.findByIdAndUpdate(postId, {
        title,
        content
    }, {
        returnDocument: "before"
    })
    res.json(updatedPost);
})

router.delete("/:postId", (req, res) => {
    const postId = Number(req.params.postId);
    const post = posts.find((item) => item.id === postId)

    if (!post) {
        return res.status(404).json({ message: "Post not found" })
    }

    const updatedPosts = posts.filter((item) => item.id !== postId);

    posts.length = 0;
    posts.push(...updatedPosts)
    
    res.json(post);
})

export default router