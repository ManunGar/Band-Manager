import axios from "axios";
import { handleError } from "./handleError.js";

const baseUrl = process.env.EXPO_PUBLIC_API_URL; // Adjust the base URL as needed

// Endpoint to list my bands
const listMyBands = async () => {
    try {
        const response = await axios.get(`${baseUrl}/bands/mine`);
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

// Endpoint to get band details by ID
const getBandDetails = async (bandId) => {
    try {
        const response = await axios.get(`${baseUrl}/bands/${bandId}`);
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

// Endpoint to create a new band
const createBand = async (bandData) => {
    try {
        const response = await axios.post(`${baseUrl}/bands`, bandData);
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

// Endpoint to find a band by code
const findBandByCode = async (code) => {
    try {
        const response = await axios.get(`${baseUrl}/bands/code/${code}`);
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

export default {
    listMyBands,
    getBandDetails,
    createBand,
    findBandByCode
};