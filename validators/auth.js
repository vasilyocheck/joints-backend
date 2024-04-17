import { body } from 'express-validator'

export const validateSignUp = [
    body('email', 'Incorrect email format').isEmail(),
    body('password', 'Password must be at least 5 characters long').isLength({min: 5}),
    body('fullName', 'Fullname must be at least 3 characters long').isLength({min: 3}),
    body('avatarURL', 'Incorrect avatar URL').isURL().optional(),
]
