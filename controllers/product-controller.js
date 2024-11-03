import ProductModel from "../models/products.js";

export const createProduct = async (req, res) => {
    try {
        const doc = new ProductModel({
            area: req.body.area,
            category: req.body.category,
            code: req.body.code,
            isWeight: req.body.isWeight,
            isWeightAllowed: req.body.isWeightAllowed,
            length: req.body.length,
            name: req.body.name,
            unit: req.body.unit,
            volume: req.body.volume,
            weight: req.body.weight,
            weightDivider: req.body.weightDivider,
            weightUnit: req.body.weightUnit,
            calcUnit: req.body.calcUnit,
            calcUnitWeight: req.body.calcUnitWeight,
            calcUnitVolume: req.body.calcUnitVolume,
        })
        const product = await doc.save();
        res.json(product);
    } catch (e) {
        console.log(e)
        res.status(500).json({
            message: 'Failed to create product.',
        })

    }
}

export const getAllProducts = async (req, res) => {
    try{
        const {name} = req.query;
        let products
        if(name) {
            products = await ProductModel.find({name: { $regex: new RegExp(name, 'i') } })
            res.status(200).json(products);
        } else {
            res.json({
                message: 'No products found with the requested parameters.',
            })
        }

    } catch (e) {
        console.log(e)
        res.status(500).json({
            message: 'Failed to get all products.',
        })
    }
}

export const getProductById = async (req, res) => {
    try {
        const productId = req.params.id;
        const doc = await ProductModel.findById(productId);
        if(!doc) {
            return res.status(404).json({
                message: 'Product not found'
            })
        }
        res.json(doc)
    } catch (e) {
        console.log(e)
        res.status(500).json({
            message: 'Failed to get the product.',
        })
    }
}

export const removeProduct = async (req, res) => {
    try {
        const postId = req.params.id;
        const doc = await ProductModel.findOneAndDelete(
            {_id: postId},
            {returnDocument: "after"}
        )
        if(!doc) {
            return res.status(404).json({
                message: 'Product not found'
            })
        }
        res.json({
            success: true,
        })
    } catch (e) {
        console.log(e)
        res.status(500).json({
            message: 'Failed to delete the product.',
        })
    }
}

export const updateProduct = async (req, res) => {
    try {
        const postId = req.params.id
        console.log(postId)
        const doc = await ProductModel.findByIdAndUpdate(
            {_id: postId},
            {
                area: req.body.area,
                category: req.body.category,
                code: req.body.code,
                isWeight: req.body.isWeight,
                isWeightAllowed: req.body.isWeightAllowed,
                length: req.body.length,
                name: req.body.name,
                unit: req.body.unit,
                volume: req.body.volume,
                weight: req.body.weight,
                weightDivider: req.body.weightDivider,
                weightUnit: req.body.weightUnit,
                calcUnit: req.body.calcUnit,
                calcUnitWeight: req.body.calcUnitWeight,
                calcUnitVolume: req.body.calcUnitVolume,
            },
            { returnDocument: "after" }
        )
        if(!doc) {
            return res.status(404).json({
                message: 'Product not updated'
            })
        }
        res.status(200).json({doc})
    } catch (e) {
        console.log(e)
        res.status(500).json({
            message: 'Failed to update the product.',
        })
    }
}

export const getSeveralProducts = async (req, res) => {
    try{
        const products = req.body
        if(!products) { return res.status(404).json({
            message: 'No products found with the requested parameters.',
        })}
        const productsArr = []
        let currentProducts = await ProductModel.find({})
        for(let i = 0; i < products.length; i++) {
            const {name, amount} = products[i]
            const currentProduct = currentProducts.find(p => name.startsWith(p.name))
            const currentWeight = amount * currentProduct.calcUnitWeight
            const currentVolume = amount * currentProduct.calcUnitVolume
            productsArr.push({...currentProduct._doc, totalWeight: currentWeight, totalVolume: currentVolume, amount })
        }

        res.status(200).json(productsArr)
    } catch (e) {
        console.log(e)
        res.status(500).json({
            message: 'Failed to get the requested products.',
        })
    }
}