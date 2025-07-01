import express from 'express'
import postRouter from './routers/post.js'
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(cors())
app.use(express.json())
app.use('/posts', postRouter)

const middleware1 = (req, res, next) => {
    req.test1 = 'this is set by middleware1';
    next();
}

const middleware2 = (req, res, next) => {
    req.test2 = 'this is set by middleware2';
    throw new Error('error!')
}

app.use(middleware1, middleware2);

app.get('/', middleware1, middleware2, (req, res) => {
    res.send([req.test1, req.test2]);
})

app.use((err, req, res, next) => {
    res.status(500).json({message: err.message})
})

app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`)
});