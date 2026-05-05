import express from "express";
import { getAnalytics } from "../controllers/analyticsControllers.js";

const router = express.Router();


router.get("/analytics-data/:userId", getAnalytics);

export default router;