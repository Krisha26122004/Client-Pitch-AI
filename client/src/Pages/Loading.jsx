import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { CheckCircle } from "lucide-react";
import axios from "axios";
import { generatePitchWithAI } from "../api/pitch";
import InlineMessage from "../components/InlineMessage";

export default function Loading() {
    const navigate = useNavigate();
    const location = useLocation();
    const { form, existingPitch } = location.state || {};
    const userId = sessionStorage.getItem("userId");
    const hasGenerated = useRef(false);
    const isProGeneration = location.state?.isPro || sessionStorage.getItem("plan") === "pro";

    const steps = [
        {
            title: "Analyzing client details...",
            desc: "Understanding client requirements",
        },
        {
            title: "Understanding the project scope...",
            desc: "Reviewing budget & timeline",
        },
        {
            title: "Crafting personalized pitch...",
            desc: "Writing engaging content",
        },
        {
            title: "Finalizing your pitch...",
            desc: "Polishing the perfect proposal",
        },
    ];

    const [currentStep, setCurrentStep] = useState(0);
    const [message, setMessage] = useState("");

    const buildPitchSections = (pitchForm = {}) => {
        const project = pitchForm.projectType || "your project";
        const goal = pitchForm.businessGoal || pitchForm.pitchGoal || "Build online presence";
        const problems = pitchForm.currentProblems || "Low visibility, weak brand positioning, and missed conversion opportunities.";
        const features = pitchForm.requiredFeatures?.length ? pitchForm.requiredFeatures : ["Responsive Design", "SEO", "Analytics"];
        const deliverables = pitchForm.deliverables?.length ? pitchForm.deliverables : ["PDF Proposal", "Website", "Marketing Plan"];
        const premiumSections = pitchForm.premiumSections || [];

        const baseSections = [
            {
                title: "Problem Statement",
                body: `${problems}\n\nWithout a focused ${project} strategy, the business can miss opportunities to grow, connect with the right audience, and convert interest into action.`,
            },
            {
                title: "Our Solution",
                body: `We will create a ${pitchForm.preferredStyle || "Professional"} ${project} plan focused on ${goal}.\n\nKey focus areas:\n${features.map((item) => `• ${item}`).join("\n")}\n\nThis approach gives ${pitchForm.company || pitchForm.clientName || "the client"} a clear, measurable path from problem to result.`,
            },
            {
                title: "Value Proposition",
                body: `• Tailored strategy for ${pitchForm.audience || "the target audience"}\n• Stronger brand visibility and engagement\n• Better lead quality and conversion potential\n• Transparent reporting and communication\n• Cost-effective execution with maximum ROI`,
            },
            {
                title: `Project Timeline (${pitchForm.timeline || "4 Weeks"})`,
                body: `Phase 1: Research & Strategy\nDeliverable: ${deliverables[0] || "Strategy Plan"}\n\nPhase 2: Planning & Setup\nDeliverable: ${deliverables[1] || "Implementation Plan"}\n\nPhase 3: Execution\nDeliverable: ${deliverables[2] || "Campaign / Build"}\n\nPhase 4: Optimization & Handover\nDeliverable: Final report and support plan`,
            },
            {
                title: "Project Cost Breakdown",
                body: `Strategy & Planning: 25%\nDesign / Content / Setup: 30%\nExecution: 30%\nOptimization & Reporting: 15%\n\nTotal Project Cost: ${pitchForm.budget || "Custom Quote"}`,
            },
            {
                title: "Expected Outcomes",
                body: `• ${goal}\n• Improved audience engagement\n• Stronger digital presence\n• Better conversion rates\n• Sustainable business growth`,
            },
            {
                title: "Why Choose Us?",
                body: `• Professional and experienced team\n• Client-focused approach\n• Creative and result-driven strategy\n• ${pitchForm.priority || "Balanced"} execution priority\n• Continuous support and communication`,
            },
        ];

        const proCopy = {
            "ROI Plan": "This plan is designed to connect delivery work with measurable return, including saved time, clearer positioning, and stronger client conversion.",
            "Risk Reversal": "To reduce risk, the proposal can include milestone reviews, transparent reporting, and clear approval points before each major phase.",
            "Pricing Options": "The investment can be structured as a focused starter scope, a standard delivery package, or a premium end-to-end engagement.",
            "Success Metrics": "Success can be tracked through delivery speed, quality of output, engagement, share activity, and conversion-ready presentation quality.",
        };

        const addedPremiumSections = premiumSections
            .filter((section) => proCopy[section])
            .map((section) => ({ title: section, body: proCopy[section] }));

        return [...baseSections.slice(0, 3), ...addedPremiumSections, ...baseSections.slice(3)];
    };


    useEffect(() => {
        const stepInterval = setInterval(() => {
            setCurrentStep((prev) => {
                if (prev >= steps.length - 1) {
                    clearInterval(stepInterval);
                    return prev;
                }
                return prev + 1;
            });
        }, 1000);

        const generatePitch = async () => {
            if (hasGenerated.current) return;
            hasGenerated.current = true;

            // Debugging logs to see state
            console.log("Generating pitch for User ID:", userId);

            if (!userId) {
                setMessage("Please log in first to save your pitch.");
                navigate("/login");
                return;
            }

            try {
                const aiPitch = await generatePitchWithAI({
                    form,
                    isPro: isProGeneration,
                });
                const endpoint = existingPitch
                    ? `/api/pitches/update/${existingPitch._id}`
                    : "/api/pitches/create";
                const method = existingPitch ? "put" : "post";
                const fallbackSections = buildPitchSections(form);
                const sections = aiPitch.sections?.length ? aiPitch.sections : fallbackSections;

                const payload = {
                    ...form,
                    userId,
                    title: form?.title || aiPitch.title || `${form?.clientName || "New"} Pitch`,
                    content: aiPitch.content || sections.map((section) => `${section.title}\n${section.body}`).join("\n\n"),
                    sections,
                };

                const response = await axios[method](endpoint, payload);
                const generatedPitch = response.data;

                // Wait at least 3 seconds to show the animation
                setTimeout(() => {
                    navigate("/result", {
                        state: { form, pitch: generatedPitch.pitch || generatedPitch }
                    });
                }, 3000);

            } catch (err) {
                console.error("Error saving pitch:", err);
                const errorMsg = err.response?.data?.message || "Error during pitch generation.";
                setMessage(errorMsg);
                navigate("/create");
            }
        };

        generatePitch();

        return () => clearInterval(stepInterval);
    }, [navigate, steps.length, form, existingPitch, userId, isProGeneration]);

    const progress = Math.min(((currentStep + 1) / steps.length) * 100, 100);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 w-full max-w-md border dark:border-gray-700">
                {/*Title*/}
                <div className="text-center mb-10">
                    <h2 className="text-2xl font-black text-blue-900 dark:text-blue-400">
                        ✨ Generating Pitch
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">
                        Our AI is crafting the perfect proposal...
                    </p>
                </div>

                <InlineMessage className="mb-6">{message}</InlineMessage>

                {/* Loading Spinner & Steps */}
                <div className="space-y-8 mb-10">
                    <div className="flex justify-center mb-8">
                        <div className="w-12 h-12 rounded-full border-4 border-blue-100 dark:border-blue-900 border-t-blue-600 animate-spin"></div>
                    </div>

                    <div className="space-y-6">
                        {steps.map((step, index) => (
                            <div key={index} className="flex items-start gap-4 transition-all duration-500">
                                <div className="mt-1">
                                    {index < currentStep ? (
                                        <CheckCircle size={18} className="text-green-500" />
                                    ) : index === currentStep ? (
                                        <div className="w-4 h-4 rounded-full bg-blue-600 animate-pulse shadow-[0_0_10px_rgba(37,99,235,0.5)]"></div>
                                    ) : (
                                        <div className="w-4 h-4 rounded-full border-2 border-gray-200 dark:border-gray-700"></div>
                                    )}
                                </div>

                                <div className={index > currentStep ? "opacity-30" : "opacity-100"}>
                                    <p className={`text-sm font-bold ${index === currentStep ? "text-blue-600" : "text-gray-700 dark:text-gray-200"}`}>
                                        {step.title}
                                    </p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

{/*Progress Bar Wrapper*/}
                <div className="space-y-4">
                    <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>

                    <div className="text-center text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 py-3 rounded-xl border border-blue-100 dark:border-blue-800">
                        ✨ This usually takes 10-15 seconds...
                    </div>
                </div>

{/*Cancel Button*/}
                <div className="flex justify-center mt-8">
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="px-6 py-2.5 text-sm font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    >
                        Cancel Generation
                    </button>
                </div>

                {/*Footer*/}
                <div className="text-center mt-4 text-[10px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-widest">
                    🔒 Secure AI Processing
                </div>
            </div>
        </div>
    );
}
