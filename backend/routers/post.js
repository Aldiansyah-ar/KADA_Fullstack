import { Router } from "express";
import commentRouter from './comment.js'
import Post from "../models/posts.model.js";
import {isSameUserValidator, isUserValidator} from "../validators/post.validator.js"
import User from "../models/users.model.js";

const router = Router();
router.use('/:postId/comments', commentRouter)

router.get('/:postId', async (req, res)=> {
    const result = await Post.findById(req.params.postId)
    res.json(result)
})


router.get('/', async (req, res)=> {
    const keyword = req.query.keyword;
    const page = Number(req.query.page);
    const pageSize = Number(req.query.pageSize);

    const skip = (page - 1) * pageSize;
    if(!keyword){
        const total = await Post.countDocuments();
        const findPosts = await Post.find().skip(skip).limit(pageSize)
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

router.post('/', isUserValidator, async (req, res)=> {
    const {title, content} = req.body;
    const createdPost = await Post.create({
        title,
        content,
        author: req.user._id
    })
    await User.findByIdAndUpdate(req.user._id, {
        $push: {
            posts: createdPost._id
        }
    })
    res.status(201).json(createdPost);
})

router.put('/:postId', isSameUserValidator, async (req, res)=> {
    const postId = req.params.postId;
    const {title, content} = req.body;

    const updatedPost = await Post.findByIdAndUpdate(postId,{
        title,
        content
    }, {
        returnDocument: "before"
    })

    res.json(updatedPost);
})

router.delete("/:postId", isSameUserValidator, async (req, res)=> {
    const deletedPost = await Post.findByIdAndDelete(req.params.postId)
    await User.findByIdAndUpdate(req.user._id, {
        $pull: {
            posts: req.params.postId
        }
    })
    res.status(204).json()
})
export default router