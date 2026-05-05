import express from "express";
import { DEFAULT_GEMINI_MODEL, FREE_GEMINI_MODELS, getAIModel, parseAIJSON } from "../utils/gemini.js";

const router = express.Router();

const templateProfiles = {
    "Modern Business": {
        sections: ["Executive Summary", "ROI Analysis", "Implementation Timeline", "Risk Assessment"],
        guidance: "Use a polished corporate proposal style. Focus on business value, measurable ROI, implementation clarity, stakeholder confidence, and practical risk controls.",
    },
    "Creative Agnecy": {
        sections: ["Creative Vision", "Brand Strategy", "Visual Mockups", "Campaign Timeline"],
        guidance: "Use a creative agency proposal style. Focus on concept, brand voice, visual direction, campaign assets, collaboration, and launch momentum.",
    },
    "Creative Agency": {
        sections: ["Creative Vision", "Brand Strategy", "Visual Mockups", "Campaign Timeline"],
        guidance: "Use a creative agency proposal style. Focus on concept, brand voice, visual direction, campaign assets, collaboration, and launch momentum.",
    },
    "Technical Consulting": {
        sections: ["Technical Architecture", "Development Roadmap", "Security Framework", "Support Plan"],
        guidance: "Use a technical consulting proposal style. Focus on architecture, implementation phases, security, testing, deployment, maintainability, and support.",
    },
    "Investor Deck Pro": {
        sections: ["Market Opportunity", "Traction Proof", "Financial Upside", "Funding Ask"],
        guidance: "Use an investor pitch style. Focus on market opportunity, traction, positioning, growth potential, financial upside, and a confident next-step ask.",
    },
    "Enterprise Retainer": {
        sections: ["Service Level Agreement", "Monthly Roadmap", "Reporting Cadence", "ROI Targets"],
        guidance: "Use an enterprise retainer proposal style. Focus on recurring value, service levels, monthly deliverables, reporting cadence, accountability, and long-term partnership.",
    },
    "AI Automation Suite": {
        sections: ["Workflow Mapping", "AI Stack", "Integrations", "Success Metrics"],
        guidance: "Use an AI automation proposal style. Focus on workflow mapping, AI tooling, integrations, time savings, accuracy, monitoring, and measurable operational impact.",
    },
};

const defaultSections = ["Problem Statement", "Our Solution", "Value Proposition", "Project Timeline", "Project Cost Breakdown", "Expected Outcomes", "Why Choose Us?"];

const getTemplateProfile = (template = "") => templateProfiles[template] || {
    sections: defaultSections,
    guidance: "Match the pitch content closely to the selected template and project type.",
};

