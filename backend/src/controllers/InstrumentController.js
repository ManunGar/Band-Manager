import { Instrument } from "../models/sequelize.js";

// Function to list all instruments
const listInstruments = async (req, res) => {
    try {
        const instruments = await Instrument.findAll();
        return res.status(200).send(instruments);
    } catch (error) {
        console.error('Error in listInstruments:', error);
        return res.status(500).send({ error: 'Error fetching instruments' });
    }
}

const InstrumentController = {
    listInstruments
};

export default InstrumentController;