import mongoose from 'mongoose';

const WaterstopComponentModel = new mongoose.Schema(
  {
    name: { type: String, required: true },
    imageURL: { type: String, required: true },
    weight: { type: Number, required: true },
    volume: { type: Number, required: true },
  },
  { timestamps: true },
);

export default mongoose.model('WaterstopComponent', WaterstopComponentModel);
