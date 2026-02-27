import { check } from "express-validator";
import { Band, Component, Event, Instrument } from "../models/sequelize.js";
import { checkFileIsImage, checkFileMaxSize } from "./FileValidationHelper.js";

const maxFileSize = 2 * 1024 * 1024 // 2MB

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

const _checkComponentsParticipants = async (value, { req }) => {
    const eventId = Number(req.params.eventId);
    const areNumbers = value.every(id => typeof id === 'number' && Number.isInteger(id) && id > 0);
    if (!areNumbers) {
        return Promise.reject(new Error('Components present must be an array of valid component IDs'));
    }
    try {
        const event = await Event.findByPk(eventId, {
            include: [{
                model: Band,
                as: 'band',
                include: {
                    model: Component,
                    as: 'components',
                    attributes: ['id'],
                    include: {
                        model: Instrument,
                        as: 'instruments',
                        through: {
                            attributes: ['principal'],
                            where: { principal: true }
                        }
                    }

                }
            }, {
                model: Instrument,
                as: 'instrumentsAttended'
            }]
        });
        if (!event) { return Promise.reject(new Error('Event not found')); }
        const bandComponentIds = event.band.components.map(c => c.id);
        for (const componentId of value) {
            if (!bandComponentIds.includes(componentId)) {
                return Promise.reject(new Error(`Component with id ${componentId} is not part of the band`));
            }
            if (event.instrumentsAttended && event.instrumentsAttended.length > 0) {
                const component = event.band.components.find(c => c.id === componentId);
                const componentInstrumentIds = component.instruments.map(i => i.id);
                const eventInstrumentIds = event.instrumentsAttended.map(i => i.id);
                const isParticipant = componentInstrumentIds.some(id => eventInstrumentIds.includes(id));
                if (!isParticipant) {
                    return Promise.reject(new Error(`Component with id ${componentId} is not a participant of the event`));
                }
            }
        }
        return Promise.resolve();
    } catch (error) {
        return Promise.reject(new Error('Error validating band components'));
    }
}

const create = [
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
            return checkFileIsImage(req, 'profile_picture')
        }).withMessage('Sube una imagen con formato (jpeg, png).'),
    check('picture').optional().custom((value, { req }) => {
        return checkFileMaxSize(req, 'profile_picture', maxFileSize)
    }).withMessage('El tamaño del archivo supera ' + maxFileSize / 1000000 + 'MB'),
    check('instruments').optional()
        .isArray().withMessage('Instruments must be an array of instrument IDs')
        .custom(_instrumentsAttendanceExist)

]

const update = [
    check('date')
        .optional()
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
        .optional()
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Initial time must be in HH:MM format'),
    check('endTime')
        .optional()
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('End time must be in HH:MM format')
        .custom(_endTimeAfterInitialTime),
    check('name')
        .optional()
        .isString().withMessage('Performance name must be a string')
        .notEmpty().withMessage('Performance name cannot be empty'),
    check('type')
        .optional()
        .isString().withMessage('Performance type must be a string')
        .notEmpty().withMessage('Performance type cannot be empty'),
    check('comment')
        .optional()
        .isString().withMessage('Comment must be a string'),
    check('place')
        .optional()
        .isString().withMessage('Performance place must be a string')
        .notEmpty().withMessage('Performance place cannot be empty'),
    check('picture')
        .optional()
        .custom((value, { req }) => {
            return checkFileIsImage(req, 'profile_picture')
        }).withMessage('Sube una imagen con formato (jpeg, png).'),
    check('picture').optional().custom((value, { req }) => {
        return checkFileMaxSize(req, 'profile_picture', maxFileSize)
    }).withMessage('El tamaño del archivo supera ' + maxFileSize / 1000000 + 'MB'),
    check('instruments').optional()
        .isArray().withMessage('Instruments must be an array of instrument IDs')
        .custom(_instrumentsAttendanceExist)
]

const componentAttendance = [
    check('present')
        .exists().withMessage('Present field is required')
        .isBoolean().withMessage('Present field must be a boolean'),
    check('reason')
        .optional()
        .isString().withMessage('Reason must be a string')
]

const attendance = [
    check('componentsPresent')
        .optional()
        .isArray().withMessage('Components present must be an array of component IDs')
        .custom(_checkComponentsParticipants),
    check('componentsAbsent')
        .optional()
        .isArray().withMessage('Components absent must be an array of component IDs')
        .custom(_checkComponentsParticipants),
    check('componentsAlleged')
        .optional()
        .isArray().withMessage('Components alleged must be an array of component IDs')
        .custom(_checkComponentsParticipants)
]

export { attendance, componentAttendance, create, update };

