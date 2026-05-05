import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Crown, FileText, Gauge, Lock, Sparkles } from "lucide-react";
import { suggestProjectDescriptions } from "../api/pitch";
import InlineMessage from "../components/InlineMessage";


export default function Create() {
    const navigate = useNavigate();
    const location = useLocation();
    const [step, setStep] = useState(1);
    const [limitError, setLimitError] = useState("");
    const [formMessage, setFormMessage] = useState("");
    const [remaining, setRemaining] = useState(null);
    const [plan, setPlan] = useState("free");
    const existingPitch = location.state?.pitch;
    const selectedTemplate = location.state?.template;
    const [isPro, setIsPro] = useState(sessionStorage.getItem("plan") === "pro");

    const [form, setForm] = useState({
        clientName: existingPitch?.clientName || "",
        company: existingPitch?.company || "",
        industry: existingPitch?.industry || "",
        projectType: existingPitch?.projectType || "",
        budget: existingPitch?.budget || "",
        timeline: existingPitch?.timeline || "",
        description: existingPitch?.description || "",
        businessGoal: existingPitch?.businessGoal || "",
        currentProblems: existingPitch?.currentProblems || "",
        audience: existingPitch?.audience || "",
        preferredStyle: existingPitch?.preferredStyle || "Professional",
        competitors: existingPitch?.competitors || "",
        priority: existingPitch?.priority || "Balanced",
        requiredFeatures: existingPitch?.requiredFeatures || [],
        deliverables: existingPitch?.deliverables || [],
        tone: existingPitch?.tone || "",
        title: existingPitch?.title || "",
        template: selectedTemplate || existingPitch?.template || "",
        pitchGoal: existingPitch?.pitchGoal || "Win the client",
        outputFormat: existingPitch?.outputFormat || "PDF",
        brandVoice: existingPitch?.brandVoice || "Premium and confident",
        priorityMode: existingPitch?.priorityMode || false,
        premiumSections: existingPitch?.premiumSections || ["ROI Plan", "Timeline", "Call to Action"],
    });

    const [loading, setLoading] = useState(false);
    const [suggesting, setSuggesting] = useState(false);
    const [descriptionSuggestions, setDescriptionSuggestions] = useState([]);

    useEffect(() => {
        const userId = sessionStorage.getItem("userId");
        if (!userId) return;

        fetch(`/api/user-status/${userId}`)
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (data?.plan === "pro") {
                    sessionStorage.setItem("plan", "pro");
                    setIsPro(true);
                }
                if (data) {
                    setPlan(data.plan || "free");
                    setRemaining(data.remaining);
                }
            })
            .catch(() => {});
    }, []);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [step]);

    const handleChange = (e) => {
        const { name, type, checked, value } = e.target;
        setForm({ ...form, [name]: type === "checkbox" ? checked : value });
    };

    const toggleListValue = (name, value) => {
        setForm((prev) => ({
            ...prev,
            [name]: prev[name].includes(value)
                ? prev[name].filter((item) => item !== value)
                : [...prev[name], value],
        }));
    };

    const togglePremiumSection = (section) => {
        if (!isPro) {
            navigate("/payment", { state: { from: location.pathname } });
            return;
        }

        setForm((prev) => ({
            ...prev,
            premiumSections: prev.premiumSections.includes(section)
                ? prev.premiumSections.filter((item) => item !== section)
                : [...prev.premiumSections, section],
        }));
    };

    const handleSuggestDescription = async () => {
        setSuggesting(true);
        try {
            const data = await suggestProjectDescriptions(form);
            setDescriptionSuggestions(data.suggestions || []);
        } catch (error) {
            console.error("Description suggestion error:", error);
            setDescriptionSuggestions([
                "Create a clear, conversion-focused deliverable tailored to the client's audience, timeline, and budget.",
                "Plan, produce, and refine the project with a professional process that keeps the client informed at every step.",
                "Deliver a polished final outcome that supports the client's goals and gives their audience a strong reason to respond.",
            ]);
        } finally {
            setSuggesting(false);
        }
    };

    const [error, setError] = useState({});
    const validateStep = () => {
        let newErrors = {};

        if (step === 1) {
            if (!form.clientName) newErrors.clientName = "Client name is required";
            if (!form.projectType) newErrors.projectType = "Project type is required";
        }

        if (step === 3) {
            if (!form.description) newErrors.description = "Description is required";
        }

        setError(newErrors);

        return Object.keys(newErrors).length === 0;
    }

    const handleGenerate = async () => {
        if (!validateStep()) return;

        const userId = sessionStorage.getItem("userId");
        if (!userId) {
            setFormMessage("Please login first.");
            navigate("/login");
            return;
        }

        setLoading(true);
        setLimitError("");

        // Just navigate to loading — Loading.jsx will handle the API call
        navigate("/loading", {
            state: { form, existingPitch, isPro }
        });

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4 transition-colors duration-300">
            <div className="bg-white dark:bg-gray-800 w-full max-w-3xl rounded-2xl shadow-xl p-8 border dark:border-gray-700">
                {/*logo*/}
                <div className="flex items-center gap-2 cursor-pointer mb-6">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-800 flex items-center justify-center shadow-lg">
                        <svg
                            className="w-5 h-5 text-white"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                        >
                            <path d="M4 4h16v12H7l-3 3V4z" />
                        </svg>
                    </div>

                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                        ClientPitch <span className="text-blue-700 dark:text-blue-400">AI</span>
                    </h1>
                </div>

                {/*Header */}
                <h1 className="text-3xl font-extrabold text-blue-900 dark:text-blue-400 text-center">Create New Pitch</h1>
                <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-2 mb-8">
                    Fill in the details below to generate a personalized client pitch
                </p>

                <InlineMessage className="mb-6">{formMessage}</InlineMessage>

                <div className={`mb-8 rounded-2xl border p-5 ${isPro
                    ? "bg-gradient-to-br from-indigo-600 to-blue-700 text-white border-indigo-400 shadow-xl shadow-blue-500/20"
                    : "bg-gray-50 dark:bg-gray-900/40 border-gray-200 dark:border-gray-700"
                    }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${isPro ? "bg-white/20" : "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600"}`}>
                                {isPro ? <Crown size={22} className="text-yellow-300" /> : <Lock size={22} />}
                            </div>
                            <div>
                                <h2 className={`font-black ${isPro ? "text-white" : "text-gray-900 dark:text-white"}`}>
                                    {isPro ? "Pro Pitch Builder Active" : "Pro Pitch Builder"}
                                </h2>
                                <p className={`text-sm ${isPro ? "text-indigo-100" : "text-gray-500 dark:text-gray-400"}`}>
                                    {isPro ? "Premium templates, advanced tone, export-ready structure, and priority generation." : "Unlock advanced controls, premium sections, PDF/DOCX format, and no daily limits."}
                                </p>
                            </div>
                        </div>
                        {!isPro && (
                            <button
                                onClick={() => navigate("/payment", { state: { from: location.pathname } })}
                                className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-black text-sm shadow-lg hover:bg-indigo-700 transition"
                            >
                                Upgrade to Pro
                            </button>
                        )}
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-10 relative">

                    {/* Line Background */}
                    <div className="absolute top-4 left-0 w-full h-1 bg-blue-200 rounded"></div>

                    {/* Active Line */}
                    <div
                        className="absolute top-4 left-0 h-1 bg-blue-600 rounded transition-all duration-500"
                        style={{ width: `${((step - 1) / 3) * 100}%` }}
                    ></div>

                    {/* Steps */}
                    <div className="flex justify-between relative">
                        {["Client Details", "Project Details", "Features", "Budget & Timeline"].map(
                            (label, i) => (
                                <div key={i} className="flex flex-col items-center w-full">

                                    {/* Circle */}
                                    <div
                                        className={`w-8 h-8 flex items-center justify-center rounded-full border-2 text-sm font-semibold transition
                        ${step > i + 1
                                                ? "bg-blue-600 text-white border-blue-600"
                                                : step === i + 1
                                                    ? " text-white bg-blue-600"
                                                    : "border-gray-300 text-gray-400 bg-white"
                                            }`}
                                    >
                                        {i + 1}
                                    </div>

                                    {/* Label */}
                                    <span
                                        className={`text-xs sm:text-sm mt-2 text-center ${step >= i + 1
                                            ? "text-blue-600 font-medium"
                                            : "text-gray-400"
                                            }`}
                                    >
                                        {label}
                                    </span>
                                </div>
                            )
                        )}
                    </div>

                    {/* Step Text */}
                    <p className="text-center text-xs text-gray-400 mt-6">
                        Step {step} of 4
                    </p>
                </div>

                {/*step 1*/}
                {step === 1 && (
                    <div className="bg-white dark:bg-gray-800 dark:text-white rounded-xl shadow-sm border p-5 sm:p-6 mt-6">

                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 flex items-center justify-center bg-blue-100 text-blue-600 rounded-lg">
                                👤
                            </div>
                            <div>
                                <h2 className="text-base sm:text-lg font-semibold">Client Details</h2>
                                <p className="text-xs text-gray-500">Tell us about your client</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Client Name *</label>
                                <input
                                    name="clientName"
                                    value={form.clientName}
                                    placeholder="e.g. John Smith"
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white mt-3"
                                />
                                {error.clientName && <p className="text-red-500 text-xs mt-1">{error.clientName}</p>}
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Company Name</label>
                                    <input
                                        name="company"
                                        value={form.company}
                                        placeholder="e.g. Bright Studio"
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white mt-3"
                                    />
                                    {error.company && <p className="text-red-500 text-xs mt-1">{error.company}</p>}
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Industry</label>
                                    <input
                                        name="industry"
                                        value={form.industry}
                                        placeholder="e.g. Real Estate, SaaS, Retail"
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white mt-3"
                                    />
                                    {error.industry && <p className="text-red-500 text-xs mt-1">{error.industry}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700">Project Type *</label>
                                <input
                                    name="projectType"
                                    value={form.projectType}
                                    placeholder="e.g Website Development, Branding, Content Writing"
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white mt-3"
                                />
                                {error.projectType && <p className="text-red-500 text-xs mt-1">{error.projectType}</p>}

                            </div>

                            {isPro && (
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Selected Premium Template</label>
                                    <input
                                        name="template"
                                        value={form.template}
                                        placeholder="e.g. Investor Deck Pro"
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white mt-3"
                                    />
                                </div>
                            )}


                        </div>

                        <div className="flex justify-between mt-6">
                            <button
                                onClick={() => navigate("/")}
                                className="w-fit px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                            >
                                Back
                            </button>
                            <button
                                onClick={() => { if (validateStep()) setStep(2); }}
                                className="w-fit px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                            >
                                Next
                            </button>
                        </div>

                    </div>



                )}

                {/*step 2*/}
                {step === 2 && (
                    <div className="bg-white rounded-xl dark:bg-gray-800 dark:text-white shadow-sm border p-5 sm:p-6 mt-6">

                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 flex items-center justify-center bg-blue-100 text-blue-600 rounded-lg">
                                💼
                            </div>
                            <div>
                                <div className="text-base sm:text-lg font-semibold">Project Details</div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Define goals, problems, and scope</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Business Goal</label>
                                <select
                                    name="businessGoal"
                                    value={form.businessGoal}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white mt-3"
                                >
                                    <option value="">Select main goal</option>
                                    <option>Generate leads</option>
                                    <option>Increase sales</option>
                                    <option>Improve branding</option>
                                    <option>Launch new business</option>
                                    <option>Build online presence</option>
                                    <option>Increase website traffic</option>
                                </select>
                                {error.businessGoal && <p className="text-red-500 text-xs mt-1">{error.businessGoal}</p>}
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700">Current Problems</label>
                                <textarea
                                    name="currentProblems"
                                    value={form.currentProblems}
                                    placeholder="e.g. Low traffic, weak branding, low conversions"
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white mt-3 min-h-24"
                                />
                                {error.currentProblems && <p className="text-red-500 text-xs mt-1">{error.currentProblems}</p>}
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700">Project Description *</label>
                                <textarea
                                    name="description"
                                    value={form.description}
                                    placeholder="Explain what the client needs..."
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white mt-3 min-h-24"
                                />
                                {error.description && <p className="text-red-500 text-xs mt-1">{error.description}</p>}
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700">Budget:</label>
                                <input
                                    name="budget"
                                    value={form.budget}
                                    placeholder="e.g.  ₹10,000 - ₹1,00,000"
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white mt-3"
                                />
                                {error.budget && <p className="text-red-500 text-xs mt-1">{error.budget}</p>}
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700">Timeline:</label>
                                <input
                                    name="timeline"
                                    value={form.timeline}
                                    placeholder="e.g. 2 Weeks / 1 Month"
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white mt-3"
                                />
                                {error.timeline && <p className="text-red-500 text-xs mt-1">{error.timeline}</p>}
                            </div>

                            <ProFeatureBlock isPro={isPro} navigate={navigate}>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Proposal Goal</label>
                                        <select
                                            name="pitchGoal"
                                            value={form.pitchGoal}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white mt-3"
                                        >
                                            <option>Win the client</option>
                                            <option>Secure investor interest</option>
                                            <option>Sell a monthly retainer</option>
                                            <option>Pitch an AI automation</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Export Format</label>
                                        <select
                                            name="outputFormat"
                                            value={form.outputFormat}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white mt-3"
                                        >
                                            <option>PDF</option>
                                            <option>DOCX</option>
                                            <option>PDF + DOCX</option>
                                        </select>
                                    </div>
                                </div>
                            </ProFeatureBlock>

                            <div className="flex justify-between mt-6">
                                <button
                                    onClick={() => setStep(1)}
                                    className="w-fit px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={() => { if (validateStep()) setStep(3); }}
                                    className="w-fit px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                                >
                                    Next
                                </button>
                            </div>


                        </div>
                    </div>
                )
                }

                {/*Step 3*/}
                {step === 3 && (
                    <div className="bg-white dark:bg-gray-800 dark:text-white rounded-xl shadow-sm border p-5 sm:p-6 mt-6">

                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 flex items-center justify-center bg-blue-100 text-blue-600 rounded-lg">
                                📝
                            </div>
                            <div>
                                <div className="text-base sm:text-lg font-semibold">Features & Services</div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Choose what the proposal should include</p>
                            </div>

                        </div>

                        <div className="space-y-4">
                            <CheckboxGroup
                                title="Services / Features"
                                name="requiredFeatures"
                                values={form.requiredFeatures}
                                options={["SEO", "Branding", "Content Writing", "Social Media", "Responsive Design", "Admin Dashboard", "Payment Gateway", "Analytics", "Blog", "E-commerce"]}
                                onToggle={toggleListValue}
                            />
                            {error.requiredFeatures && <p className="text-red-500 text-xs mt-1">{error.requiredFeatures}</p>}

                            <CheckboxGroup
                                title="Deliverables Needed"
                                name="deliverables"
                                values={form.deliverables}
                                options={["PDF Proposal", "Website", "Presentation", "SEO Strategy", "Social Media Plan", "Brand Guidelines", "Marketing Plan"]}
                                onToggle={toggleListValue}
                            />
                            {error.deliverables && <p className="text-red-500 text-xs mt-1">{error.deliverables}</p>}

                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Preferred Style / Design</label>
                                    <select
                                        name="preferredStyle"
                                        value={form.preferredStyle}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white mt-3"
                                    >
                                        {["Modern", "Corporate", "Luxury", "Minimal", "Startup", "Creative", "Professional"].map((style) => <option key={style}>{style}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Competitor Websites</label>
                                    <input
                                        name="competitors"
                                        value={form.competitors}
                                        placeholder="Optional references"
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white mt-3"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between gap-3">
                                    <label className="text-sm font-medium text-gray-700">Project Description *</label>
                                    <button
                                        type="button"
                                        onClick={handleSuggestDescription}
                                        disabled={suggesting}
                                        className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 disabled:opacity-60 dark:bg-blue-500/10 dark:text-blue-300"
                                    >
                                        <Sparkles size={14} />
                                        {suggesting ? "Suggesting..." : "AI Suggest"}
                                    </button>
                                </div>
                                <textarea
                                    name="description"
                                    value={form.description}
                                    placeholder="Explain your project..."
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white mt-3 min-h-28"
                                />
                                {error.description && <p className="text-red-500 text-xs mt-1">{error.description}</p>}
                                {descriptionSuggestions.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                        {descriptionSuggestions.map((suggestion, index) => (
                                            <button
                                                key={`${suggestion}-${index}`}
                                                type="button"
                                                onClick={() => setForm((prev) => ({ ...prev, description: suggestion }))}
                                                className="block w-full rounded-xl border border-blue-100 bg-blue-50/70 p-3 text-left text-sm text-gray-700 hover:border-blue-300 hover:bg-blue-100 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-gray-200"
                                            >
                                                {suggestion}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Target Audience</label>
                                <input
                                    name="audience"
                                    value={form.audience}
                                    placeholder="e.g. Students , Startups"
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white mt-3"
                                />
                                {error.audience && <p className="text-red-500 text-xs mt-1">{error.audience}</p>}
                            </div>

                            <ProFeatureBlock isPro={isPro} navigate={navigate}>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Brand Voice</label>
                                    <textarea
                                        name="brandVoice"
                                        value={form.brandVoice}
                                        placeholder="e.g. Premium, concise, investor-ready, confident but not aggressive"
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white mt-3 min-h-24"
                                    />
                                </div>
                                <div className="mt-4">
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Premium Sections</p>
                                    <div className="grid sm:grid-cols-2 gap-3">
                                        {["ROI Plan", "Risk Reversal", "Timeline", "Pricing Options", "Call to Action", "Success Metrics"].map((section) => (
                                            <button
                                                key={section}
                                                type="button"
                                                onClick={() => togglePremiumSection(section)}
                                                className={`px-4 py-3 rounded-xl text-sm font-bold border transition ${form.premiumSections.includes(section)
                                                    ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/20"
                                                    : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600"
                                                    }`}
                                            >
                                                {section}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </ProFeatureBlock>

                            <div className="flex justify-between mt-6">
                                <button
                                    onClick={() => setStep(2)}
                                    className="w-fit px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={() => { if (validateStep()) setStep(4); }}
                                    className="w-fit px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                                >
                                    Next
                                </button>
                            </div>

                        </div>
                    </div>
                )

                }
                {remaining != null && (
                    <div className="mt-6 mb-4 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 p-4">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-bold text-blue-700 dark:text-blue-300">
                                {plan === "pro" ? "Unlimited Pro generations" : `${remaining} pitches left today`}
                            </p>
                            <span className="text-xs font-black uppercase tracking-widest text-blue-400">
                                {plan === "pro" ? "Pro" : "Free"}
                            </span>
                        </div>
                        {plan !== "pro" && (
                            <div className="w-full bg-blue-100 h-2 rounded overflow-hidden">
                                <div
                                    className="bg-blue-600 h-2 rounded transition-all"
                                    style={{ width: `${Math.max(0, Math.min(100, (Number(remaining) / 5) * 100))}%` }}
                                ></div>
                            </div>
                        )}
                    </div>
                )}
                {limitError && (
                    <div className="bg-red-100 text-red-600 p-3 rounded mb-4 flex justify-between items-cnter">
                        <span>{limitError}</span>
                        <button
                            onClick={() => navigate("/payment", { state: { from: location.pathname } })}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Upgrade
                        </button>
                    </div>
                )}
                {/*Step 4*/}
                {step === 4 && (
                    <div className="bg-white dark:bg-gray-800 dark:text-white rounded-xl shadow-sm border p-5 sm:p-6 mt-6">

                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 flex items-center justify-center bg-blue-100 text-blue-600 rounded-lg">
                                🚀
                            </div>
                            <div>
                                <h2 className="text-base sm:text-lg font-semibold">Review & Generate</h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Check details before generating</p>
                            </div>
                        </div>

                        <div className="bg-blue-50 dark:bg-gray-800 dark:text-white p-4 rounded-lg text-sm space-y-1 mb-4">
                            <p><b>Client:</b>{form.clientName}</p>
                            <p><b>Project:</b>{form.projectType}</p>
                            <p><b>Budget:</b>{form.budget}</p>
                            <p><b>Timeline:</b>{form.timeline}</p>
                            <p><b>Description:</b>{form.description}</p>
                            <p><b>Audience:</b>{form.audience}</p>
                            {isPro && (
                                <>
                                    <p><b>Goal:</b>{form.pitchGoal}</p>
                                    <p><b>Format:</b>{form.outputFormat}</p>
                                    <p><b>Premium Sections:</b>{form.premiumSections.join(", ")}</p>
                                </>
                            )}
                        </div>
                        <div>
                            <label className="text-sm font-medium dark:text-white text-gray-700">Tone</label>
                            {isPro ? (
                                <select
                                    name="tone"
                                    value={form.tone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white mt-3"
                                >
                                    <option value="">Select tone</option>
                                    <option>Professional</option>
                                    <option>Premium and persuasive</option>
                                    <option>Investor-ready</option>
                                    <option>Friendly expert</option>
                                    <option>Bold and confident</option>
                                </select>
                            ) : (
                                <input
                                    name="tone"
                                    value={form.tone}
                                    placeholder="Professional / Friendly"
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white mt-3"
                                />
                            )}
                            {error.tone && <p className="text-red-500 text-xs mt-1">{error.tone}</p>}
                        </div>

                        <div className="mt-4">
                            <label className="text-sm font-medium dark:text-white text-gray-700">Project Priority</label>
                            <select
                                name="priority"
                                value={form.priority}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white mt-3"
                            >
                                {["Speed", "Quality", "Budget Friendly", "Premium Result", "Balanced"].map((item) => <option key={item}>{item}</option>)}
                            </select>
                        </div>

                        <ProFeatureBlock isPro={isPro} navigate={navigate}>
                            <label className="mt-4 flex items-center justify-between gap-4 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 px-4 py-4">
                                <span className="flex items-center gap-3">
                                    <Gauge className="text-indigo-600 dark:text-indigo-300" size={22} />
                                    <span>
                                        <span className="block text-sm font-black text-gray-900 dark:text-white">Priority AI Response</span>
                                        <span className="block text-xs text-gray-500 dark:text-gray-400">Use faster Pro generation for this pitch.</span>
                                    </span>
                                </span>
                                <input
                                    type="checkbox"
                                    name="priorityMode"
                                    checked={form.priorityMode}
                                    onChange={handleChange}
                                    className="w-5 h-5 accent-indigo-600"
                                />
                            </label>
                        </ProFeatureBlock>

                        <div className="flex justify-between mt-6">
                            <button
                                onClick={() => setStep(3)}
                                className="w-fit px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                            >
                                Back
                            </button>
                            <button
                                onClick={() => {
                                    if (validateStep()) handleGenerate();
                                }}
                                disabled={loading || remaining === 0}
                                className={`w-fit px-6 py-2 rounded-lg font-semibold transition
                                    ${remaining === 0
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-blue-600 hover:bg-blue-700 text-white"
                                    }`}
                            >
                                {loading ? "Generating..." : "Generate"}
                            </button>
                        </div>

                        {remaining != null && (
                            <p className="text-sm text-gray-500 text-center mb-4">
                                {remaining} pitches left today
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function ProFeatureBlock({ children, isPro, navigate }) {
    if (isPro) {
        return (
            <div className="rounded-2xl border border-indigo-100 dark:border-indigo-500/20 bg-indigo-50/60 dark:bg-indigo-500/10 p-4">
                <div className="flex items-center gap-2 mb-4">
                    <Sparkles size={17} className="text-indigo-600 dark:text-indigo-300" />
                    <p className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-300">Pro Controls</p>
                </div>
                {children}
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-dashed border-indigo-200 dark:border-indigo-500/30 bg-gray-50 dark:bg-gray-900/40 p-4">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Lock size={19} className="text-indigo-500" />
                    <div>
                        <p className="text-sm font-black text-gray-900 dark:text-white">Pro controls locked</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Upgrade for advanced tone, premium sections, DOCX export, and priority generation.</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => navigate("/payment", { state: { from: location.pathname } })}
                    className="shrink-0 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-black text-white hover:bg-indigo-700 transition"
                >
                    Unlock
                </button>
            </div>
        </div>
    );
}

function CheckboxGroup({ title, name, values, options, onToggle }) {
    return (
        <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{title}</p>
            <div className="grid sm:grid-cols-2 gap-3">
                {options.map((option) => (
                    <label
                        key={option}
                        className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-bold transition ${values.includes(option)
                                ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
                                : "border-gray-200 bg-white text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                            }`}
                    >
                        <input
                            type="checkbox"
                            checked={values.includes(option)}
                            onChange={() => onToggle(name, option)}
                            className="h-4 w-4 accent-blue-600"
                        />
                        {option}
                    </label>
                ))}
            </div>
        </div>
    );
}
