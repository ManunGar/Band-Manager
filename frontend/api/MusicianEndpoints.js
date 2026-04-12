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

// Endpoint to get musician profile by ID
const getMusicianProfile = async (musicianId) => {
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

// Endpoint to list visible musicians
const listMusicians = async (instrumentId, search, offset = 0, limit = 10) => {
    try {
        const response = await axios.get(`${baseUrl}/musicians`, {
            params: {
                instrument: instrumentId,
                search,
                offset,
                limit
            }
        });
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

// Endpoint to list contracts where a musician has participated
const listMusicianContracts = async (musicianId, instrumentId, offset = 0, limit = 10) => {
    try {
        const response = await axios.get(`${baseUrl}/musicians/${musicianId}/contracts`, {
            params: {
                instrument: instrumentId,
                offset,
                limit
            }
        });
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

// Endpoint to update the authenticated musician profile visibility
const updateVisibility = async (isProfilePrivate) => {
    try {
        const response = await axios.put(`${baseUrl}/musicians/account/visibility`, {
            isProfilePrivate,
        });
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

export default {
    accountDetails,
    getMusicianProfile,
    addInstrumentsToMusician,
    listMusicians,
    listMusicianContracts,
    updateVisibility
};