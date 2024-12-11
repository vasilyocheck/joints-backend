import mongoose from "mongoose";

const MeasurementUnitsReferenceModel = new mongoose.Schema({
    unitName: {type: String, required: true},
    unitDescription: {type: String, required: true},
},
    {
    timestamps: true,
})

export default mongoose.model("MeasurementUnitsReference", MeasurementUnitsReferenceModel);