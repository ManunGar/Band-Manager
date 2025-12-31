import { check } from "express-validator";
import { Band, Instrument } from "../models/sequelize.js";
import { checkFileIsImage, checkFileMaxSize } from "./FileValidationHelper.js";

const maxFileSize = 2 * 1024 * 1024 // 2MB

const _instrumentsExist = async (value, { req }) => {
    try {
        const instrumentKeys = Object.keys(value);
        const instrumentIds = [];
        for (const key of instrumentKeys) {
            const instrumentId = parseInt(key, 10);
            if (Number.isNaN(instrumentId) || instrumentId <= 0) {
                return Promise.reject(new Error(`Invalid instrument id: ${key}`));
            }
            instrumentIds.push(instrumentId);
        }
        const instruments = await Instrument.findAll({ where: { id: instrumentIds } });
        if (instruments.length !== instrumentIds.length) {
            return Promise.reject(new Error('One or more instruments do not exist'));
        }
        return Promise.resolve();
    } catch (error) {
        return Promise.reject(new Error(error.message));
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
        return Promise.reject(new Error(error.message));
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
        return Promise.reject(new Error(error.message));
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
        .notEmpty().withMessage('Phone number cannot be empty')
        .custom((value, { req }) => {
            const phoneRegex = /^\+?[0-9\s\-()]{7,20}$/;
            if (!phoneRegex.test(value)) {
                return new Error('Phone number contains invalid characters');
            }
            return true;
        }),
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

const join = [
    check('instruments')
        .exists().withMessage('Instruments are required')
        .isObject().withMessage('Instruments must be an object with instrument IDs as keys')
        .custom(_instrumentsExist),
    check('instruments')
        .exists().withMessage('Instruments are required')
        .isObject().withMessage('Instruments must be an object with instrument IDs as keys')
        .custom(_principalInstrumentExist)
]

const update = [
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
        .notEmpty().withMessage('Phone number cannot be empty')
        .custom((value, { req }) => {
            const phoneRegex = /^\+?[0-9\s\-()]{7,20}$/;
            if (!phoneRegex.test(value)) {
                return new Error('Phone number contains invalid characters');
            }
            return true;
        }),
    check('type')
        .exists().withMessage('Band type is required')
        .isString().withMessage('Band type must be a string')
        .notEmpty().withMessage('Band type cannot be empty')
]

const updateProfilePicture = [
    check('profile_picture')
        .custom((value, { req }) => {
            return checkFileIsImage(req, 'profile_picture')
        }).withMessage('Sube una imagen con formato (jpeg, png).'),
    check('profile_picture')
        .custom((value, { req }) => {
            return checkFileMaxSize(req, 'profile_picture', maxFileSize)
        }).withMessage('El tamaño del archivo supera ' + maxFileSize / 1000000 + 'MB'),
]

export { create, join, update, updateProfilePicture };

