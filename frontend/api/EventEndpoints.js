import axios from "axios";
import { handleError } from "./handleError.js";

const baseUrl = process.env.EXPO_PUBLIC_API_URL; // Adjust the base URL as needed

// Endpoint to list events
const listEvents = async (bandId, timeScope, type) => {
    try {
        const response = await axios.get(`${baseUrl}/events?bandId=${bandId}&timeScope=${timeScope}&type=${type}`);
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

// Endpoint to get event details
const getEventDetails = async (eventId) => {
    try {
        const response = await axios.get(`${baseUrl}/events/${eventId}`);
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

export default {
    listEvents,
    getEventDetails
}
