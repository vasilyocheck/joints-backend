import {query} from "express-validator";

export const validateJoint = [
    query('name').isString(),
    query('code').isString(),
    query('jointLength').isNumeric(),
    query('jointWidth').isNumeric(),
    query('load').isNumeric(),
    query('height').isNumeric(),
    query('surface').isString(),
    query('isOutsideOk').isBoolean(),
    query('corner').isBoolean(),
];