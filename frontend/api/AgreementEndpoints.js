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

// Endpoint to list applications of the authenticated musician
const listMyApplications = async (search, startDate, endDate) => {
    try {
        const response = await axios.get(`${baseUrl}/applications/me`, {
            params: { search, startDate, endDate }
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

// Endpoint to invite a musician to an agreement (band_invite)
const inviteMusician = async (agreementId, musicianId) => {
    try {
        const response = await axios.post(`${baseUrl}/agreements/${agreementId}/invite`, { musicianId });
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

// Endpoint for a musician to accept or reject a band_invite
const respondToInvite = async (applicationId, status) => {
    try {
        const response = await axios.put(`${baseUrl}/applications/${applicationId}/respond`, { status });
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

// Endpoint to list future performances where the authenticated musician is a band admin (no agreements yet)
const listAdminPerformances = async () => {
    try {
        const response = await axios.get(`${baseUrl}/performances/admin`);
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

// Endpoint to create a new agreement
const createAgreement = async (performanceId, instrumentId, amount, payment, description) => {
    try {
        const response = await axios.post(`${baseUrl}/agreements`, {
            performanceId,
            instrumentId,
            amount,
            payment,
            description,
        });
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

export default {
    listAgreements,
    listMyAgreements,
    listMyApplications,
    getAgreement,
    applyToAgreement,
    updateApplicationStatus,
    inviteMusician,
    respondToInvite,
    listAdminPerformances,
    createAgreement,
}