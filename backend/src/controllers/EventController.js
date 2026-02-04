import { Op } from "sequelize";
import { isBandMember } from "../middleware/BandMiddleware.js";
import { Component, Event, Instrument, Performance, Rehearsal } from "../models/sequelize.js";

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

const EventController = {
    listEvents
}

export default EventController;