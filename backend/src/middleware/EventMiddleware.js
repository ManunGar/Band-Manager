import { Band, Component, Event, Instrument } from "../models/sequelize.js";

// Middleware to check if the user is an admin of the event
const isEventAdmin = async (req, res, next) => {
    const eventId = req.params.eventId;
    const musicianId = req.user.musician.id;
    try {
        const event = await Event.findByPk(eventId, {
            include: {
                model: Band,
                as: 'band',
                include: {
                    model: Component,
                    as: 'components',
                    where: {
                        musicianId: musicianId,
                        administrator: true
                    }
                }
            }
        });
        if (!event) {
            return res.status(403).send({ error: 'Access denied. You are not an admin of this event.' });
        }
        next();
    } catch (error) {
        console.error('Error checking event admin status:', error);
        res.status(500).send({ error: 'Error checking event admin status' });
    }
}

// Middleware to check if the user is a participant of the event
const isEventParticipant = async (req, res, next) => {
    const eventId = req.params.eventId;
    const musicianId = req.user.musician.id;
    try {
        const event = await Event.findByPk(eventId, {
            include: [{
                model: Band,
                as: 'band',
                include: {
                    model: Component,
                    as: 'components',
                    where: {
                        musicianId: musicianId
                    },
                    include: {
                        model: Instrument,
                        as: 'instruments'
                    }
                }
            }, {
                model: Instrument,
                as: 'instrumentsAttended'
            }]
        });
        if (!event) {
            return res.status(403).send({ error: 'Access denied. You are not a participant of this event.' });
        }
        if (event.instrumentsAttended && event.instrumentsAttended.length > 0) {
            const component = event.band.components.find(c => c.musicianId === musicianId);
            const componentInstrumentIds = component.instruments.map(i => i.id);
            const eventInstrumentIds = event.instrumentsAttended.map(i => i.id);
            const isParticipant = componentInstrumentIds.some(id => eventInstrumentIds.includes(id));
            if (!isParticipant) {
                return res.status(403).send({ error: 'Access denied. You are not a participant of this event.' });
            }
        }
        next();
    } catch (error) {
        console.error('Error checking event participant status:', error);
        res.status(500).send({ error: 'Error checking event participant status' });
    }
}

export { isEventAdmin, isEventParticipant };
