import axios from "axios";

const API_URL = "https://geosolver-backend-production.up.railway.app/api/history";

export const saveCalculation = async (data) => {
    return await axios.post(API_URL, data);
};

export const getRecentCalculations = async () => {
    const res = await axios.get(API_URL);
    return res.data;
};
