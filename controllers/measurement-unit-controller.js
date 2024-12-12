import MeasurementUnitsReferenceModel from "../models/measurement-units.js";

export const addNewMeasurementUnit = async (req, res) => {
    const { unitName, unitDescription } = req.body;
    try{
        const existingUnit = await MeasurementUnitsReferenceModel.findOne({ unitName });
        if (existingUnit) {
            return res.status(400).send({message: 'Such measurement unit already exists'});
        }

        const doc = new MeasurementUnitsReferenceModel({unitName, unitDescription});
        await doc.save();

        const addedUnit = doc._doc

        return res.status(200).send(addedUnit);
    } catch (e) {
        console.error(e);
        return res.status(500).send({error: e});
    }
}

export const getMeasurementUnits = async (req, res) => {
    const { unitName } = req.query;
    try{
        if(!unitName) {
            const allMeasurementUnits = await MeasurementUnitsReferenceModel.find();
            return res.status(200).send(allMeasurementUnits);
        }
        if(unitName) {
            const measurementUnits = await MeasurementUnitsReferenceModel.find({ unitName: { $regex: new RegExp(unitName, 'i') } });
            if (!measurementUnits) { return res.status(404).json({message: 'No measurement found with the requested parameters.'}); }
            return res.status(200).json(measurementUnits);
        }

        return res.json([])
    } catch (e) {
        console.error(e);
        return res.status(500).send({error: e});
    }
}