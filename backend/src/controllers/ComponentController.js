import { Component, Instrument, Musician, User } from "../models/sequelize.js";

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
        const component = await Component.findByPk(componentId);
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
        return res.status(200).send(updatedComponent);
    } catch (error) {
        await transaction.rollback();
        console.error('Error updating component instruments:', error);
        return res.status(500).send({ error: 'Error updating component instruments' });
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
    updateComponentInstruments
};

export default ComponentController;
