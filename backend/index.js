import mongoose from 'mongoose';
import app from './app.js';

const PORT = 3000;

mongoose.connect('mongodb://127.0.0.1:27017/express-test')
    .then(() => {
        console.log('database connected')
        app.listen(PORT, () => {
            console.log(`http://localhost:${PORT}`)
        });
    })
    .catch((e) => {
        console.log('error: ', e.message)
    })