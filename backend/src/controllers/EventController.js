import { Op } from "sequelize";
import { isBandMember } from "../middleware/BandMiddleware.js";
import { Component, Event, Performance, Rehearsal } from "../models/sequelize.js";

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
        let where = {};
        // Build where array based on bandId
        if (bandIdNumber) {
            req.params.bandId = bandIdNumber;
            isBandMember(req, res, () => {}); // Ensure the user is a member of the specified band
            where.bandId = bandIdNumber;
        } else {
            // If no bandId provided, fetch events for all bands the musician is part of
            const musicianComponents = await Component.findAll({ 
                where: { musicianId }, 
                attributes: ['bandId'] 
            });
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
        // Determine order based on timeScope
        const order = timeScope === 'past' ? [['date', 'DESC']] : [['date', 'ASC']];
        
        // Fetch events based on constructed query
        const events = await Event.findAll({
            where: where,
            include: include,
            order: order
        });
        res.status(200).send(events);
    } catch (error) {
        console.error('Error listing events:', error);
        res.status(500).send({ error: 'Error listing events' });
    }

}

const EventController = {
    listEvents
}

export default EventController;