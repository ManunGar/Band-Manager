import axios from "axios";
import { handleError } from "./handleError.js";

const baseUrl = process.env.EXPO_PUBLIC_API_URL; // Adjust the base URL as needed

// Endpoint to get component details by ID
const getComponentDetails = async (componentId) => {
    try {
        const response = await axios.get(`${baseUrl}/components/${componentId}`);
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

// Endpoint to update component instruments
const updateComponentInstruments = async (componentId, data) => {
    try {
        const response = await axios.put(`${baseUrl}/components/${componentId}`, data);
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

// Endpoint to promote a component by ID
const promoteComponent = async (componentId) => {
    try {
        const response = await axios.put(`${baseUrl}/components/${componentId}/promote`);
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

// Endpoint to leave a component by ID
const leaveComponent = async (componentId) => {
    try {
        const response = await axios.delete(`${baseUrl}/components/${componentId}/leave`);
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

export default {
    getComponentDetails,
    updateComponentInstruments,
    promoteComponent,
    leaveComponent
};