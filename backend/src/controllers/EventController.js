import { Op, Sequelize } from "sequelize";
import { isBandMember } from "../middleware/BandMiddleware.js";
import { addFilenameToBody, deleteFileFromCloudinary } from "../middleware/FileHandlerMiddleware.js";
import { Band, Component, Event, Instrument, Musician, Performance, Rehearsal, User } from "../models/sequelize.js";

// ==================== Controller Functions ====================

// Function to handle listing events
const listEvents = async (req, res) => {
    const { timeScope, type, bandId } = req.query;
    const musicianId = req.user.musician.id;
    
    try {
        // Validate and convert bandId to number if provided
        let bandIdNumber;
        if (bandId) {
            bandIdNumber = Number(bandId);
            if (isNaN(bandIdNumber) || !Number.isInteger(bandIdNumber)) {
                return res.status(400).send({ error: 'bandId debe ser un número válido' });
            }
            // Ensure the user is a member of the specified band
            req.params.bandId = bandIdNumber;
            isBandMember(req, res, () => { });
        }
        
        // Get musician's components with their instruments
        const musicianComponents = await _getMusicianComponents(musicianId);

        // Build where clause
        const where = {
            [Op.and]: [
                { bandId: _buildBandIdFilter(bandIdNumber, musicianComponents) },
                _buildTimeScopeFilter(timeScope)
            ]
        };

        // Build include array and order
        const include = _buildEventIncludes(type);
        const order = timeScope === 'past' ? [['date', 'DESC']] : [['date', 'ASC']];

        // Fetch events
        const events = await Event.findAll({ where, include, order });

        // Filter events based on component's participation or admin status
        const filteredEvents = events.filter(event => {
            const component = musicianComponents.find(c => c.bandId === event.bandId);
            if (!component) return false;
            
            // If component is administrator, they can see all events
            if (component.administrator) return true;
            
            // Otherwise, check if component participates in the event
            return _checkComponentParticipation(component, event);
        });

        // Add attendance information for each event
        const eventsWithAttendance = filteredEvents.map(event => {
            const eventJson = event.toJSON();
            const component = musicianComponents.find(c => c.bandId === event.bandId);
            return _addAttendanceInfo(eventJson, component);
        });

        res.status(200).send(eventsWithAttendance);
    } catch (error) {
        console.error('Error listing events:', error);
        res.status(500).send({ error: 'Error listing events' });
    }
}

// Function to retrieve a specific event (only for event participants)
const getEvent = async (req, res) => {
    const eventId = req.params.eventId;
    const musicianId = req.user.musician.id;
    
    try {
        const event = await Event.findByPk(eventId, {
            include: [{
                model: Performance,
                required: false
            }, {
                model: Rehearsal,
                required: false
            }, {
                model: Band,
                as: 'band',
                attributes: ['id', 'name', 'profile_picture'],
                include: {
                    model: Component,
                    as: 'components',
                    where: { musicianId },
                    include: {
                        model: Instrument,
                        as: 'instruments',
                        through: {
                            where: {
                                principal: true
                            }
                        }
                    }
                }
            }, {
                model: Component,
                as: 'attendees',
                required: false,
                where: { musicianId },
                through: {
                    attributes: ['present', 'alleged', 'reason']
                },
                attributes: ['id']
            }, {
                model: Instrument,
                as: 'instrumentsAttended',
                required: false,
                through: { attributes: [] }
            }]
        });
        
        if (!event) {
            return res.status(404).send({ error: 'Event not found' });
        }

        const eventJson = event.toJSON();
        const component = eventJson.band.components[0];
        
        // Check if component is administrator or participates in the event
        const isAdmin = component.administrator;
        const participates = _checkComponentParticipation(component, eventJson);
        
        if (!isAdmin && !participates) {
            return res.status(403).send({ error: 'No tienes permisos para ver este evento' });
        }
        
        // Add attendance information using the auxiliary function
        _addAttendanceInfo(eventJson, component);
        
        res.status(200).send(eventJson);
    } catch (error) {
        console.error('Error retrieving event:', error);
        res.status(500).send({ error: 'Error retrieving event' });
    }
}

