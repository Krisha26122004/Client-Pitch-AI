import API from "./axiosConfig";

const BASE_URL = "/api/pitches";
const AI_URL = "/api/ai";

export const getPitches = async (userId) => {
    const res = await API.get(`${BASE_URL}/${userId}`);
    return res.data;
};

export const savePitch = async (data) => {
    const res = await API.post(`${BASE_URL}/save`, data);
    return res.data;
};

export const generatePitchWithAI = async ({ form, isPro }) => {
    const res = await API.post(`${AI_URL}/generate-pitch`, { form, isPro });
    return res.data;
};

export const regeneratePitchWithAI = async ({ form, isPro, feedback }) => {
    const res = await API.post(`${AI_URL}/generate-pitch`, { form, isPro, feedback });
    return res.data;
};

export const suggestProjectDescriptions = async (form) => {
    const res = await API.post(`${AI_URL}/suggest-description`, { form });
    return res.data;
};

