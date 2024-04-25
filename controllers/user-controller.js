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

export const login = async (req, res) => {
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

        res.cookie('jwt', JSON.stringify(token))
        return res.json({...userData, token})

    } catch(e) {
        console.log(e)
        res.status(500).json({
            message: 'Failed',
            error: 'Failed to log in.'
        })
    }
}

export const authMe = async (req, res) => {
    try {
        const user = await UserModel.findById(req.userId)
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
}

export const logout = async (req, res) => {
    try{
        res.clearCookie('jwt')
        res.status(200).json({
            message: 'Logged out'
        })
    } catch (e) {
        console.log(e)
        res.status(500).json({
            message: 'Failed.',
            error: 'Not authorized.'
        })
    }
}