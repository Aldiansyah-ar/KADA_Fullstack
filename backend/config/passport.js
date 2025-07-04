import passport from 'passport';
import { Strategy as LocalStrategy} from 'passport-local';
import bcrypt from 'bcrypt'
import User from '../models/users.model.js'

const config = {
    usernameField: 'email',
    passwordField: 'password'
}

passport.use(
    new LocalStrategy(config, async function (email, password, done) {
        const user = await User.findOne({email})

        if(!user){
            return done(null, false, {message: "user not found!"});
        }
        const compareResult = await bcrypt.compare(password, user.password)
        if(!compareResult) {
            return (
                done(null, false, {message: 'invalid password'})
            )
        }
        return done(null, user);
    })
)
passport.serializeUser(function(user, done) {
    done(null, user.id);
})

passport.deserializeUser(async function (id, done) {
    const user = await User.findById(id);
    done(null, user);
})

export default passport;