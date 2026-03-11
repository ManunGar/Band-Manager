import axios from 'axios';
import { handleError } from './handleError.js';

const baseUrl = process.env.EXPO_PUBLIC_API_URL; // Adjust the base URL as needed

// Endpoint for musician login
const loginMusician = async credential => {
    try {
        const response = await axios.post(`${baseUrl}/login/musician`, credential);
        return response.data
    } catch (error) {
        handleError(error)
    }
}

// Endpoint for musician registration
const registerMusician = async (preparedData) => {
    try {
        const response = await axios.post(`${baseUrl}/register/musician`, preparedData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                transformRequest: (data) => data,
            });
        return response.data
    } catch (error) {
        handleError(error)
    }
}

// Endpoint to edit musician details
const editMusician = async (preparedData) => {
    try {
        const response = await axios.put(`${baseUrl}/user/edit`, preparedData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                transformRequest: (data) => data,
            });
        return response.data
    } catch (error) {
        handleError(error)
    }
}

// Endpoint to edit profile picture
const editProfilePicture = async (preparedData) => {
    try {
        const response = await axios.put(`${baseUrl}/user/edit/profile-picture`, preparedData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                transformRequest: (data) => data,
            }
        );
        return response.data
    } catch (error) {
        handleError(error)
    }
}

// Endpoint to delete profile picture
const deleteProfilePicture = async () => {
    try {
        const response = await axios.put(`${baseUrl}/user/delete/profile-picture`);
        return response.data
    } catch (error) {
        handleError(error)
    }
}

// Endpoint to validate provider token
const isTokenValid = async (preparedData) => {
    try {
        const response = await axios.post(`${baseUrl}/validate/provider-token`, preparedData)
        return response.data
    } catch (error) {
        handleError(error)
    }
}

export default {
    loginMusician,
    registerMusician,
    isTokenValid,
    editMusician,
    editProfilePicture,
    deleteProfilePicture
};