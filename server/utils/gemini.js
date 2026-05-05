import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY?.trim();
export const DEFAULT_GEMINI_MODEL = "gemini-2.0-flash-lite";
export const FREE_GEMINI_MODELS = [
    DEFAULT_GEMINI_MODEL,
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash",
    "gemini-2.5-flash",
];

const legacyModelAliases = {
    "gemini-1.5-flash": DEFAULT_GEMINI_MODEL,
    "models/gemini-1.5-flash": DEFAULT_GEMINI_MODEL,
};

const normalizeModelName = (modelName) => {
    const trimmed = modelName?.trim() || DEFAULT_GEMINI_MODEL;
    return legacyModelAliases[trimmed] || trimmed;
};

const defaultModel = normalizeModelName(process.env.GEMINI_MODEL);

if (!apiKey) {
    console.warn("Gemini API key is missing. Add GEMINI_API_KEY to server/.env.");
}

const genAI = new GoogleGenerativeAI(apiKey || "missing-key");

export const getAIModel = (modelName = defaultModel) => {
    return genAI.getGenerativeModel({ model: normalizeModelName(modelName) });
};

export const parseAIJSON = (text = "") => {
    const cleaned = text
        .trim()
        .replace(/^```(?:json)?/i, "")
        .replace(/```$/i, "")
        .trim();

    try {
        return JSON.parse(cleaned);
    } catch {
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("AI response did not include valid JSON");
        }
        return JSON.parse(jsonMatch[0]);
    }
};

export const generateJSON = async (prompt, modelName) => {
    try {
        const model = getAIModel(modelName);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        return parseAIJSON(text);
    } catch (error) {
        console.error("Gemini AI Error:", error);
        throw error;
    }
};
