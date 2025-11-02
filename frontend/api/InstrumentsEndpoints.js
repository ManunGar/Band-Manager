import axios from 'axios';
import { handleError } from './handleError.js';

const baseUrl = process.env.EXPO_PUBLIC_API_URL; // Adjust the base URL as needed

// Endpoint to get all instruments
const getAllInstruments = async () => {
    try {
        const response = await axios.get(`${baseUrl}/instruments`);
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

export default {
    getAllInstruments
};