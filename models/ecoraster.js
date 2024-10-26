import mongoose from "mongoose";

const EcorasterModel = new mongoose.Schema({
    name: { type: String, required: true },
    units: { type: String, required: true },
    prices: [{ amount: Number, price: Number }],
    minOrderAmount: { type: Number, required: true },
    multiplicity: { type: Number, required: true },
    palletWeight: { type: Number, required: true },
    amountOnPallet: { type: Number, required: true },
    volumeOfPallets: { type: Number, required: true },
},
    {
        timestamps: true
    }
)

export default mongoose.model('Ecoraster', EcorasterModel);
