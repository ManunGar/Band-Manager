import { Band, Component, Instrument, Musician, User } from "../models/sequelize.js";

// Function to get account details of the logged-in musician
const accountDetails = async (req, res) => {
    const user = req.user;
    try {
        // Fetch user details
        const userDetails = await User.findByPk(user.id, {
            attributes: { exclude: ['password'] },
            include: [
                {
                    model: Musician,
                    as: 'musician',
                    include: [
                        { model: Instrument, as: 'instruments' },
                        { model: Component, as: 'components', include: [{ model: Band, as: 'band' }] }
                    ]
                }
            ]
        });
        if (!userDetails) {
            return res.status(404).send({ error: 'User not found' });
        }
        return res.status(200).send({ musician: userDetails });
    } catch (error) {
        console.error('Error in accountDetails:', error);
        return res.status(500).send({ error: 'Error fetching account details' });
    }
};

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
    accountDetails
};

export default MusicianController;