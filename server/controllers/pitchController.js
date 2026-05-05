import Pitch from "../models/Pitch.js";

export const savePitch = async (req, res) => {
    try {
        const { title, problem, solution, targetAudience, generatedPitch } = req.body;

        const newPitch = new Pitch({
            title,
            problem,
            solution,
            targetAudience,
            generatedPitch,
        });

        const savedPitch = await newPitch.save();

        res.status(201).json({
            success: true,
            data: savedPitch,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};