import { Op } from "sequelize";
import { Band, Component, Event, Instrument, Musician, User } from "../models/sequelize.js";

// Function to find a component by its ID
const findComponentById = async (req, res) => {
    const componentId = req.params.componentId;
    try {
        const component = await Component.findByPk(componentId,
            {
                include: [{
                    model: Instrument,
                    as: 'instruments',
                    required: true
                }, {
                    model: Musician,
                    as: 'musician',
                    required: true,
                    include: [{
                        model: User,
                        as: 'user',
                        required: true,
                        attributes: ['id', 'full_name', 'profile_picture']
                    }]
                }, {
                    model: Event,
                    as: 'eventsAttended',
                    required: false,
                    where: {
                        date: {
                            [Op.lt]: new Date()
                        }
                    },
                    through: {
                        attributes: ['present', 'alleged', 'reason']
                    }
                }]
            }
        );
        if (!component) {
            return res.status(404).send({ error: 'Component not found.' });
        }
        res.status(200).send(component);
    } catch (error) {
        console.error('Error fetching component by ID:', error);
        res.status(500).send({ error: 'Error fetching component by ID' });
    }
};

// Function to update instrument associations for a component
const updateComponentInstruments = async (req, res) => {
    const instruments = req.body.instruments;
    const componentId = req.params.componentId;
    const transaction = await Component.sequelize.transaction();
    try {
        const component = req.component || await Component.findByPk(componentId);
        const instrumentsData = _transformInstrumentsData(instruments);
        await component.setInstruments([], { transaction }); // Remove existing associations
        for (const instrumentData of instrumentsData) {
            const instrument = await Instrument.findByPk(instrumentData.instrumentId);
            if (instrument) {
                await component.addInstrument(instrument, { through: { principal: instrumentData.principal }, transaction });
            }
        }
        const updatedComponent = await component.reload({
            include: [{
                model: Instrument,
                as: 'instruments',
                required: false
            }, {
                model: Musician,
                as: 'musician',
                required: true,
                include: [{
                    model: User,
                    as: 'user',
                    required: true,
                    attributes: ['id', 'full_name', 'profile_picture']
                }]
            }],
            transaction
        });
        await transaction.commit();
        return res.status(200).send({ message: 'Component instruments updated successfully', component: updatedComponent });
    } catch (error) {
        await transaction.rollback();
        console.error('Error updating component instruments:', error);
        return res.status(500).send({ error: 'Error updating component instruments' });
    }
};

// Function to promote a component to administrator
const promoteToAdministrator = async (req, res) => {
    const componentId = req.params.componentId;
    try {
        const component = await Component.findByPk(componentId);
        if (!component) {
            return res.status(404).send({ error: 'Component not found.' });
        }
        const administratorsCount = await Component.count({
            where: {
                bandId: component.bandId,
                administrator: true
            }
        });
        if (administratorsCount === 1 && component.administrator) {
            return res.status(400).send({ error: 'A band must have at least one administrator.' });
        }
        if (!component.administrator) {
            component.administrator = true;
        } else {
            component.administrator = false;
        }
        await component.save();
        return res.status(200).send({ message: component.administrator ? 'Component promoted to administrator successfully.' : 'Component demoted from administrator successfully.' });
    } catch (error) {
        console.error('Error promoting component to administrator:', error);
        return res.status(500).send({ error: 'Error promoting component to administrator' });
    }
};

// Function to allow a component to leave a band
const leaveBand = async (req, res) => {
    const componentId = req.params.componentId;
    const transaction = await Component.sequelize.transaction();
    try {
        const component = await Component.findByPk(componentId);
        if (!component) {
            return res.status(404).send({ error: 'Component not found.' });
        }
        const componentCount = await Component.count({
            where: {
                bandId: component.bandId
            }
        });
        // Ensure that the band will have at least one administrator
        const administratorsCount = await Component.count({
            where: {
                bandId: component.bandId,
                administrator: true
            }
        });
        if (administratorsCount === 1 && component.administrator && componentCount > 1) {
            return res.status(400).send({ error: 'A band must have at least one administrator.' });
        }
        // Check if the band have only one component
        if (componentCount <= 1) {
            await Band.destroy({
                where: {
                    id: component.bandId
                },
                transaction
            });
        }
        await component.destroy({ transaction });
        await transaction.commit();
        return res.status(200).send({ message: 'Component has left the band successfully.' });
    } catch (error) {
        await transaction.rollback();
        console.error('Error leaving band:', error);
        return res.status(500).send({ error: 'Error leaving band' });
    }
};

// Function to transform instruments data from request body
const _transformInstrumentsData = (instruments) => {
    const instrumentsId = Object.keys(instruments).map(id => parseInt(id, 10))
    const instrumentsData = instrumentsId.map(id => ({ instrumentId: id, principal: instruments[id] }))
    return instrumentsData;
}

const ComponentController = {
    findComponentById,
    updateComponentInstruments,
    promoteToAdministrator,
    leaveBand
};

export default ComponentController;
