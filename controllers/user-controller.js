import {validationResult} from "express-validator";
import bcrypt from "bcrypt";
import UserModel from "../models/user.js";
import jwt from "jsonwebtoken";

export const signUp = async (req, res) => {
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
}