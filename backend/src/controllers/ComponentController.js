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

const ComponentController = {
    findComponentById
};

export default ComponentController;