// Function to edit an event (only for event administrators)
const editEvent = async (req, res) => {
    const eventId = req.params.eventId;
    const transaction = await Event.sequelize.transaction();
    try {
        await Event.update(req.body, { where: { id: eventId }, transaction });
        const performances = await Performance.findOne({ where: { eventId }, transaction });
        if (performances) {
            await Performance.update(req.body, { where: { eventId }, transaction });
            
            let updatedPicture = performances.picture;
            
            // Handle picture deletion if requested
            if (req.body.delete_picture === true) {
                await deleteFileFromCloudinary(performances.picture, 'performances');
                updatedPicture = null;
            }
            // Handle picture upload if provided
            else if (req.file) {
                await addFilenameToBody(req, res, 'picture', Performance, 'eventId', 'performances', performances.id);
                updatedPicture = req.body.picture;
            }
            
            await Performance.update({
                picture: updatedPicture
            }, {
                where: { eventId: eventId },
                transaction
            });
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
        res.status(200).send({ message: 'Event updated successfully', event: updatedEvent});
    } catch (error) {
        await transaction.rollback();
        console.error('Error editing event:', error);
        res.status(500).send({ error: 'Error editing event' });
    }
}

// Function to delete an event (only for event administrators)
const deleteEvent = async (req, res) => {
    const eventId = req.params.eventId;
    try {
        const event = await Event.findByPk(eventId, {
            include: {
                model: Performance,
                required: false
            }
        });
        if (!event) {
            return res.status(404).send({ error: 'Event not found' });
        }
        // If event has a performance with a picture, delete the picture from Cloudinary
        if (event.Performance && event.Performance.picture) {
            await deleteFileFromCloudinary(event.Performance.picture, 'performances');
        }
        await event.destroy();
        res.status(200).send({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).send({ error: 'Error deleting event' });
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

// Function to retrieve event attendance (only for event administrators)
const getEventAttendance = async (req, res) => {
    const eventId = req.params.eventId;
    try {
        const event = await Event.findByPk(eventId, {
            include: [{
                model: Band,
                as: 'band',
                include: {
                    model: Component,
                    as: 'components',
                    include: [{
                        model: Instrument,
                        as: 'instruments',
                        through: {
                            where: {
                                principal: true
                            }
                        }
                    }, {
                        model: Musician,
                        as: 'musician',
                        include: {
                            model: User,
                            as: 'user',
                            attributes: ['id', 'full_name', 'profile_picture']
                        }
                    }]
                }
            }, {
                model: Component,
                as: 'attendees'
            }, {
                model: Instrument,
                as: 'instrumentsAttended'
            }],
            order: [
                [{model: Band, as: 'band'}, {model: Component, as: 'components'}, {model: Instrument, as: 'instruments'}, 'id', 'ASC'],
                [{model: Band, as: 'band'}, {model: Component, as: 'components'}, {model: Musician, as: 'musician'}, {model: User, as: 'user'}, 'full_name', 'ASC']
            ]
        })
        // Filter components participants and include attendance status
        const componentsAttendees = event.attendees;
        const componentsAttendance = event.band.components
            .filter(component => _checkComponentParticipation(component, event))
            .map(component => {
                const attendanceRecord = componentsAttendees.find(att => att.id === component.id);
                return {
                    component,
                    present: attendanceRecord ? attendanceRecord.EventAttendances.present : null,
                    reason: attendanceRecord ? attendanceRecord.EventAttendances.reason : null,
                    alleged: attendanceRecord ? attendanceRecord.EventAttendances.alleged : null
                };
            })
        // Group component assistance by instrument along with total count of each type of assistance (true, false and null)
        const attendanceByInstrument = {};
        for (const componentAttendance of componentsAttendance) {
            for (const instrument of componentAttendance.component.instruments) {
                if (!attendanceByInstrument[instrument.id]) {
                    attendanceByInstrument[instrument.id] = {
                        instrument: instrument,
                        attendees: [],
                        presentCount: 0,
                        absentCount: 0,
                        notConfirmedCount: 0
                    };
                }
                attendanceByInstrument[instrument.id].attendees.push(componentAttendance);
                if (componentAttendance.present === true) {
                    attendanceByInstrument[instrument.id].presentCount++;
                } else if (componentAttendance.present === false ) {
                    attendanceByInstrument[instrument.id].absentCount++;
                } else if (componentAttendance.present === null) {
                    attendanceByInstrument[instrument.id].notConfirmedCount++;
                }
            }
        }

        res.status(200).send({ componentsAttendance, attendanceByInstrument});
    } catch (error) {
        console.error('Error retrieving event attendance:', error);
        res.status(500).send({ error: 'Error retrieving event attendance' });
    }
}

// Function to handle components attendances in a performance or rehearsal (only for event administrators)
const updateEventAttendance = async (req, res) => {
    const eventId = req.params.eventId;
    const transaction = await Event.sequelize.transaction();
    try {
        const EventAttendances = Event.sequelize.models.EventAttendances;
        // Update or create attendance records for components marked as present
        for (const componentAttendance of req.body.componentsPresent) {
            await EventAttendances.upsert({
                eventId: eventId,
                componentId: componentAttendance,
                present: true,
                alleged: null
            }, { transaction });
        }
        // Update or create attendance records for components marked as absent
        for (const componentAbsence of req.body.componentsAbsent || []) {
            await EventAttendances.upsert({
                eventId: eventId,
                componentId: componentAbsence,
                present: false,
                alleged: null
            }, { transaction });
        }
        // Update or create attendance records for components marked as alleged
        for (const componentAlleged of req.body.componentsAlleged || []) {
            await EventAttendances.upsert({
                eventId: eventId,
                componentId: componentAlleged,
                present: false,
                alleged: true,
                reason: componentAlleged.reason
            }, { transaction });
        }
        // Update or create attendance records for components marked as not confirmed (null)
        for (const componentNotConfirmed of req.body.componentsNotConfirmed || []) {
            await EventAttendances.upsert({
                eventId: eventId,
                componentId: componentNotConfirmed,
                present: null,
                alleged: null
            }, { transaction });
        }
        await transaction.commit();
        res.status(200).send({ message: 'Event attendance updated successfully' });
    } catch (error) {
        await transaction.rollback();
        console.error('Error updating event attendance:', error);
        res.status(500).send({ error: 'Error updating event attendance' });
    }
}

// ==================== Auxiliary Functions ====================

// Get musician's components with their principal instruments
const _getMusicianComponents = async (musicianId) => {
    return await Component.findAll({
        where: { musicianId },
        include: [
            {
                model: Instrument,
                as: 'instruments',
                attributes: ['id'],
                through: {
                    where: {
                        principal: true
                    },
                    attributes: []
                }
            }
        ]
    });
};

// Build bandId filter for events query
const _buildBandIdFilter = (bandIdNumber, musicianComponents) => {
    if (bandIdNumber) {
        return bandIdNumber;
    }
    // If no bandId provided, fetch events for all bands the musician is part of
    return musicianComponents.map(component => component.bandId);
};

// Build timeScope filter for events query
const _buildTimeScopeFilter = (timeScope) => {
    let filter;

    if (timeScope === 'past') {
        // Past: dates before today, or today with initialTime earlier than current DB time
        filter = {
            [Op.or]: [
                Sequelize.literal("DATE(`Event`.`date`) < CURDATE()"),
                Sequelize.literal("DATE(`Event`.`date`) = CURDATE() AND `Event`.`initialTime` < CURTIME()")
            ]
        };
    } else {
        // Upcoming: dates after today, or today with initialTime >= current DB time
        filter = {
            [Op.or]: [
                Sequelize.literal("DATE(`Event`.`date`) > CURDATE()"),
                Sequelize.literal("DATE(`Event`.`date`) = CURDATE() AND `Event`.`initialTime` >= CURTIME()")
            ]
        };
    }

    return filter;
};

// Build include array for events query based on type
const _buildEventIncludes = (type) => {
    const include = [];
    
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

    // Include attendees with EventAttendances data
    include.push({
        model: Component,
        as: 'attendees',
        required: false,
        through: {
            attributes: ['present', 'alleged', 'reason']
        },
        attributes: ['id']
    });

    // Include band picture and name for frontend display
    include.push({
        model: Band,
        as: 'band',
        attributes: ['id', 'name', 'profile_picture']
    });
    
    return include;
};

// Check if component participates in the event based on principal instrument
const _checkComponentParticipation = (component, event) => {
    // If event has no instruments, all components participate
    if (!event.instrumentsAttended || event.instrumentsAttended.length === 0) {
        return true;
    }
    
    // Check if the component's principal instrument matches the event's instruments
    const componentInstrumentIds = component.instruments.map(i => i.id);
    const eventInstrumentIds = event.instrumentsAttended.map(i => i.id);
    
    return componentInstrumentIds.some(id => eventInstrumentIds.includes(id));
};

// Add attendance information to event
const _addAttendanceInfo = (eventJson, component) => {
    const participates = _checkComponentParticipation(component, eventJson);
    
    // Find attendance record for this component
    const attendanceRecord = eventJson.attendees?.find(attendee => attendee.id === component.id);
    
    // Add participation and attendance data to the event
    eventJson.attendance = {
        participates,
        present: attendanceRecord?.EventAttendances?.present ?? null,
        alleged: attendanceRecord?.EventAttendances?.alleged ?? null,
        reason: attendanceRecord?.EventAttendances?.reason ?? null
    };
    
    // Remove attendees array as it's not needed in the response
    delete eventJson.attendees;
    
    return eventJson;
};

const EventController = {
    listEvents,
    getEvent,
    editEvent,
    deleteEvent,
    updateComponentAttendance,
    getEventAttendance,
    updateEventAttendance
}

// Export auxiliary functions for reuse in other controllers
export {
    _addAttendanceInfo, _buildBandIdFilter, _buildEventIncludes, _buildTimeScopeFilter, _checkComponentParticipation, _getMusicianComponents
};

export default EventController;