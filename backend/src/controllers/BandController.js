import Sequelize from "sequelize";
import { addFilenameToBody, deleteFileFromCloudinary } from "../middleware/FileHandlerMiddleware.js";
import { Band, Component, Event, Instrument, Musician, Performance, Rehearsal, User } from "../models/sequelize.js";
import { _checkComponentParticipation } from "./EventController.js";

// Function to list bands of the logged-in musician
const listMyBands = async (req, res) => {
    const musicianId = req.user.musician.id;
    try {
        const bands = await Band.findAll({
            include: [{
                model: Component,
                as: 'components',
                where: { musicianId }
            }]
        });
        res.status(200).send(bands);
    } catch (error) {
        console.error('Error fetching my bands:', error);
        res.status(500).send({ error: 'Error fetching my bands' });
    }
};

// Function to create a new band and associate the logged-in musician as an administrator
const createBand = async (req, res) => {
    const transaction = await Band.sequelize.transaction();
    try {
        const code = await _generateUniqueBandCode();
        // Create the band
        const band = await Band.create({
            name: req.body.name,
            location: req.body.location,
            phone: req.body.phone,
            type: req.body.type,
            code: code
        }, { transaction });
        // Associate the logged-in musician as an administrator component of the band
        await Component.create({
            bandId: band.id,
            musicianId: req.user.musician.id,
            administrator: true
        }, { transaction });
        // Create instruments associations of the component
        const newComponent = await Component.findOne({
            where: {
                bandId: band.id,
                musicianId: req.user.musician.id
            },
            transaction
        });
        const instruments = _transformInstrumentsData(req.body.instruments || {});
        for (const instr of instruments) {
            await newComponent.addInstrument(instr.instrumentId, { through: { principal: instr.principal }, transaction });
        }
        // Handle profile picture upload if provided
        if (req.file) {
            await addFilenameToBody(req, 'profile_picture', Band, 'bandId', 'bands');
            await band.update({
                profile_picture: req.body.profile_picture
            }, { transaction });
        }

        await transaction.commit();
        res.status(201).send({ message: 'Band created successfully', band });
    } catch (error) {
        await transaction.rollback();
        console.error('Error creating band:', error);
        res.status(500).send({ error: 'Error creating band' });
    }
};

//Function to find a band by its ID
const findBandById = async (req, res) => {
    const bandId = req.params.bandId;
    try {
        const band = await Band.findByPk(bandId, {
            include: [{
                model: Component,
                as: 'components',
                include: [{
                    model: Musician,
                    as: 'musician',
                    include: {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'full_name', 'profile_picture']
                    }
                },
                {
                    model: Instrument,
                    as: 'instruments',
                    through: {
                        attributes: ['principal'],
                        where: { principal: true }
                    }
                }]
            }, {
                model: Event,
                as: 'events',
                where: Sequelize.literal("CONCAT(DATE(`events`.`date`), ' ', `events`.`endTime`) >= NOW()"),
                include: [{
                    model: Performance,
                    required: false
                }, {
                    model: Rehearsal,
                    required: false
                },
                {
                    model: Instrument,
                    as: 'instrumentsAttended',
                    required: false,
                    through: { attributes: [] }
                }],
                required: false
            }],
            order: [
                [{ model: Event, as: 'events' }, 'date', 'ASC'],
                [{ model: Event, as: 'events' }, 'initialTime', 'ASC']
            ]
        });
        if (!band) {
            return res.status(404).send({ error: 'Band not found' });
        }
        // Sort components by the ID of their principal instrument
        band.components = band.components.sort((a, b) => {
            const aId = a.instruments[0]?.id ?? Infinity;
            const bId = b.instruments[0]?.id ?? Infinity;
            return aId - bId;
        });
        
        // Convert to plain object to avoid Sequelize instance issues
        const bandData = band.toJSON();
        
        // Get my component (with principal instruments only)
        const myComponent = bandData.components.find(component => component.musicianId == req.user.musician.id);
        
        if (myComponent) {            
            // Filter events based on component's principal instruments participation
            bandData.events = bandData.events.filter(event => {
                // If my component is administrator, return true
                if (myComponent.administrator) {
                    return true;
                }
                // Check if component participates in the event
                return _checkComponentParticipation(myComponent, event);
            });
            
            // Re-sort events after filtering to ensure correct order
            bandData.events.sort((a, b) => {
                const dateCompare = new Date(a.date) - new Date(b.date);
                if (dateCompare !== 0) return dateCompare;
                // If dates are equal, compare by initialTime
                if (a.initialTime && b.initialTime) {
                    return a.initialTime.localeCompare(b.initialTime);
                }
                return 0;
            });
        }
        res.status(200).send(bandData);
    } catch (error) {
        console.error('Error fetching band by ID:', error);
        res.status(500).send({ error: 'Error fetching band by ID' });
    }
};

// Function to find a band by its unique code
const findBandByCode = async (req, res) => {
    const bandCode = req.params.bandCode;
    try {
        const band = await Band.findOne({
            where: { code: bandCode },
            include: [{
                model: Component,
                as: 'components',
                include: [{
                    model: Musician,
                    as: 'musician',
                    include: {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'full_name', 'profile_picture']
                    }
                }]
            }]
        });
        if (!band) {
            return res.status(404).send({ error: 'Band not found' });
        }
        res.status(200).send(band);
    } catch (error) {
        console.error('Error fetching band by code:', error);
        res.status(500).send({ error: 'Error fetching band by code' });
    }
};

