import axios from "axios";
import API_BASE_URL from "../../config/api";

const API_URL = `${API_BASE_URL}/history`;

export const saveCalculation = async (data) => {
    return await axios.post(API_URL, data);
};

export const getRecentCalculations = async () => {
    const res = await axios.get(API_URL);
    return res.data;
};
