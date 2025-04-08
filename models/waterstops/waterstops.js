import mongoose, { Schema } from 'mongoose';
import { waterstopComponentSchema } from './categories.js';

const waterstopModel = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
  },
  image3d: {
    type: String,
    required: true,
  },
  drawing: {
    type: String,
    required: true,
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'WaterstopCategory',
    required: true,
  },
  rollLength: {
    type: Number,
    required: true,
  },
  compression: {
    type: Number,
    required: true,
  },
  horizontalStretching: {
    type: Number,
    required: true,
  },
  verticalStretching: {
    type: Number,
    required: true,
  },
  diagonalStretching: {
    type: Number,
    required: true,
  },
  waterPressureMpa: {
    type: Number,
    required: true,
  },
  weightPerMeter: {
    type: Number,
    required: true,
  },
  volumePerMeter: {
    type: Number,
    required: true,
  },
  individualAccessories: [waterstopComponentSchema],
});

export default mongoose.model('WaterstopModel', waterstopModel);
