import mongoose from "mongoose";

const JointsPartModel = new mongoose.Schema({
    brand: { type: String, required: true },
    image: { type: String, required: true },
    partName: { type: String, required: true },
    divisibility: { type: Number, required: true },
    packQuantity: { type: Number, required: true },

})

const jointPart0 = {
    brand: 'АКВАСТОП',
    id: '12345678',
    image: '/url/to/imagePart0.jpg',
    partName: 'ДШВ-УГЛ угловой профиль алюминиевый (3м)',
    divisibility: 3,
    packQuantity: 3,
    units: 'пог.м.',
    unitWeightKg: 0.43,
    unitVolume: 0.0016,
    isCompensator: false
}

export default mongoose.model('JointsPart', JointsPartModel);