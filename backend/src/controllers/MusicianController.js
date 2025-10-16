import { Musician } from "../models/sequelize.js";

// Function to add instruments to a musician
const addInstrumentsToMusician = async (req, res) => {
    const instruments = req.body.instruments; // Array of instrument IDs with levels
    const musicianId = req.user.musician.id; // Get musician ID from authenticated user
    const transaction = await Musician.sequelize.transaction();
    try {
        const musician = await Musician.findByPk(musicianId, { transaction });
        for (const [instrumentId, level] of Object.entries(instruments)) {
            const instrumentIdNum = parseInt(instrumentId, 10);
            await musician.addInstrument(instrumentIdNum, { through: { level }, transaction });
        }
        await transaction.commit();
        res.status(200).send({ message: 'Instruments added successfully' }, instruments);
    } catch (error) {
        await transaction.rollback();
        console.error('Error adding instruments to musician:', error);
        res.status(500).send({ error: 'Error adding instruments to musician' });
    }
}

const MusicianController = {
    addInstrumentsToMusician,
};

export default MusicianController;