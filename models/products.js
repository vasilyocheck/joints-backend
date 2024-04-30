import mongoose from 'mongoose';

const ProductModel = new mongoose.Schema({
    area: {
        type: Number,
        required: false
    },
    category: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        required: false,
    },
    isWeight: {
        type: String,
        required: false,
    },
    isWeightAllowed: {
        type: String,
        required: true,
    },
    length: {
        type: Number,
        required: false,
    },
    name: {
        type: String,
        required: true,
    },
    unit: {
        type: String,
        required: true,
    },
    volume: {
        type: Number,
        required: false,
    },
    weight: {
        type: Number,
        required: false,
    },
    weightDivider: {
        type: Number,
        required: false,
    },
    weightUnit: {
        type: String,
        required: false,
    },
    calcUnit: {
        type: String,
        required: true,
    },
    calcUnitWeight: {
        type: Number,
        required: true,
    },
    calcUnitVolume: {
        type: Number,
        required: true,
    }
},  {
    timestamps: true
});

export default mongoose.model('Product', ProductModel);