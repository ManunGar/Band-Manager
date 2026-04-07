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
    check('payment').exists().isFloat({ gt: 0 }).withMessage('Payment must be a positive decimal number'),
    check('description').exists().isString().isLength({ max: 255 }).withMessage('Description must be a string with a maximum length of 255 characters')
]

const update = [
    check('amount').optional().isInt({ gt: 0 }).withMessage('Amount must be a positive number'),
    check('payment').optional().isFloat({ gt: 0 }).withMessage('Payment must be a positive decimal number'),
    check('description').optional().isString().isLength({ max: 255 }).withMessage('Description must be a string with a maximum length of 255 characters')
]

const updateApplicationStatus = [
    check('status').exists().isIn(['accepted', 'rejected']).withMessage('Status must be either "accepted" or "rejected"')
]

const rateApplication = [
    check('rate')
        .exists().withMessage('Rate is required')
        .bail()
        .isFloat({ min: 0, max: 5 }).withMessage('Rate must be a number between 0 and 5')
        .bail()
        .custom((value) => Number.isInteger(Number(value) * 2)).withMessage('Rate must be in intervals of 0.5')
]

export { create, rateApplication, update, updateApplicationStatus };

