import express from 'express';
import mongoose from 'mongoose'
import dotenv from "dotenv";
import {validateSignUp} from "./validators/auth.js";
import checkAuth from "./utils/checkAuth.js";
import cors from 'cors'
import cookieParser from 'cookie-parser';
import {authMe, login, logout, signUp} from "./controllers/user-controller.js";

const app = express();
dotenv.config();

mongoose.connect(process.env.JOINTS_DB)
    .then(() => {
        console.log('DB is connected')
    })
    .catch(err => console.log(err));

app.use(express.json());
app.use(cookieParser());
app.use(function (req, res, next) {
    const allowedOrigins = ['http://localhost:5173', 'https://joints-front.vercel.app'];
    const origin = req.headers.origin;

    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Allow-Control-Allow-Credentials', 'true');
    next();
});
app.use(cors({
    origin: ['http://localhost:5173', 'https://joints-front.vercel.app'],
    credentials: true,
}));

app.get('/', (req, res) => {
    res.send('Welcome to Joints API!');
})

app.post('/auth/signup', ...validateSignUp, signUp)


app.post('/auth/login', login)

app.get('/auth/me', checkAuth ,authMe)

app.get('/auth/logout', checkAuth, logout)

app.listen(4444, (e) => {
    if(e){
        return console.log(e)
    }
    console.log('[server] Listening on port 4444! Server is OK.');
})