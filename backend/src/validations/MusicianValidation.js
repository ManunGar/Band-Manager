import { check } from "express-validator";
import { Instrument } from "../models/sequelize.js";

const _instrumentsExist = async (value, { req }) => {
    try {
        const instrumentIds = Object.keys(value).map(id => parseInt(id, 10));
        for (const instrumentId of instrumentIds) {
            if (Number.isNaN(instrumentId) || instrumentId <= 0) {
                return Promise.reject(new Error(`Invalid instrument id: ${instrumentId}`));
            }
        }
        const instruments = await Instrument.findAll({ where: { id: instrumentIds } });
        if (instruments.length !== instrumentIds.length) {
            return Promise.reject(new Error('One or more instruments do not exist'));
        }
        return Promise.resolve();
    } catch (error) {
        return Promise.reject(new Error(error));
    }
}

const _areLevelsValid = async (value, { req }) => {
    try {
        const validLevels = ['aficionado', 'aficionado profesional', 'enseñanzas básica', 'título profesional', 'título superior'];
        for (const level of Object.values(value)) {
            if (!validLevels.includes(level)) {
                return Promise.reject(new Error(`Invalid level: ${level}`));
            }
        }
        return Promise.resolve();
    } catch (error) {
        return Promise.reject(new Error(error));
    }
}

const addInstruments = [
    check('instruments')
        .exists().withMessage('Instruments are required')
        .isObject().withMessage('Instruments must be an object with instrument IDs as keys and levels as values')
        .custom(_instrumentsExist)
        .custom(_areLevelsValid)
]

const updateVisibility = [
    check('isProfilePrivate')
        .exists().withMessage('isProfilePrivate is required')
        .isBoolean().withMessage('isProfilePrivate must be a boolean value')
]

const listMusicians = [
    check('search')
        .optional()
        .isString().withMessage('search must be a string')
        .isLength({ max: 100 }).withMessage('search must have at most 100 characters'),
    check('instrument')
        .optional()
        .isInt({ gt: 0 }).withMessage('instrument must be a positive integer'),
    check('offset')
        .optional()
        .isInt({ min: 0 }).withMessage('offset must be a non-negative integer'),
    check('limit')
        .optional()
        .isInt({ min: 1, max: 50 }).withMessage('limit must be an integer between 1 and 50')
]

const getProfile = [
    check('musicianId')
        .exists().withMessage('musicianId is required')
        .isInt({ gt: 0 }).withMessage('musicianId must be a positive integer')
]

const listContracts = [
    check('musicianId')
        .exists().withMessage('musicianId is required')
        .isInt({ gt: 0 }).withMessage('musicianId must be a positive integer'),
    check('offset')
        .optional()
        .isInt({ min: 0 }).withMessage('offset must be a non-negative integer'),
    check('limit')
        .optional()
        .isInt({ min: 1, max: 50 }).withMessage('limit must be an integer between 1 and 50'),
    check('instrument')
        .optional()
        .isInt({ gt: 0 }).withMessage('instrument must be a positive integer')
]

export { addInstruments, getProfile, listContracts, listMusicians, updateVisibility };

