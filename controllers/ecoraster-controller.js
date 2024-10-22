import EcorasterModel from "../models/ecoraster.js";

export const createEcorasterItem = async(req, res) => {
    try{
        const doc = new EcorasterModel({
            name: req.body.name,
            units: req.body.units,
            prices: req.body.prices,
            minOrderAmount: req.body.minOrderAmount,
            palletWeight: req.body.palletWeight,
            amountOnPallet: req.body.amountOnPallet,
            volumeOfPallets: req.body.volumeOfPallets,
        })
        const ecorasterUnit = await doc.save();
        res.json(ecorasterUnit);
    } catch (e) {
        console.log(e)
        res.status(500).json({
            message: 'Failed to create an ecoraster unit.',
        })
    }
}