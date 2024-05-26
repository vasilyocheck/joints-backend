import mongoose from 'mongoose';

const JointModel = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true },
    jointLength: { type: Number, required: true },
    jointWidth: { type: Number, required: true },
    load: { type: Number, required: true },
    height: { type: Number, required: true },
    surface: { type: String, required: true },
    isOutsideOk: { type: Boolean, required: true },
    corner: { type: Boolean, required: true },
},
    {
        timestamps: true,
    }
    )

export default mongoose.model('Joint', JointModel)