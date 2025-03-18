import mongoose from 'mongoose';

const WaterstopCategoryModel = new mongoose.Schema(
  {
    name: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model('WaterstopCategory', WaterstopCategoryModel);
