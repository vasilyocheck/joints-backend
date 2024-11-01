import EcorasterModel from "../models/ecoraster.js";

export const createEcorasterItem = async(req, res) => {
    try{
        const units = await EcorasterModel.find()
        const unit = units.find(u => u.name === req.body.name)
        if(unit) {
            return res.status(400).json({error: "Ecoraster item with such name already exists"})
        }
        const doc = new EcorasterModel({
            name: req.body.name,
            units: req.body.units,
            prices: req.body.prices,
            minOrderAmount: req.body.minOrderAmount,
            palletWeight: req.body.palletWeight,
            amountOnPallet: req.body.amountOnPallet,
            volumeOfPallets: req.body.volumeOfPallets,
            multiplicity: req.body.multiplicity,
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
                multiplicity: req.body.multiplicity,
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

export const getEcorasterItems = async (req, res) => {
    try {
        const ecorasterItems = await EcorasterModel.find()
        res.status(200).json(ecorasterItems)
    } catch (e) {
        res.json({
            message: 'Failed to get ecoraster items.',
        })
    }
}