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

// Endpoint to edit band details
const editBand = async (bandId, bandData) => {
    try {
        const response = await axios.put(`${baseUrl}/bands/${bandId}`, bandData);
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

// Endpoint to join a band
const joinBand = async (bandId, data) => {
    try {
        const response = await axios.post(`${baseUrl}/bands/join/${bandId}`, data);
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

// Endpoint to update band profile picture
const editBandProfilePicture = async (bandId, formData) => {
    try {
        const response = await axios.put(`${baseUrl}/bands/${bandId}/edit/profile-picture`, formData, 
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                transformRequest: (data) => data,
            }
        );
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

// Endpoint to delete band profile picture
const deleteBandProfilePicture = async (bandId) => {
    try {
        const response = await axios.put(`${baseUrl}/bands/${bandId}/delete/profile-picture`);
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

export default {
    listMyBands,
    getBandDetails,
    createBand,
    findBandByCode,
    editBand,
    joinBand,
    editBandProfilePicture,
    deleteBandProfilePicture
};