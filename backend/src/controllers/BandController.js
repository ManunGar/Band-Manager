import { Band, Component } from "../models/sequelize.js";

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

const BandController = {
    listMyBands
};

export default BandController;