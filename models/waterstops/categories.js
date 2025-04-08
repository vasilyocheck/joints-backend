import mongoose, { Schema } from 'mongoose';

export const waterstopComponentSchema = new mongoose.Schema({
  component: {
    type: Schema.Types.ObjectId,
    ref: 'WaterstopComponent',
    required: true,
  },
  quantity: { type: Number, required: true },
});

const WaterstopCategoryModel = new mongoose.Schema(
  {
    name: { type: String, required: true },
    installationScheme: { type: String, required: true },
    isometricScheme: { type: String, required: true },
    includedComponents: [waterstopComponentSchema],
    extraComponents: [waterstopComponentSchema],
  },
  {
    timestamps: true,
  },
);

export default mongoose.model('WaterstopCategory', WaterstopCategoryModel);
