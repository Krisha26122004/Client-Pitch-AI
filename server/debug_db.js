import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import Pitch from "./models/Pitch.js";
import User from "./models/User.js";

const debugDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to Atlas.");
        
        const users = await User.find({});
        console.log("USERS IN DB:");
        users.forEach(u => console.log(` - ID: ${u._id}, Email: ${u.email}`));

        const pitches = await Pitch.find({});
        console.log("PITCHES IN DB:");
        pitches.forEach(p => console.log(` - Title: ${p.title}, UserID: ${p.userId}`));

        await mongoose.connection.close();
    } catch (error) {
        console.error("Error:", error.message);
    }
};

debugDB();
