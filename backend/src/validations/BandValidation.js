import { check } from "express-validator";
import { Band, Instrument } from "../models/sequelize.js";
import { checkFileIsImage, checkFileMaxSize } from "./FileValidationHelper.js";

const maxFileSize = 2 * 1024 * 1024 // 2MB

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

const _principalInstrumentExist = async (value, { req }) => {
    try {
        const principalInstruments = Object.values(value);
        // Check that values are boolean
        for (const isPrincipal of principalInstruments) {
            if (typeof isPrincipal !== 'boolean') {
                return Promise.reject(new Error(`Principal instrument value must be boolean: ${isPrincipal}`));
            }
        }
        // Check that exactly one instrument is marked as principal
        if (principalInstruments.filter(isPrincipal => isPrincipal === true).length !== 1) {
            return Promise.reject(new Error('There must be exactly one principal instrument'));
        }
        return Promise.resolve();
    } catch (error) {
        return Promise.reject(new Error(error));
    }
}

const _bandNameUnique = async (value, { req }) => {
    try {
        const existingBand = await Band.findOne({ where: { name: value } });
        if (existingBand) {
            return Promise.reject(new Error('Band name already in use'));
        }
        return Promise.resolve();
    } catch (error) {
        return Promise.reject(new Error(error));
    }
}

const create = [
    check('name')
        .exists().withMessage('Band name is required')
        .isString().withMessage('Band name must be a string')
        .notEmpty().withMessage('Band name cannot be empty')
        .custom(_bandNameUnique),
    check('location')
        .exists().withMessage('Location is required')
        .isString().withMessage('Location must be a string')
        .notEmpty().withMessage('Location cannot be empty'),
    check('phone')
        .exists().withMessage('Phone number is required')
        .isString().withMessage('Phone number must be a string')
        .notEmpty().withMessage('Phone number cannot be empty'),
    check('type')
        .exists().withMessage('Band type is required')
        .isString().withMessage('Band type must be a string')
        .notEmpty().withMessage('Band type cannot be empty'),
    check('profile_picture')
        .optional()
        .custom((value, { req }) => {
            return checkFileIsImage(req, 'profile_picture')
        }).withMessage('Sube una imagen con formato (jpeg, png).'),
    check('profile_picture').optional().custom((value, { req }) => {
        return checkFileMaxSize(req, 'profile_picture', maxFileSize)
    }).withMessage('El tamaño del archivo supera ' + maxFileSize / 1000000 + 'MB'),
    check('instruments')
        .exists().withMessage('Instruments are required')
        .isObject().withMessage('Instruments must be an object with instrument IDs as keys')
        .custom(_instrumentsExist),
    check('instruments')
        .exists().withMessage('Instruments are required')
        .isObject().withMessage('Instruments must be an object with instrument IDs as keys')
        .custom(_principalInstrumentExist)
]

export { create };

