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

export default {
    listMyBands
};