// Function to join a band by its ID and create a component for the logged-in musician
const joinBand = async (req, res) => {
    const bandId = req.params.bandId;
    const musicianId = req.user.musician.id;
    const transaction = await Band.sequelize.transaction();
    try {
        // Check if the band exists
        const band = await Band.findByPk(bandId);
        if (!band) {
            await transaction.rollback();
            return res.status(404).send({ error: 'Band not found' });
        }
        // Create the component for the musician
        const component = await Component.create({
            bandId: band.id,
            musicianId: musicianId,
            administrator: false
        }, { transaction });
        const instruments = _transformInstrumentsData(req.body.instruments || {});
        for (const instr of instruments) {
            await component.addInstrument(instr.instrumentId, { through: { principal: instr.principal }, transaction });
        }
        await transaction.commit();
        return res.status(201).send({ message: 'Joined band successfully', component });
    } catch (error) {
        await transaction.rollback();
        console.error('Error joining band:', error);
        res.status(500).send({ error: 'Error joining band' });
    }
};

// Function to update a band by its ID
const updateBand = async (req, res) => {
    const bandId = req.params.bandId;
    try {
        const band = await Band.findByPk(bandId);
        if (!band) {
            return res.status(404).send({ error: 'Band not found' });
        }
        // Handle profile picture upload if provided
        if (req.file) {
            await addFilenameToBody(req, 'profile_picture', Band, 'bandId', 'bands');
        }
        await band.update({
            name: req.body.name,
            location: req.body.location,
            phone: req.body.phone,
            type: req.body.type,
            profile_picture: req.body.profile_picture || band.profile_picture
        });
        res.status(200).send({ message: 'Band updated successfully', band });
    } catch (error) {
        console.error('Error updating band:', error);
        res.status(500).send({ error: 'Error updating band' });
    }
};

// Function to delete a band by its ID
const deleteBand = async (req, res) => {
    const bandId = req.params.bandId;
    try {
        const band = await Band.findByPk(bandId);
        if (!band) {
            return res.status(404).send({ error: 'Band not found' });
        }
        await band.destroy();
        res.status(200).send({ message: 'Band deleted successfully' });
    } catch (error) {
        console.error('Error deleting band:', error);
        res.status(500).send({ error: 'Error deleting band' });
    }
};

// Function to edit profile picture of a band by its ID
const editBandProfilePicture = async (req, res) => {
    const bandId = req.params.bandId;
    try {
        const band = await Band.findByPk(bandId);
        if (!band) {
            return res.status(404).send({ error: 'Band not found' });
        }
        await addFilenameToBody(req, 'profile_picture', Band, 'bandId', 'bands');
        await band.update({
            profile_picture: req.body.profile_picture
        });
        const updatedBand = await Band.findByPk(bandId);
        res.status(200).send({ message: 'Band profile picture updated successfully', band: updatedBand });
    } catch (error) {
        console.error('Error updating band profile picture:', error);
        res.status(500).send({ error: 'Error updating band profile picture' });
    }
};

// Function to delete profile picture of a band by its ID
const deleteBandProfilePicture = async (req, res) => {
    const bandId = req.params.bandId;
    try {
        const band = await Band.findByPk(bandId);
        if (!band) {
            return res.status(404).send({ error: 'Band not found' });
        }
        const bandProfilePictureUrl = band.profile_picture;
        await band.update({
            profile_picture: null
        });
        await deleteFileFromCloudinary(bandProfilePictureUrl, 'bands');
        const updatedBand = await Band.findByPk(bandId);
        res.status(200).send({ message: 'Band profile picture deleted successfully', band: updatedBand });
    } catch (error) {
        console.error('Error deleting band profile picture:', error);
        res.status(500).send({ error: 'Error deleting band profile picture' });
    }
};

// Function to add a event to a band by its ID
const addEventToBand = async (req, res) => {
    const bandId = req.params.bandId;
    const eventType = req.body.eventType;
    const transaction = await Band.sequelize.transaction();
    try {
        const event = await Event.create({
            date: req.body.date,
            initialTime: req.body.initialTime,
            endTime: req.body.endTime,
            bandId: bandId
        }, { transaction });
        if (eventType === 'performances') {
            await Performance.create({
                name: req.body.name,
                place: req.body.place,
                comment: req.body.comment,
                type: req.body.type,
                eventId: event.id
            }, { transaction });
            if (req.file) {
                await addFilenameToBody(req, 'picture', Performance, 'eventId', 'performances');
                await Performance.update({
                    picture: req.body.picture
                }, {
                    where: { eventId: event.id },
                    transaction
                });
            }
        } else if (eventType === 'rehearsals') {
            await Rehearsal.create({
                eventId: event.id
            }, { transaction });
        }
        if (req.body.instruments) {
            for (const instrumentId of req.body.instruments) {
                await event.addInstrumentsAttended(instrumentId, { transaction });
            }
        }
        await transaction.commit();
        res.status(201).send({ message: 'Event added to band successfully', event });
    } catch (error) {
        await transaction.rollback();
        console.error('Error adding event to band:', error);
        res.status(500).send({ error: 'Error adding event to band' });
    }
};

// Function to generate a unique band code
const _generateUniqueBandCode = async () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code;
    let exists = true;
    while (exists) {
        code = '';
        for (let i = 0; i < 8; i++) {
            code += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        const existingBand = await Band.findOne({ where: { code } });
        if (!existingBand) {
            exists = false;
        }
    }
    return code;
};

// Function to transform instruments data from request body
const _transformInstrumentsData = (instruments) => {
    const instrumentsId = Object.keys(instruments).map(id => parseInt(id, 10))
    const instrumentsData = instrumentsId.map(id => ({ instrumentId: id, principal: instruments[id] }))
    return instrumentsData;
}

const BandController = {
    listMyBands,
    createBand,
    findBandById,
    findBandByCode,
    joinBand,
    updateBand,
    deleteBand,
    editBandProfilePicture,
    deleteBandProfilePicture,
    addEventToBand
};

export default BandController;