import {query} from "express-validator";

export const validateProduct = [
    query('area').optional().isNumeric(),
    query('category').isString(),
    query('code').isString(),
    query('isWeight').isString(),
    query('isWeightAllowed').isString(),
    query('length').optional().isNumeric(),
    query('name').isString(),
    query('unit').isString(),
    query('volume').optional().isNumeric(),
    query('weight').optional().isNumeric(),
    query('weightDivider').optional().isNumeric(),
    query('weightUnit').optional().isString()
];
