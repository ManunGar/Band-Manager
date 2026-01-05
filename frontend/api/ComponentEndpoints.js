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

export default {
    getComponentDetails,
};