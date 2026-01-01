import { Component } from "../models/sequelize.js";

// Middleware to check if the component is in the same band as me
const isInTheSameBand = async (req, res, next) => {
    const componentId = req.params.componentId;
    const musicianId = req.user.musician.id;
    try {
        const component = await Component.findByPk(componentId);
        const mycomponents = await Component.findAll({
            where: {
                musicianId: musicianId
            }
        });
        if (!component || mycomponents.length === 0) {
            return res.status(404).send({ error: 'Component not found.' });
        }
        const isInSameBand = mycomponents.some(mycomponent => mycomponent.bandId === component.bandId);
        if (!isInSameBand) {
            return res.status(403).send({ error: 'Access denied. You are not in the same band as this component.' });
        }
        next();
    } catch (error) {
        console.error('Error checking component band membership:', error);
        res.status(500).send({ error: 'Error checking component band membership' });
    }
};

export { isInTheSameBand };
