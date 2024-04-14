import express from 'express';
import jwt from "jsonwebtoken";
const app = express();
import dotenv from "dotenv";
dotenv.config();

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Welcome to Joints API!');
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