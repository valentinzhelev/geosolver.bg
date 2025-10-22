import axios from "axios";

const API_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/history`;

export const saveCalculation = async (data) => {
    return await axios.post(API_URL, data);
};

export const getRecentCalculations = async () => {
    const res = await axios.get(API_URL);
    return res.data;
};
