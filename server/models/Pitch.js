import mongoose from "mongoose";

const pitchSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    clientName: { type: String },
    company: { type: String, required: true },
    status: { type: String, default: "Draft" },
    projectType: { type: String },
    budget: { type: String },
    timeline: { type: String },
    description: { type: String },
    audience: { type: String },
    tone: { type: String },
    content: { type: String }, // The generated AI content
    template: { type: String },
    pitchGoal: { type: String },
    outputFormat: { type: String },
    brandVoice: { type: String },
    premiumSections: [{ type: String }],
    priorityMode: { type: Boolean, default: false },
    sections: [{
        title: String,
        body: String,
    }],
    created: { type: String, default: () => new Date().toISOString().split('T')[0] },
    updated: { type: String, default: () => new Date().toISOString().split('T')[0] },

    isPinned: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },

    shareId: String,
    isPublic: { type: Boolean, default: false },

    views: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    lastAction: { type: String, default: "Created" },

    createdAt: { type: Date, default: Date.now }
});

const Pitch = mongoose.model("Pitch", pitchSchema);
export default Pitch;
