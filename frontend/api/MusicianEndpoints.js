import axios from 'axios';
import { handleError } from './handleError.js';

const baseUrl = process.env.EXPO_PUBLIC_API_URL; // Adjust the base URL as needed

// Endpoint to get musician account details
const accountDetails = async (musicianId) => {
    try {
        const response = await axios.get(`${baseUrl}/musicians/${musicianId}/profile`);
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

// Endpoint to add instruments to musician
const addInstrumentsToMusician = async (preparedData) => {
    try {
        const response = await axios.post(`${baseUrl}/musicians/instruments`, preparedData);
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

export default {
    accountDetails,
    addInstrumentsToMusician
};