import { Component } from "../models/sequelize.js";

// Middleware to check if the musician is a member of the band
const isBandMember = async (req, res, next) => {
    const bandId = req.params.bandId;
    const musicianId = req.user.musician.id;
    try {
        const component = await Component.findOne({
            where: {
                bandId: bandId,
                musicianId: musicianId
            }
        });
        if (!component) {
            return res.status(403).send({ error: 'Access denied. You are not a member of this band.' });
        }
        next();
    } catch (error) {
        console.error('Error checking band membership:', error);
        res.status(500).send({ error: 'Error checking band membership' });
    }
};

// Middleware to check if the musician is not a member of the band
const isNotBandMember = async (req, res, next) => {
    const bandId = req.params.bandId;
    const musicianId = req.user.musician.id;
    try {
        const component = await Component.findOne({
            where: {
                bandId: bandId,
                musicianId: musicianId
            }
        });
        if (component) {
            return res.status(403).send({ error: 'Access denied. You are already a member of this band.' });
        }
        next();
    } catch (error) {
        console.error('Error checking band membership:', error);
        res.status(500).send({ error: 'Error checking band membership' });
    }
};

export { isBandMember, isNotBandMember };

