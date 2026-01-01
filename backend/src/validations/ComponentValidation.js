import { check } from "express-validator";
import { Instrument } from "../models/sequelize.js";

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

const update = [
    check('instruments')
        .exists().withMessage('Instruments are required')
        .isObject().withMessage('Instruments must be an object with instrument IDs as keys')
        .custom(_instrumentsExist),
    check('instruments')
        .exists().withMessage('Instruments are required')
        .isObject().withMessage('Instruments must be an object with instrument IDs as keys')
        .custom(_principalInstrumentExist)
]

export { update };