const fallbackSections = (form = {}) => {
    const profile = getTemplateProfile(form.template);
    const fallbackBodies = {
        "Executive Summary": `This proposal outlines a focused ${form.projectType || "project"} plan for ${form.company || form.clientName || "the client"}, aligned with ${form.businessGoal || form.pitchGoal || "the client's business goals"}.`,
        "ROI Analysis": `The work is designed to improve efficiency, audience response, and conversion quality while keeping the investment aligned with ${form.budget || "the approved budget"}.`,
        "Implementation Timeline": `Week 1-2: Discovery, research, and strategy planning\n\nWeek 3-4: Setup, content, and core production\n\nWeek 5-6: Execution, review, and improvements\n\nWeek 7-8: Optimization, reporting, and handover`,
        "Risk Assessment": "Key risks will be managed through clear milestones, review checkpoints, transparent communication, and practical contingency planning.",
        "Creative Vision": form.description || `A clear creative direction will shape the ${form.projectType || "project"} around the audience, brand voice, and desired market response.`,
        "Brand Strategy": `The strategy will position ${form.company || form.clientName || "the brand"} for ${form.audience || "the target audience"} with consistent messaging and visual intent.`,
        "Visual Mockups": "Visual concepts and presentation-ready mockups will translate the strategy into assets the client can review, refine, and approve.",
        "Campaign Timeline": `Week 1-2: Creative planning and audience research\n\nWeek 3-4: Asset production and brand setup\n\nWeek 5-6: Campaign execution and review\n\nWeek 7-8: Optimization, reporting, and handover`,
        "Technical Architecture": `The solution will use a clear technical structure for ${form.projectType || "the project"}, balancing scalability, reliability, and maintainability.`,
        "Development Roadmap": `Week 1-2: Discovery, requirements, architecture planning\nDeliverable: Technical scope and architecture plan\n\nWeek 3-4: Core development, feature setup, integration work\nDeliverable: Working core build\n\nWeek 5-6: Testing, review, fixes, and performance improvements\nDeliverable: Tested release candidate\n\nWeek 7-8: Deployment, handover, documentation, and support setup\nDeliverable: Live project with handover notes`,
        "Security Framework": "Security will be considered through access control, data protection, validation, testing, and safe deployment practices.",
        "Support Plan": "Post-launch support will include issue handling, documentation, improvement recommendations, and clear communication.",
        "Market Opportunity": `The opportunity centers on ${form.audience || "the target market"} and the client's ability to solve ${form.currentProblems || "a meaningful customer problem"}.`,
        "Traction Proof": "The pitch will highlight proof points, customer signals, product strengths, or early momentum that support investor confidence.",
        "Financial Upside": `The upside is tied to ${form.businessGoal || "growth"}, stronger positioning, and disciplined use of ${form.budget || "available funding"}.`,
        "Funding Ask": "The next-step ask will be direct, confident, and connected to the milestones the investment will unlock.",
        "Service Level Agreement": "The engagement will define response expectations, recurring deliverables, review points, and ownership for ongoing work.",
        "Monthly Roadmap": `Each month will include planned deliverables, priorities, reporting, and improvement work aligned with ${form.businessGoal || "the client's goals"}.`,
        "Reporting Cadence": "Progress will be shared through consistent updates, performance summaries, and clear recommendations.",
        "ROI Targets": "Targets will connect the retainer work to measurable business outcomes, efficiency gains, and conversion-ready assets.",
        "Workflow Mapping": `The automation plan will map current steps, bottlenecks, handoffs, and opportunities around ${form.currentProblems || "the client's workflow challenges"}.`,
        "AI Stack": "The recommended stack will focus on practical AI tools, reliability, security, and maintainable automation logic.",
        "Integrations": "Integrations will connect the needed systems so information moves cleanly between tools with less manual effort.",
        "Success Metrics": "Success will be measured through time saved, accuracy, adoption, throughput, and business impact.",
    };

    return profile.sections.map((title) => ({
        title,
        body: fallbackBodies[title] || `This section is tailored to ${form.template || "the selected template"} and the client's ${form.projectType || "project"} needs.`,
    }));
};

const buildFallbackPitch = (form = {}, reason = "AI quota is currently unavailable") => {
    const sections = fallbackSections(form);
    return {
        title: `${form.clientName || "Client"} Pitch`,
        content: sections.map((section) => `${section.title}\n${section.body}`).join("\n\n"),
        sections,
        aiAvailable: false,
        message: reason,
    };
};

