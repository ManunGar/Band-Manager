import { check } from "express-validator";
import { Instrument } from "../models/sequelize.js";

// Custom validator to check if the instrument exists
const _checkInstrumentExists = async (instrumentId) => {
    const instrument = await Instrument.findByPk(instrumentId);
    if (!instrument) {
        throw new Error('Instrument not found');
    }
    return true;
}

const create = [
    check('instrumentId').exists().isInt().custom(_checkInstrumentExists),
    check('performanceId').exists().isInt().withMessage('Performance ID must be an integer'),
    check('amount').exists().isInt({ gt: 0 }).withMessage('Amount must be a positive number'),
    check('payment').exists().isInt({ gt: 0 }).withMessage('Payment must be a decimal number with 2 decimal places'),
    check('description').exists().isString().isLength({ max: 255 }).withMessage('Description must be a string with a maximum length of 255 characters')
]

const update = [
    check('amount').optional().isInt({ gt: 0 }).withMessage('Amount must be a positive number'),
    check('payment').optional().isInt({ gt: 0 }).withMessage('Payment must be a decimal number with 2 decimal places'),
    check('description').optional().isString().isLength({ max: 255 }).withMessage('Description must be a string with a maximum length of 255 characters')
]

export { create, update };
