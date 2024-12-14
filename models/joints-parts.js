import mongoose, { Schema } from 'mongoose';

const JointsPartModel = new mongoose.Schema({
  brand: { type: String, required: true },
  imageURL: { type: String, required: true },
  partName: { type: String, required: true },
  divisibility: { type: Number, required: true },
  packQuantity: { type: Number, required: true },
  units: {
    type: Schema.Types.ObjectId,
    ref: 'MeasurementUnitsReference',
    required: true,
  },
  unitWeightKg: { type: Number, required: true },
  unitVolumeM3: { type: Number, required: true },
  isCompensator: { type: Boolean, required: true },
});

/*const jointPart0 = {
  brand: 'АКВАСТОП',
  id: '12345678',
  image: '/url/to/imagePart0.jpg',
  partName: 'ДШВ-УГЛ угловой профиль алюминиевый (3м)',
  divisibility: 3,
  packQuantity: 3,
  units: 'пог.м.',
  unitWeightKg: 0.43,
  unitVolume: 0.0016,
  isCompensator: false,
};*/

export default mongoose.model('JointsPart', JointsPartModel);
