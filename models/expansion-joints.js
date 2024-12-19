import mongoose, { Schema } from 'mongoose';

const movementsInMmSchema = new Schema(
  {
    compression: Number,
    stretching: Number,
    vertical: Number,
  },
  { _id: false },
);

const widthsInMmSchema = new Schema(
  {
    visible: Number,
    invisible: Number,
    whole: Number,
  },
  { _id: false },
);

const paramsSchema = new Schema(
  {
    movementsInMm: movementsInMmSchema,
    widthsInMm: widthsInMmSchema,
    heightInMm: Number,
    loadingMPa: Number,
  },
  { _id: false },
);

const partQuantitySchema = new Schema(
  {
    part: { type: Schema.Types.ObjectId, ref: 'JointsPart', required: true },
    quantity: { type: Number, required: true },
  },
  { _id: false },
);

const ExpansionJointModel = new mongoose.Schema({
  brand: { type: String, required: true },
  image: { type: String, required: true },
  scheme: { type: String, required: true },
  drawing: { type: String, required: true },
  jointName: { type: String, required: true },
  divisibility: { type: Number, required: true },
  parts: [partQuantitySchema],
  units: {
    type: Schema.Types.ObjectId,
    ref: 'MeasurementUnitsReference',
    required: true,
  },
  isJoint: { type: Boolean, required: true },
  params: paramsSchema,
});

export default mongoose.model('ExpansionJoint', ExpansionJointModel);
