import mongoose from 'mongoose';

const UserModel = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    passwordHash: {
        type: String,
        required: true,
    },
    avatarURL: String
}, {
    timestamps: true,
})

export default mongoose.model('User', UserModel);