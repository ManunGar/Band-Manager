import axios from "axios";
import { handleError } from "./handleError.js";

const baseUrl = process.env.EXPO_PUBLIC_API_URL; // Adjust the base URL as needed

// Endpoint to list agreements
const listAgreements = async (instrumentId, search, offset, limit, startDate, endDate) => {
    try {
        const response = await axios.get(`${baseUrl}/agreements`, {
            params: {
                instrumentId,
                search,
                offset,
                limit,
                startDate,
                endDate
            }
        });
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

// Endpoint to list agreements created by authenticated musician
const listMyAgreements = async (instrumentId, search, startDate, endDate) => {
    try {
        const response = await axios.get(`${baseUrl}/agreements/me`, {
            params: {
                instrumentId,
                search,
                startDate,
                endDate,
            }
        });
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

// Endpoint to get a single agreement by ID
const getAgreement = async (agreementId) => {
    try {
        const response = await axios.get(`${baseUrl}/agreements/${agreementId}`);
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

// Endpoint to apply to an agreement
const applyToAgreement = async (agreementId) => {
    try {
        const response = await axios.post(`${baseUrl}/agreements/${agreementId}/apply`);
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

// Endpoint to accept or reject an application for an agreement (owner only)
const updateApplicationStatus = async (agreementId, applicationId, status) => {
    try {
        const response = await axios.put(`${baseUrl}/agreements/${agreementId}/applications/${applicationId}`, {
            status,
        });
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

export default {
    listAgreements,
    listMyAgreements,
    getAgreement,
    applyToAgreement,
    updateApplicationStatus,
}