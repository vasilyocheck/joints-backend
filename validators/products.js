import {body} from "express-validator";

export const validateProduct = [
    body('area').optional().isNumeric(),
    body('category').isString(),
    body('code').isString(),
    body('isWeight').isString(),
    body('isWeightAllowed').isString(),
    body('length').optional().isNumeric(),
    body('name').isString(),
    body('unit').isString(),
    body('volume').optional().isNumeric(),
    body('weight').optional().isNumeric(),
    body('weightDivider').optional().isNumeric(),
    body('weightUnit').optional().isString()
];
