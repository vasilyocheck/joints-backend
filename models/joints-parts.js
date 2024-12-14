import mongoose, { Schema } from 'mongoose';

const JointsPartModel = new mongoose.Schema({
  brand: { type: String, required: true },
  imageURL: { type: String, required: false },
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

export default mongoose.model('JointsPart', JointsPartModel);
