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
        const products = await ProductModel.find()
        res.json(products)
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