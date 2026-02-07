import { Op } from "sequelize";
import { isBandMember } from "../middleware/BandMiddleware.js";
import { addFilenameToBody } from "../middleware/FileHandlerMiddleware.js";
import { Band, Component, Event, Instrument, Performance, Rehearsal } from "../models/sequelize.js";

// Function to handle listing events
const listEvents = async (req, res) => {
    const { timeScope, type, bandId } = req.query;
    const musicianId = req.user.musician.id;
    // Logic to list events based on query parameters
    try {
        // Validate and convert bandId to number if provided
        let bandIdNumber;
        if (bandId) {
            bandIdNumber = Number(bandId);
            if (isNaN(bandIdNumber) || !Number.isInteger(bandIdNumber)) {
                return res.status(400).send({ error: 'bandId debe ser un número válido' });
            }
        }
        // Get musician's components with their instruments and band info
        const musicianComponents = await Component.findAll({ 
            where: { musicianId }, 
            include: [
                { 
                    model: Instrument, 
                    as: 'instruments',
                    attributes: ['id'],
                    through: { attributes: [] }
                }
            ]
        });
        
        let where = {};
        // Build where array based on bandId
        if (bandIdNumber) {
            req.params.bandId = bandIdNumber;
            isBandMember(req, res, () => {}); // Ensure the user is a member of the specified band
            where.bandId = bandIdNumber;
        } else {
            // If no bandId provided, fetch events for all bands the musician is part of
            const bandIds = musicianComponents.map(component => component.bandId);
            where.bandId = bandIds;
        }
        
        // Build where condition based on timeScope
        const now = new Date();
        if (timeScope === 'past') {
            // Events that have already ended
            where[Op.or] = [
                {
                    date: { [Op.lt]: now },
                    endTime: null
                },
                {
                    [Op.and]: [
                        { date: { [Op.lte]: now } },
                        { endTime: { [Op.ne]: null } }
                    ]
                }
            ];
        } else {
            // 'upcoming' or any other value - events that haven't ended yet
            where[Op.or] = [
                {
                    date: { [Op.gt]: now },
                    endTime: null
                },
                {
                    [Op.and]: [
                        { date: { [Op.gte]: now } },
                        { endTime: { [Op.ne]: null } }
                    ]
                }
            ];
        }
        
        // Build include array based on type
        let include = [];
        if (type === 'performances') {
            // Only events with performances (excludes rehearsals)
            include.push({ model: Performance, required: true });
        } else if (type === 'rehearsals') {
            // Only events with rehearsals (excludes performances)
            include.push({ model: Rehearsal, required: true });
        } else {
            // Events with either performances or rehearsals
            include.push({ model: Performance, required: false });
            include.push({ model: Rehearsal, required: false });
        }
        
        // Always include instruments to check attendance
        include.push({ 
            model: Instrument, 
            as: 'instrumentsAttended',
            required: false,
            through: { attributes: [] }
        });
        
        // Determine order based on timeScope
        const order = timeScope === 'past' ? [['date', 'DESC']] : [['date', 'ASC']];
        
        // Fetch events based on constructed query
        const events = await Event.findAll({
            where: where,
            include: include,
            order: order
        });
        
        // Filter events based on component's instrument participation
        const filteredEvents = events.filter(event => {
            // Find the component for this band
            const component = musicianComponents.find(c => c.bandId === event.bandId);
            if (!component) return false;
            
            // If component is administrator, they can see all events
            if (component.administrator) return true;
            
            // If event has no instruments, all instruments participate
            if (!event.instrumentsAttended || event.instrumentsAttended.length === 0) return true;
            
            // Check if any of the component's instruments participate in the event
            const componentInstrumentIds = component.instruments.map(i => i.id);
            const eventInstrumentIds = event.instrumentsAttended.map(i => i.id);
            
            return componentInstrumentIds.some(id => eventInstrumentIds.includes(id));
        });
        
        res.status(200).send(filteredEvents);
    } catch (error) {
        console.error('Error listing events:', error);
        res.status(500).send({ error: 'Error listing events' });
    }

}

// Function to edit an event (only for event administrators)
const editEvent = async (req, res) => {
    const eventId = req.params.eventId;
    const transaction = await Event.sequelize.transaction();
    try {
        await Event.update( req.body, { where: { id: eventId }, transaction });
        const performances = await Performance.findOne({ where: { eventId }, transaction });
        if (performances) {
            await Performance.update( req.body, { where: { eventId }, transaction });
            if (req.file) {
                await addFilenameToBody(req, 'picture', Performance, 'eventId', 'performances');
                await Performance.update({
                    picture: req.body.picture
                }, {
                    where: { eventId: eventId },
                    transaction
                });
            }
        }
        // Change event's associated instruments if provided
        const updatedEvent = await Event.findByPk(eventId, { transaction });
        if (req.body.instruments) {
            await updatedEvent.setInstrumentsAttended([], { transaction }); // Remove existing associations
            const instrumentIds = typeof req.body.instruments === 'string' ? JSON.parse(req.body.instruments) : req.body.instruments;
            for (const instrumentId of instrumentIds) {
                await updatedEvent.addInstrumentsAttended(instrumentId, { transaction });
            }
        }
        await transaction.commit();
        res.status(200).send(updatedEvent);
    } catch (error) {
        await transaction.rollback();
        console.error('Error editing event:', error);
        res.status(500).send({ error: 'Error editing event' });
    }
}

// Function to handle component attendance updates (only for event participants)
const updateComponentAttendance = async (req, res) => {
    const eventId = req.params.eventId;
    const musicianId = req.user.musician.id;
    const transaction = await Event.sequelize.transaction();
    try {
        const event = await Event.findByPk(eventId, {
            include: {
                model: Band,
                as: 'band',
                include: {
                    model: Component,
                    as: 'components',
                    where: {
                        musicianId: musicianId
                    }
                }
            },
            transaction
        });

        const componentId = event.band.components[0].id;
        // Access EventAttendances table directly to update or create
        const EventAttendances = Event.sequelize.models.EventAttendances;
        await EventAttendances.upsert({
            eventId: eventId,
            componentId: componentId,
            present: req.body.present,
            alleged: req.body.alleged,
            reason: req.body.reason
        }, { transaction });
        
        await transaction.commit();
        res.status(200).send({ message: 'Component attendance updated successfully' });
    } catch (error) {
        await transaction.rollback();
        console.error('Error updating component attendance:', error);
        res.status(500).send({ error: 'Error updating component attendance' });
    }
}

const EventController = {
    listEvents,
    editEvent,
    updateComponentAttendance
}

export default EventController;