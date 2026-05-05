import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import User from "./models/User.js";

const resetDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to Atlas.");
        
        const result = await User.deleteMany({});
        console.log(`CLEANED: Deleted ${result.deletedCount} users from the database.`);
        
        await mongoose.connection.close();
        console.log("Database is now empty and ready for fresh Signups.");
    } catch (error) {
        console.error("Error:", error.message);
    }
};

resetDB();