const templateGuidance = (template = "", projectType = "") => {
    const label = `${template} ${projectType}`.toLowerCase();
    const profile = getTemplateProfile(template);

    if (template) {
        return `${profile.guidance} The user selected "${template}", so the response must follow only this template and use only these sections: ${profile.sections.join(", ")}.`;
    }

    if (label.includes("content writing") || label.includes("content")) {
        return "This is a content writing pitch. Focus on content strategy, SEO/readability, tone, article/blog/copy deliverables, revisions, editorial calendar, and audience engagement.";
    }
    if (label.includes("technical") || label.includes("software") || label.includes("website") || label.includes("development")) {
        return "This is a technical/software pitch. Focus on architecture, features, development phases, security, testing, deployment, and support.";
    }
    if (label.includes("creative") || label.includes("brand") || label.includes("design")) {
        return "This is a creative/branding pitch. Focus on concept, brand voice, visuals, campaign assets, creative direction, and launch plan.";
    }
    if (label.includes("investor")) {
        return "This is an investor-style pitch. Focus on market opportunity, traction, positioning, financial upside, and a confident funding or next-step ask.";
    }
    if (label.includes("retainer")) {
        return "This is a retainer pitch. Focus on ongoing monthly value, service levels, reporting cadence, predictable deliverables, and long-term partnership.";
    }
    if (label.includes("automation") || label.includes("ai")) {
        return "This is an AI automation pitch. Focus on workflow mapping, integrations, time savings, accuracy, monitoring, and measurable operational impact.";
    }
    return "Match the pitch content closely to the selected template and project type.";
};

const generateWithGemini = async ({ prompt, isPro = false, priorityMode = false, maxOutputTokens = 2048 }) => {
    const request = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
            temperature: isPro ? 0.8 : 0.6,
            topP: 0.95,
            topK: 40,
            maxOutputTokens,
            responseMimeType: "application/json",
        },
    };

    const requestedModel = isPro && priorityMode ? process.env.GEMINI_PRO_MODEL : process.env.GEMINI_MODEL;
    const modelCandidates = [...new Set([requestedModel, ...FREE_GEMINI_MODELS].filter(Boolean))];
    let lastModelError;

    for (const modelName of modelCandidates) {
        try {
            const result = await getAIModel(modelName).generateContent(request);
            const response = await result.response;
            return parseAIJSON(response.text());
        } catch (modelError) {
            lastModelError = modelError;
            const canTryNextModel =
                modelError.message?.includes("404 Not Found") ||
                modelError.message?.includes("not found") ||
                modelError.message?.includes("429 Too Many Requests") ||
                modelError.message?.toLowerCase().includes("quota");

            if (!canTryNextModel) {
                throw modelError;
            }

            console.warn(`Gemini model ${modelName || DEFAULT_GEMINI_MODEL} unavailable, trying next option.`);
        }
    }

    throw lastModelError || new Error("No Gemini model was available");
};

