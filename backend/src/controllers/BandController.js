import { Band, Component } from "../models/sequelize.js";

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
        res.status(200).send({ bands });
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
            profile_picture: req.body.profile_picture || null,
            code: code
        }, { transaction });
        // Associate the logged-in musician as an administrator component of the band
        await Component.create({
            bandId: band.id,
            musicianId: req.user.musician.id,
            administrator: true
        }, { transaction });
        await transaction.commit();
        res.status(201).send({ band });
    } catch (error) {
        await transaction.rollback();
        console.error('Error creating band:', error);
        res.status(500).send({ error: 'Error creating band' });
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

const BandController = {
    listMyBands,
    createBand
};

export default BandController;