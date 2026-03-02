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

// Endpoint to take component attendance
const takeComponentAttendance = async (eventId, data) => {
    try {
        const response = await axios.put(`${baseUrl}/events/${eventId}/component-attendance`, data);
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

// Endpoint to create an event
const createEvent = async (bandId, data) => {
    try {
        const response = await axios.post(`${baseUrl}/bands/${bandId}/events`, data,
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

const editEvent = async (eventId, data) => {
    try {
        const response = await axios.put(`${baseUrl}/events/${eventId}`, data,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                transformRequest: (data) => data,
            }
        )
    } catch (error) {
        handleError(error)
    }
}

const deleteEvent = async (eventId) => {
    try {
        const response = await axios.delete(`${baseUrl}/events/${eventId}`);
        return response.data;
    } catch (error) {
        handleError(error)
    }
}

export default {
    listEvents,
    getEventDetails,
    takeComponentAttendance,
    createEvent,
    editEvent,
    deleteEvent
}
