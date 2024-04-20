import express from 'express';
import jwt from "jsonwebtoken";
import mongoose from 'mongoose'
import dotenv from "dotenv";
import {validationResult} from "express-validator";
import {validateSignUp} from "./validators/auth.js";
import UserModel from "./models/user.js";
import bcrypt from "bcrypt";
import checkAuth from "./utils/checkAuth.js";
import cors from "cors";

const app = express();
dotenv.config();

mongoose.connect(process.env.JOINTS_DB)
    .then(() => {
    console.log('DB is connected')
    })
    .catch(err => console.log(err));
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type'],
    optionsSuccessStatus: 200
}))
app.use(express.json());
/*app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Headers","*");
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    next();
});*/

app.get('/', (req, res) => {
    res.send('Welcome to Joints API!');
})

app.post('/auth/signup', ...validateSignUp, async (req, res) => {
    try{
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            return res.status(400).json(errors.array())
        }

        const password = req.body.password
        const salt = await bcrypt.genSalt(10);
        const passHash = await bcrypt.hash(password, salt);

        const doc = new UserModel({
            fullName: req.body.fullName,
            email: req.body.email,
            passwordHash: passHash,
            avatarURL: req.body.avatarURL,
        })

        const user = await doc.save()
        const {passwordHash, ...userWithoutHash} = user._doc

        const token = jwt.sign({
            _id: user._id
        }, process.env.SECRET, {
            expiresIn: process.env.JWT_EXPIRATION,
        })

        res.json({...userWithoutHash, token})
    } catch (e) {
        console.log(e)
        res.status(500).json({
            message: 'Failed',
            error: 'Failed to sign up'
        })

    }
})


app.post('/auth/login', async (req, res) => {
    try {
        const user = await UserModel.findOne({email: req.body.email})
        if(!user) {
            return res.status(404).json({
                message: 'User not found'
            })
        }

        const isPassValid = await bcrypt.compare(req.body.password, user._doc.passwordHash)
        if(!isPassValid){
            return res.status(400).json({
                message: 'Invalid login or password.'
            })
        }
        const token = jwt.sign({
                _id: user._id,
            }, process.env.SECRET,
            {
                expiresIn: process.env.JWT_EXPIRATION,
            })

        const { passwordHash, ...userData } = user._doc

        res.json({...userData, token})
       /* res.cookie('jwt', JSON.stringify(token), {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            maxAge: 3600000
        })*/


    } catch(e) {
        console.log(e)
        res.status(500).json({
            message: 'Failed',
            error: 'Failed to log in.'
        })
    }
})

app.get('/auth/me', checkAuth ,async (req, res) => {
    try {
        const user = await UserModel.findById(req.userId)
        console.log(req.userId)
        if(!user) {
            return res.status(404).json({
                message: 'User not found'
            })
        }

        const { passwordHash, ...userWithoutPassHash } = user._doc

        res.send(userWithoutPassHash)
    } catch (e) {
        console.log(e)
        res.status(500).json({
            message: 'Failed.',
            error: 'Not authorized.'
        })

    }
})

app.listen(4444, (e) => {
    if(e){
        return console.log(e)
    }
    console.log('[server] Listening on port 4444! Server is OK.');
})