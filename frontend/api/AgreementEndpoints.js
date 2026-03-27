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

export default {
    listAgreements
}