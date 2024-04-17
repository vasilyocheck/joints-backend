import express from 'express';
import jwt from "jsonwebtoken";
import mongoose from 'mongoose'
import dotenv from "dotenv";
import {validationResult} from "express-validator";
import {validateSignUp} from "./validators/auth.js";
import UserModel from "./models/user.js";
import bcrypt from "bcrypt";

const app = express();
dotenv.config();

mongoose.connect(process.env.JOINTS_DB)
    .then(() => {
    console.log('DB is connected')
    })
    .catch(err => console.log(err));

app.use(express.json());

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
        const passwordHash = await bcrypt.hash(password, salt);

        const doc = new UserModel({
            fullName: req.body.fullName,
            email: req.body.email,
            passwordHash,
            avatarURL: req.body.avatarURL,
        })

        const user = await doc.save()

        res.json(user)
    } catch (e) {
        console.log(e)
        res.status(500).json({
            message: 'Failed',
            error: 'Failed to sign up'
        })

    }
})


app.post('/auth/login', (req, res) => {
    const token = jwt.sign({
        email: req.body.email,
        fullName: req.body.fullName,
    }, process.env.SECRET)
    res.send({
        success: true,
        token
    })
})

app.listen(4444, (e) => {
    if(e){
        return console.log(e)
    }
    console.log('[server] Listening on port 4444! Server is OK.');
})