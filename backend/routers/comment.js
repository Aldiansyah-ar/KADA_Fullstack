import { Router } from "express";

const router = Router({ mergeParams: true });

const comments = [
    {id: 1, content: 'first comment', postId: 1},
    {id: 2, content: 'second comment', postId: 2},
    {id: 3, content: 'third comment', postId: 3},
];

router.get('/', (req, res) => {
    const postId = parseInt(req.params.postId);
    const filteredComments = comments.filter(
        (comment) => comment.postId === postId
    )
    res.json(filteredComments);
});

export default router;