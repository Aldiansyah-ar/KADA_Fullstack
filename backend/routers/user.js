import {Router} from 'express';
import bcrypt from 'bcrypt';
import User from '../models/users.model.js';
import passport from '../config/passport.js';

const router = Router();

router.post('/signup', async (req, res) => {
    const {email, username, password} = req.body;

    // const hashedPassword = await bcrypt.hash(password, 10)
    const user = await User.create({
        username,
        email,
        password
    })
    res.status(201).json(user)
})

router.post('/login', passport.authenticate('local', {
    failureMessage : true
}), (req, res) => {
    res.json('login success!')
}) 

router.post("/logout", (req, res) => {
    req.logout(() => {
        req.session.destroy(() => {
            res.clearCookie('connect.sid');
            res.json({message: 'logout! '})
        })
    })
})

export default router