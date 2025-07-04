import express from 'express';
// import helloRouter from './hello.js'
import postRouter from './routers/post.js'
// import commentRouter from './routers/comment.js'
import cors from "cors";
import userRouter from './routers/user.js'
import session from 'express-session'
import MongoStore from 'connect-mongo';
import passport from 'passport';

const app = express();

app.use(cors())
app.use(express.json())

app.use(
    session({
        secret: 'adadad',
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: "mongodb://127.0.0.1:27017/express-test"
        }),
        cookie : {
            httpOnly: true,
            maxAge: 1000*60*60
        }
    })
)

app.use(passport.authenticate("session"))
app.use('/auth', userRouter)
app.use('/posts', postRouter)

app.use((err, req, res, next) => {
    res.status(500).json({ message: err.message })
})

export default app;