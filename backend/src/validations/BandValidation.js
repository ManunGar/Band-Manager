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
        if (existingBand && existingBand.id !== parseInt(req.params?.bandId)) {
            return Promise.reject(new Error('Band name already in use'));
        }
        return Promise.resolve();
    } catch (error) {
        return Promise.reject(new Error(error.message));
    }
}

const _endTimeAfterInitialTime = async (value, { req }) => {
    const initialTime = req.body.initialTime;
    if (!initialTime) return Promise.resolve();

    const [initHour, initMin] = initialTime.split(':').map(Number);
    const [endHour, endMin] = value.split(':').map(Number);

    const initMinutes = initHour * 60 + initMin;
    const endMinutes = endHour * 60 + endMin;

    if (endMinutes <= initMinutes) {
        return Promise.reject(new Error('End time must be after initial time'));
    }
    return Promise.resolve();
}

const _instrumentsAttendanceExist = async (value, { req }) => {
    if (!Array.isArray(value)) {
        return Promise.reject(new Error('Instruments must be an array of instrument IDs'));
    }
    for (const instrumentId of value) {
        if (Number.isNaN(instrumentId) || instrumentId <= 0) {
            return Promise.reject(new Error(`Invalid instrument id: ${instrumentId}`));
        }
    }
    const instruments = await Instrument.findAll({ where: { id: value } });
    if (instruments.length !== value.length) {
        return Promise.reject(new Error('One or more instruments do not exist'));
    }
    return Promise.resolve();
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
                throw new Error('Phone number contains invalid characters');
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
        .optional()
        .isString().withMessage('Band name must be a string')
        .notEmpty().withMessage('Band name cannot be empty')
        .custom(_bandNameUnique),
    check('location')
        .optional()
        .isString().withMessage('Location must be a string')
        .notEmpty().withMessage('Location cannot be empty'),
    check('phone')
        .optional()
        .isString().withMessage('Phone number must be a string')
        .notEmpty().withMessage('Phone number cannot be empty')
        .custom((value, { req }) => {
            const phoneRegex = /^\+?[0-9\s\-()]{7,20}$/;
            if (!phoneRegex.test(value)) {
                throw new Error('Phone number contains invalid characters');
            }
            return true;
        }),
    check('type')
        .optional()
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
    check('delete_profile_picture')
        .optional()
        .isBoolean().withMessage('delete_profile_picture must be a boolean')
]

const addEvent = [
    check('eventType')
        .exists().withMessage('Event type is required')
        .isString().withMessage('Event type must be a string')
        .notEmpty().withMessage('Event type cannot be empty')
        .isIn(['performances', 'rehearsals']).withMessage('Event type must be either "performances" or "rehearsals"'),
    check('date')
        .exists().withMessage('Date is required')
        .isISO8601().withMessage('Date must be a valid ISO 8601 date')
        .toDate()
        .custom((value, { req }) => {
            const eventDate = new Date(value);
            const now = new Date();
            if (eventDate <= now) {
                throw new Error('Event date must be in the future');
            }
            return true;
        }),
    check('initialTime')
        .exists().withMessage('Initial time is required')
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Initial time must be in HH:MM format'),
    check('endTime')
        .exists().withMessage('End time is required')
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('End time must be in HH:MM format')
        .custom(_endTimeAfterInitialTime),
    check('name')
        .if(check('eventType').equals('performances'))
        .exists().withMessage('Performance name is required')
        .isString().withMessage('Performance name must be a string')
        .notEmpty().withMessage('Performance name cannot be empty'),
    check('type')
        .if(check('eventType').equals('performances'))
        .exists().withMessage('Performance type is required')
        .isString().withMessage('Performance type must be a string')
        .notEmpty().withMessage('Performance type cannot be empty'),
    check('comment')
        .optional()
        .isString().withMessage('Comment must be a string'),
    check('place')
        .if(check('eventType').equals('performances'))
        .exists().withMessage('Performance place is required')
        .isString().withMessage('Performance place must be a string')
        .notEmpty().withMessage('Performance place cannot be empty'),
    check('picture')
        .optional()
        .custom((value, { req }) => {
            return checkFileIsImage(req, 'picture')
        }).withMessage('Sube una imagen con formato (jpeg, png).'),
    check('picture').optional().custom((value, { req }) => {
        return checkFileMaxSize(req, 'picture', maxFileSize)
    }).withMessage('El tamaño del archivo supera ' + maxFileSize / 1000000 + 'MB'),
    check('instruments').optional()
        .isArray().withMessage('Instruments must be an array of instrument IDs')
        .custom(_instrumentsAttendanceExist)

]

export { addEvent, create, join, update };

