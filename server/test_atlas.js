import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import User from "./models/User.js";

const testDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("SUCCESS: MongoDB Atlas Connection Established.");
        
        const users = await User.find({}, 'email');
        console.log(`DATA VERIFIED: Found ${users.length} users.`);
        users.forEach(u => console.log(` - ${u.email}`));
        
        await mongoose.connection.close();
    } catch (error) {
        console.error("FAILURE: Database error:", error.message);
    }
};

testDB();
