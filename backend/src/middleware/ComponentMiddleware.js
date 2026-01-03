import { Component } from "../models/sequelize.js";

// Middleware to check if the component is in the same band as me
const isInTheSameBand = async (req, res, next) => {
    const componentId = req.params.componentId;
    const musicianId = req.user.musician.id;
    try {
        const component = await Component.findByPk(componentId);
        const myComponents = await Component.findAll({
            where: {
                musicianId: musicianId
            }
        });
        if (!component || myComponents.length === 0) {
            return res.status(404).send({ error: 'Component not found.' });
        }
        const isInSameBand = myComponents.some(myComponent => myComponent.bandId === component.bandId);
        if (!isInSameBand) {
            return res.status(403).send({ error: 'Access denied. You are not in the same band as this component.' });
        }
        next();
    } catch (error) {
        console.error('Error checking component band membership:', error);
        res.status(500).send({ error: 'Error checking component band membership' });
    }
};

// Middleware to check if the user is the owner of the component or an admin in the same band
const isMeOrAdmin = async (req, res, next) => {
    const componentId = req.params.componentId;
    const musicianId = req.user.musician.id;
    try {
        const component = await Component.findByPk(componentId);
        if (!component) {
            return res.status(404).send({ error: 'Component not found.' });
        }
        if (component.musicianId !== musicianId) {
            // Check if the user is an admin in the same band
            const adminComponent = await Component.findOne({
                where: {
                    bandId: component.bandId,
                    musicianId: musicianId,
                    administrator: true
                }
            });
            if (!adminComponent) {
                return res.status(403).send({ error: 'Access denied. You are neither the owner nor an admin of this component.' });
            }
        }
        next();
    } catch (error) {
        console.error('Error checking component ownership or admin status:', error);
        res.status(500).send({ error: 'Error checking component ownership or admin status' });
    }
};

// Middleware to check if the user is an admin in the same band
const isAdminInSameBand = async (req, res, next) => {
    const componentId = req.params.componentId;
    const musicianId = req.user.musician.id;
    try {
        const component = await Component.findByPk(componentId);    
        if (!component) {
            return res.status(404).send({ error: 'Component not found.' });
        }
        const adminComponent = await Component.findOne({
            where: {
                bandId: component.bandId,
                musicianId: musicianId,
                administrator: true
            }
        });
        if (!adminComponent) {
            return res.status(403).send({ error: 'Access denied. You are not an admin in the same band as this component.' });
        }
        next();
    } catch (error) {
        console.error('Error checking admin status in the same band:', error);
        res.status(500).send({ error: 'Error checking admin status in the same band' });
    }
};

export { isAdminInSameBand, isInTheSameBand, isMeOrAdmin };
