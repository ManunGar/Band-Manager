import axios from "axios";
import { handleError } from "./handleError.js";

const baseUrl = process.env.EXPO_PUBLIC_API_URL; // Adjust the base URL as needed

const isLocalFileUri = (value) => {
    return typeof value === 'string' && value.trim() !== '' && !/^https?:\/\//i.test(value);
};

const buildBandEditFormData = (bandData) => {
    const formData = new FormData();

    ['name', 'location', 'phone', 'type'].forEach((field) => {
        if (bandData[field] !== undefined && bandData[field] !== null) {
            formData.append(field, bandData[field]);
        }
    });

    if (bandData.delete_profile_picture !== undefined) {
        formData.append('delete_profile_picture', String(Boolean(bandData.delete_profile_picture)));
    }

    if (!bandData.delete_profile_picture && isLocalFileUri(bandData.profile_picture)) {
        formData.append('profile_picture', {
            uri: bandData.profile_picture,
            name: `band_${Date.now()}.jpg`,
            type: 'image/jpeg',
        });
    }

    return formData;
};

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
        const response = await axios.post(`${baseUrl}/bands`, bandData,
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

// Endpoint to edit band details
const editBand = async (bandId, bandData) => {
    try {
        const preparedData = buildBandEditFormData(bandData);
        const response = await axios.put(`${baseUrl}/bands/${bandId}`, preparedData,
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

// Endpoint to delete a band
const deleteBand = async (bandId) => {
    try {
        const response = await axios.delete(`${baseUrl}/bands/${bandId}`);
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
    deleteBand
};