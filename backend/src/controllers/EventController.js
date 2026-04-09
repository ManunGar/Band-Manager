import { Op, Sequelize } from "sequelize";
import { isBandMember } from "../middleware/BandMiddleware.js";
import { addFilenameToBody, deleteFileFromCloudinary } from "../middleware/FileHandlerMiddleware.js";
import { Agreement, Application, Band, Component, Event, Instrument, Musician, Performance, Rehearsal, User } from "../models/sequelize.js";

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

        const bandEventsWithAttendance = await _getBandVisibleEvents({
            bandIdNumber,
            musicianComponents,
            timeScope,
            type,
        });

        // Keep existing behavior for band-specific listing.
        if (bandIdNumber) {
            return res.status(200).send(bandEventsWithAttendance);
        }

        const contractEventsWithAttendance = await _getAcceptedContractEvents({
            musicianId,
            musicianComponents,
            timeScope,
            type,
        });

        const mergedEvents = _mergeEventsWithPriority(bandEventsWithAttendance, contractEventsWithAttendance);
        const orderedEvents = _sortEventsByTimeScope(mergedEvents, timeScope);

        res.status(200).send(orderedEvents);
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
                    required: false,
                    where: { musicianId },
                    include: {
                        model: Instrument,
                        as: 'instruments',
                        required: false,
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
        const component = eventJson?.band?.components?.[0];
        const hasAcceptedContract = await _hasAcceptedContractForEvent(eventId, musicianId);
        
        // Check if component is administrator or participates in the event
        const isAdmin = Boolean(component?.administrator);
        const participates = component ? _checkComponentParticipation(component, eventJson) : false;
        
        if (!isAdmin && !participates && !hasAcceptedContract) {
            return res.status(403).send({ error: 'No tienes permisos para ver este evento' });
        }
        
        if (component && (isAdmin || participates)) {
            _addAttendanceInfo(eventJson, component);
        } else if (hasAcceptedContract) {
            delete eventJson.attendees;
        }
        
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

const _getBandVisibleEvents = async ({ bandIdNumber, musicianComponents, timeScope, type }) => {
    const where = {
        [Op.and]: [
            { bandId: _buildBandIdFilter(bandIdNumber, musicianComponents) },
            _buildTimeScopeFilter(timeScope)
        ]
    };

    const include = _buildEventIncludes(type);
    const order = _buildEventsOrder(timeScope);
    const events = await Event.findAll({ where, include, order });

    const filteredEvents = events.filter(event => {
        const component = musicianComponents.find(c => c.bandId === event.bandId);
        if (!component) return false;

        if (component.administrator) return true;

        return _checkComponentParticipation(component, event);
    });

    return filteredEvents.map(event => {
        const eventJson = event.toJSON();
        const component = musicianComponents.find(c => c.bandId === event.bandId);
        return _addAttendanceInfo(eventJson, component);
    });
};

const _getAcceptedContractEvents = async ({ musicianId, musicianComponents, timeScope, type }) => {
    // Contract events always come from performances.
    if (type === 'rehearsals') {
        return [];
    }

    const acceptedContractEventIds = await _getAcceptedContractEventIds(musicianId);

    if (acceptedContractEventIds.length === 0) {
        return [];
    }

    const where = {
        [Op.and]: [
            { id: { [Op.in]: acceptedContractEventIds } },
            _buildTimeScopeFilter(timeScope)
        ]
    };

    const include = _buildEventIncludes(type);
    const order = _buildEventsOrder(timeScope);
    const events = await Event.findAll({ where, include, order });

    return events.map(event => {
        const eventJson = event.toJSON();
        const component = musicianComponents.find(c => c.bandId === event.bandId);

        if (component) {
            return _addAttendanceInfo(eventJson, component);
        }

        delete eventJson.attendees;
        return eventJson;
    });
};

const _getAcceptedContractEventIds = async (musicianId) => {
    const acceptedApplications = await Application.findAll({
        where: {
            musicianId,
            status: 'accepted'
        },
        attributes: ['id'],
        include: {
            model: Agreement,
            as: 'agreement',
            required: true,
            attributes: ['id'],
            include: {
                model: Performance,
                as: 'performance',
                required: true,
                attributes: ['eventId']
            }
        }
    });

    const eventIds = acceptedApplications
        .map((application) => application?.agreement?.performance?.eventId)
        .filter((eventId) => Number.isInteger(eventId));

    return [...new Set(eventIds)];
};

const _hasAcceptedContractForEvent = async (eventId, musicianId) => {
    const acceptedApplication = await Application.findOne({
        where: {
            musicianId,
            status: 'accepted'
        },
        attributes: ['id'],
        include: {
            model: Agreement,
            as: 'agreement',
            required: true,
            attributes: ['id'],
            include: {
                model: Performance,
                as: 'performance',
                required: true,
                where: { eventId },
                attributes: ['id']
            }
        }
    });

    return Boolean(acceptedApplication);
};

const _mergeEventsWithPriority = (priorityEvents = [], secondaryEvents = []) => {
    const eventsById = new Map();

    for (const event of secondaryEvents) {
        eventsById.set(event.id, event);
    }

    for (const event of priorityEvents) {
        eventsById.set(event.id, event);
    }

    return [...eventsById.values()];
};

const _buildEventsOrder = (timeScope) => {
    if (timeScope === 'past') {
        return [['endDate', 'DESC'], ['endTime', 'DESC']];
    }

    return [['date', 'ASC'], ['initialTime', 'ASC']];
};

const _sortEventsByTimeScope = (events = [], timeScope) => {
    const sortedEvents = [...events];

    sortedEvents.sort((a, b) => {
        const aDateTime = _getComparableEventDate(a, timeScope);
        const bDateTime = _getComparableEventDate(b, timeScope);

        // Keep a deterministic order when one of the dates cannot be parsed.
        if (!Number.isFinite(aDateTime) && !Number.isFinite(bDateTime)) return 0;
        if (!Number.isFinite(aDateTime)) return 1;
        if (!Number.isFinite(bDateTime)) return -1;

        if (timeScope === 'past') {
            return bDateTime - aDateTime;
        }

        return aDateTime - bDateTime;
    });

    return sortedEvents;
};

const _getComparableEventDate = (event, timeScope) => {
    const baseDate = timeScope === 'past'
        ? (event.endDate || event.date)
        : event.date;

    const baseTime = timeScope === 'past'
        ? (event.endTime || event.initialTime || '00:00:00')
        : (event.initialTime || '00:00:00');

    const comparableDate = new Date(baseDate);
    if (Number.isNaN(comparableDate.getTime())) {
        return Number.NaN;
    }

    const [hours, minutes, seconds] = String(baseTime || '00:00:00')
        .slice(0, 8)
        .split(':')
        .map(Number);

    comparableDate.setHours(
        Number.isFinite(hours) ? hours : 0,
        Number.isFinite(minutes) ? minutes : 0,
        Number.isFinite(seconds) ? seconds : 0,
        0
    );

    return comparableDate.getTime();
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
    const eventEndDateTime = "TIMESTAMP(DATE(COALESCE(`Event`.`endDate`, `Event`.`date`)), COALESCE(`Event`.`endTime`, `Event`.`initialTime`))";

    if (timeScope === 'past') {
        return Sequelize.literal(`${eventEndDateTime} < NOW()`);
    }

    // Upcoming includes events that have not finished yet.
    return Sequelize.literal(`${eventEndDateTime} >= NOW()`);
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