router.post("/generate-pitch", async (req, res) => {
    let safeForm = {};

    try {
        if (!process.env.GEMINI_API_KEY) {
            return res.status(200).json(buildFallbackPitch(
                safeForm,
                "Gemini API key is missing, so a structured fallback pitch was generated."
            ));
        }

        const { form = {}, isPro = false, feedback = "" } = req.body;
        safeForm = {
            clientName: form.clientName || "",
            projectType: form.projectType || "",
            budget: form.budget || "",
            timeline: form.timeline || "",
            description: form.description || "",
        audience: form.audience || "",
        company: form.company || "",
        businessGoal: form.businessGoal || "",
        currentProblems: form.currentProblems || "",
        preferredStyle: form.preferredStyle || "",
        priority: form.priority || "",
        requiredFeatures: Array.isArray(form.requiredFeatures) ? form.requiredFeatures : [],
        deliverables: Array.isArray(form.deliverables) ? form.deliverables : [],
        competitors: form.competitors || "",
        tone: form.tone || "Professional",
            template: form.template || "",
            pitchGoal: form.pitchGoal || "Win the client",
            outputFormat: form.outputFormat || "PDF",
            brandVoice: form.brandVoice || "",
            premiumSections: Array.isArray(form.premiumSections) ? form.premiumSections : [],
            priorityMode: Boolean(form.priorityMode),
        };

        const selectedProfile = getTemplateProfile(safeForm.template);
        const prompt = `
You are ClientPitch AI, a professional proposal-writing assistant.
Generate a polished client pitch from the data below.

Return ONLY valid JSON in this exact shape:
{
  "title": "short pitch title",
  "content": "full plain text pitch",
  "sections": [
    { "title": "section title", "body": "section body" }
  ]
}

Rules:
- Use clear, professional English.
- Make the proposal specific to the client, project, budget, timeline, audience, and tone.
- The selected template is "${safeForm.template || "Default Proposal"}".
- ${templateGuidance(safeForm.template, safeForm.projectType)}
- Use these section titles exactly, with no extra non-template sections:
  ${selectedProfile.sections.join(", ")}
- If Pro is true, include premium sections: ROI Plan, Risk Reversal, Pricing Options, Success Metrics, Call to Action.
- If feedback is provided, regenerate the pitch by applying that feedback while preserving the original client/project facts.
- Do not include markdown fences like \`\`\`json.
- Do not invent impossible guarantees.
- Value Proposition must include 5 to 6 concrete benefits, each on a separate line.
- Any timeline or roadmap section must be week-wise, not month-wise or paragraph-only.
- Use this exact timeline format:
  Week 1-2: short phase name
  Work: 2 to 3 concrete tasks for these weeks
  Deliverable: one concrete output

  Week 3-4: short phase name
  Work: 2 to 3 concrete tasks for these weeks
  Deliverable: one concrete output

  Week 5-6: short phase name
  Work: 2 to 3 concrete tasks for these weeks
  Deliverable: one concrete output

  Week 7-8: short phase name
  Work: 2 to 3 concrete tasks for these weeks
  Deliverable: one concrete output
- Separate each week phase with a blank line.

Project data:
${JSON.stringify({ ...safeForm, isPro, feedback }, null, 2)}
`;

        const generated = await generateWithGemini({
            prompt,
            isPro,
            priorityMode: safeForm.priorityMode,
            maxOutputTokens: 2048,
        });

        const sections = Array.isArray(generated.sections) && generated.sections.length
            ? generated.sections
            : fallbackSections(safeForm);
            
        const content = generated.content || sections.map((section) => `${section.title}\n${section.body}`).join("\n\n");

        res.json({
            title: generated.title || `${safeForm.clientName || "Client"} Pitch`,
            content,
            sections,
            aiAvailable: true,
        });
    } catch (error) {
        console.error("AI Generate Error:", error);

        return res.status(200).json(buildFallbackPitch(
            safeForm,
            error.message?.includes("quota")
                ? "Gemini quota is currently unavailable, so a structured fallback pitch was generated."
                : "AI generation is temporarily unavailable, so a structured fallback pitch was generated."
        ));
    }
});

router.post("/suggest-description", async (req, res) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({
                message: "Gemini API key is missing. Add GEMINI_API_KEY to server/.env.",
            });
        }

        const { form = {} } = req.body;
        const prompt = `
You are ClientPitch AI. Suggest 3 concise project descriptions for the user's pitch form.

Return ONLY valid JSON:
{
  "suggestions": ["description 1", "description 2", "description 3"]
}

Rules:
- Each suggestion should be 1 to 2 sentences.
- Make suggestions specific to the selected template and project type.
- ${templateGuidance(form.template, form.projectType)}
- Do not include markdown fences.

Project data:
${JSON.stringify(form, null, 2)}
`;

        const generated = await generateWithGemini({
            prompt,
            isPro: false,
            maxOutputTokens: 512,
        });

        res.json({
            suggestions: Array.isArray(generated.suggestions) ? generated.suggestions.slice(0, 3) : [],
            aiAvailable: true,
        });
    } catch (error) {
        console.error("AI Suggest Description Error:", error);
        res.status(200).json({
            aiAvailable: false,
            suggestions: [
                "Create a clear, conversion-focused deliverable tailored to the client's audience, timeline, and budget.",
                "Plan, produce, and refine the project with a professional process that keeps the client informed at every step.",
                "Deliver a polished final outcome that supports the client's goals and gives their audience a strong reason to respond.",
            ],
            message: "AI suggestions are temporarily unavailable, so fallback suggestions were provided.",
        });
    }
});

export default router;
