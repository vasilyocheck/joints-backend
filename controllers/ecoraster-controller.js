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

export const updateEcorasterItem = async (req, res) => {
    try{
        const itemId = req.params.id;
        const doc = await EcorasterModel.findByIdAndUpdate(
            {_id: itemId},
            {
                name: req.body.name,
                units: req.body.units,
                prices: req.body.prices,
                minOrderAmount: req.body.minOrderAmount,
                palletWeight: req.body.palletWeight,
                amountOnPallet: req.body.amountOnPallet,
                volumeOfPallets: req.body.volumeOfPallets,
            },
            { returnDocument: "after" }
        )

        if(!doc) {
            return res.status(404).json({
                message: 'Product not found'
            })
        }

        res.status(200).json({doc})
    } catch (e) {
        console.log(e)
        res.status(500).json({
            message: 'Failed to update the ecoraster item.',
        })
    }
}