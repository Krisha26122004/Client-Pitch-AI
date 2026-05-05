import {
    Copy,
    Download,
    Pencil,
    Check,
    ThumbsUp,
    ThumbsDown,
    RefreshCw,
    Menu,
    AlertCircle,
    Lightbulb,
    Gem,
    Target,
    ShieldCheck,
    User,
    Folder,
    CalendarDays,
    BadgeIndianRupee,
    MessageSquare,
    CircleCheck,
    ArrowRight,
    FilePenLine,
    Megaphone,
    TrendingUp,
    BriefcaseBusiness,
    PhoneCall,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { regeneratePitchWithAI } from "../api/pitch";
import DashboardSidebar from "../components/DashboardSidebar";
import InlineMessage from "../components/InlineMessage";

export default function Result() {
    const location = useLocation();
    const navigate = useNavigate();

    const state = location.state || {};
    const initialPitch =
        state.pitch ||
        state.existingPitch?.pitch ||
        state.existingPitch ||
        {};

    const [pitch, setPitch] = useState(initialPitch);
    const form = state.form || pitch || {};

    const [copied, setCopied] = useState(false);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [feedbackStatus, setFeedbackStatus] = useState("");
    const [showFeedbackBox, setShowFeedbackBox] = useState(false);
    const [feedback, setFeedback] = useState("");
    const [regenerating, setRegenerating] = useState(false);
    const [message, setMessage] = useState(null);
    const contentRef = useRef(null);

    // Sidebar state
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);

    const [sections, setSections] = useState(
        pitch.sections?.length
            ? pitch.sections
            : [
                {
                    title: "Introduction",
                    body: `Hello ${form?.clientName || "Client"}, we are excited to present a tailored solution for ${form?.projectType || "your project"}.`,
                },
                {
                    title: "Project Understanding",
                    body: form?.description || "We identified the core business goals and project priorities.",
                },
                {
                    title: "Recommended Solution",
                    body: "Our strategy focuses on scalable execution, measurable results, and modern user experience.",
                },
                {
                    title: "Timeline & Investment",
                    body: `Timeline: ${form?.timeline || "To be discussed"}\nBudget: ${form?.budget || "Custom Quote"}`,
                },
            ]
    );

    const handleLogout = () => {
        sessionStorage.clear();
        navigate("/");
    };

    const handleCopy = async () => {
        if (!contentRef.current) return;
        try {
            const text = contentRef.current.innerText;
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy!", err);
        }
    };

    const handleDownloadPDF = async () => {
        if (!contentRef.current) return;
        try {
            const canvas = await html2canvas(contentRef.current, { scale: 2 });
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF("p", "mm", "a4");
            const pdfWidth = 190;
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, "PNG", 10, 10, pdfWidth, pdfHeight);
            pdf.save(`${form?.clientName || "Client"}_Pitch.pdf`);
        } catch (err) {
            console.error("Failed to download PDF!", err);
        }
    };

    const handleDownloadDoc = () => {
        const html = `
        <html>
            <head>
                <meta charset="utf-8" />
                <title>${form?.clientName || "Client"} Pitch</title>
            </head>
            <body>
                <h1>${pitch?.title || "Client Pitch"}</h1>
                ${sections.map((section) => `<h2>${section.title}</h2><p>${section.body}</p>`).join("")}
            </body>
        </html>
        `;
        const blob = new Blob([html], { type: "application/msword" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${form?.clientName || "Client"}_Pitch.doc`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const updateSection = (index, key, value) => {
        setSections((prev) =>
            prev.map((section, i) =>
                i === index ? { ...section, [key]: value } : section
            )
        );
    };

    const handleSaveEdits = async () => {
        if (!pitch?._id) {
            setEditing(false);
            return;
        }
        try {
            setSaving(true);
            await axios.put(`/api/pitches/update/${pitch._id}`, {
                sections,
                content: sections.map((section) => `${section.title}\n${section.body}`).join("\n\n"),
            });
            setEditing(false);
            setMessage({ tone: "success", text: "Edits saved." });
        } catch (error) {
            console.error(error);
            setMessage({ tone: "error", text: "Failed to save edits." });
        } finally {
            setSaving(false);
        }
    };

    const handleLike = () => {
        setFeedbackStatus("liked");
        setShowFeedbackBox(false);
        setFeedback("");
        setTimeout(() => {
            navigate("/savedpitches");
        }, 3000);
    };

    const handleDislike = () => {
        setFeedbackStatus("disliked");
        setShowFeedbackBox(true);
    };

    const handleRegenerate = async () => {
        if (!feedback.trim()) {
            setMessage({ tone: "error", text: "Please enter feedback." });
            return;
        }
        try {
            setRegenerating(true);
            const data = await regeneratePitchWithAI({
                form: { ...form, title: pitch?.title },
                feedback,
                isPro: sessionStorage.getItem("plan") === "pro",
            });
            const nextSections = data?.sections?.length > 0 ? data.sections : sections;
            const nextPitch = {
                ...pitch,
                title: data?.title || pitch?.title,
                content: data?.content || nextSections.map((s) => `${s.title}\n${s.body}`).join("\n\n"),
                sections: nextSections,
            };
            setPitch(nextPitch);
            setSections(nextSections);
            setShowFeedbackBox(false);
            setFeedbackStatus("");
            setFeedback("");
            setMessage({ tone: "success", text: "Pitch regenerated." });
            if (pitch?._id) {
                await axios.put(`/api/pitches/update/${pitch._id}`, {
                    title: nextPitch.title,
                    content: nextPitch.content,
                    sections: nextSections,
                    lastAction: "Regenerated",
                });
            }
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (error) {
            console.error(error);
            setMessage({ tone: "error", text: error?.response?.data?.message || "Could not regenerate pitch." });
        } finally {
            setRegenerating(false);
        }
    };

    if (!location.state) {
        return (
            <div className="min-h-screen bg-[#F5F7FB] dark:bg-[#020817] flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-4">No Pitch Found</h2>
                    <button onClick={() => navigate("/create")} className="px-6 py-3 rounded-xl bg-blue-600 text-white font-bold">
                        Create Pitch
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#F5F7FB] dark:bg-[#020817] transition-colors duration-300">
            <DashboardSidebar
                open={sidebarOpen}
                onClose={() => setSidebarOpen((open) => !open)}
                activePath="/savedpitches"
                onLogout={handleLogout}
            />

            <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? "lg:pl-72" : "lg:pl-20"}`}>
                <main className="p-6 lg:p-12">
                    {/* HEADER */}
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 mb-12">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className={`p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 shadow-sm transition-all hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 lg:hidden`}
                                aria-label="Open sidebar"
                            >
                                <Menu size={20} />
                            </button>
                            <div>
                                <h1 className="text-4xl font-black text-slate-800 dark:text-white">
                                    Your Pitch is <span className="text-blue-600">Ready!</span>
                                </h1>
                                <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">AI generated proposal tailored for your client.</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button onClick={handleCopy} className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white px-5 py-3 rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                                <Copy size={18} /> {copied ? "Copied!" : "Copy"}
                            </button>
                            <button onClick={handleDownloadPDF} className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white px-5 py-3 rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                                <Download size={18} /> PDF
                            </button>
                            <button onClick={handleDownloadDoc} className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white px-5 py-3 rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                                <Download size={18} /> DOC
                            </button>
                            <button onClick={() => setEditing(!editing)} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all">
                                <Pencil size={18} /> {editing ? "Preview" : "Edit Sections"}
                            </button>
                            {editing && (
                                <button onClick={handleSaveEdits} disabled={saving} className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold text-sm disabled:opacity-60">
                                    <Check size={18} /> {saving ? "Saving..." : "Save"}
                                </button>
                            )}
                        </div>
                    </div>

                    {message && (
                        <InlineMessage tone={message.tone} className="mb-8">
                            {message.text}
                        </InlineMessage>
                    )}

                    {/* PITCH CARD */}
                    <div ref={contentRef} className="bg-white dark:bg-slate-900 shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
                        <div className="p-4 lg:p-6">
                            {editing ? (
                                <div className="space-y-6">
                                    {sections.map((section, index) => (
                                        <section key={index}>
                                            <input
                                                value={section.title}
                                                onChange={(e) => updateSection(index, "title", e.target.value)}
                                                className="mb-3 w-full border dark:border-slate-700 rounded-xl px-4 py-2 font-bold text-blue-600 dark:text-blue-400 bg-transparent uppercase text-sm"
                                            />
                                            <textarea
                                                value={section.body}
                                                onChange={(e) => updateSection(index, "body", e.target.value)}
                                                className="w-full min-h-32 border dark:border-slate-700 rounded-2xl p-4 text-slate-700 dark:text-slate-300 bg-transparent"
                                            />
                                        </section>
                                    ))}
                                </div>
                            ) : (
                                <StructuredProposalView sections={sections} form={form} />
                            )}

                        </div>
                    </div>

                    {/* FEEDBACK */}
                    <div className="mt-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 transition-colors">
                        <div className="flex flex-col lg:flex-row justify-between gap-4">
                            <div>
                                <h3 className="font-black text-slate-800 dark:text-white">How does this pitch look?</h3>
                                <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Regenerate improved versions using AI.</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleLike}
                                    className={`px-5 py-2 rounded-xl border font-bold text-sm flex items-center gap-2 transition-all ${feedbackStatus === "liked" ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm shadow-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-300 dark:shadow-none" : "border-slate-200 dark:border-slate-700 dark:text-slate-300"}`}
                                >
                                    <ThumbsUp size={17} className={feedbackStatus === "liked" ? "fill-emerald-500 text-emerald-600" : ""} /> Like
                                </button>
                                <button
                                    onClick={handleDislike}
                                    className={`px-5 py-2 rounded-xl border font-bold text-sm flex items-center gap-2 transition-all ${feedbackStatus === "disliked" ? "bg-red-50 border-red-500 text-red-700 dark:bg-red-900/20" : "border-slate-200 dark:border-slate-700 dark:text-slate-300"}`}
                                >
                                    <ThumbsDown size={17} /> Dislike
                                </button>
                            </div>
                        </div>

                        {showFeedbackBox && (
                            <div className="mt-5 animate-fade-in">
                                <textarea
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    placeholder="Tell AI what to improve..."
                                    className="w-full min-h-28 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 bg-transparent dark:text-white outline-none focus:ring-2 ring-blue-500/20"
                                />
                                <div className="flex justify-end mt-4">
                                    <button onClick={handleRegenerate} disabled={regenerating} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all">
                                        <RefreshCw size={17} className={regenerating ? "animate-spin" : ""} />
                                        {regenerating ? "Regenerating..." : "Regenerate Pitch"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* FOOTER */}
                    <div className="mt-10 flex items-center justify-between">
                        <button onClick={() => navigate("/dashboard")} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                            Back to Dashboard
                        </button>
                        <p className="text-[10px] uppercase tracking-widest font-black text-slate-300 dark:text-slate-600">Built with ClientPitch AI</p>
                    </div>
                </main>
            </div>
        </div>
    );
}

export function StructuredProposalView({ sections, form }) {
    const find = (...names) => sections.find((section) => {
        const title = section.title.toLowerCase();
        return names.some((name) => title.includes(name.toLowerCase()));
    }) || {};
    const splitLines = (text = "") => text.split(/\n+|â€¢|Ã¢â‚¬Â¢|•|-/).map((line) => line.trim()).filter(Boolean).slice(0, 6);
    const fallbackServices = [
        `Strategy and planning for ${form?.projectType || "the project"}`,
        "Research, positioning, and execution support",
        "Review cycles and client-ready deliverables",
        "Optimization, handover, and reporting",
    ];
    const fallbackPricing = [
        `Total investment: ${form?.budget || "Custom Quote"}`,
        "Scope includes planning, production, review, and final delivery",
        `Timeline: ${form?.timeline || "To be discussed"}`,
        "Final pricing can be adjusted after scope confirmation",
    ];
    const fallbackCTA = [
        "Approve the proposal scope",
        "Confirm the timeline and required deliverables",
        "Schedule the kickoff discussion",
        "Begin the first project milestone",
    ];
    const fallbackValue = [
        `Tailored ${form?.projectType || "project"} strategy for ${form?.company || form?.clientName || "the client"}`,
        `Built around ${form?.businessGoal || form?.pitchGoal || "measurable business growth"}`,
        `Clear deliverables for ${form?.audience || "the target audience"}`,
        "Better visibility, engagement, and conversion potential",
        "Transparent communication with practical milestones",
        `Cost-conscious execution within ${form?.budget || "the agreed budget"}`,
    ].join("\n");
    const topCards = [
        { title: "Problem Statement", icon: AlertCircle, color: "red", body: find("Problem", "Challenge", "Risk").body || form?.currentProblems },
        { title: "Our Solution", icon: Lightbulb, color: "emerald", body: find("Solution", "Architecture", "Strategy").body || form?.description },
        { title: "Value Proposition", icon: Gem, color: "amber", body: find("Value", "ROI", "Opportunity").body || fallbackValue },
    ];
    const serviceBody = find("Service", "Deliverable", "Support", "Roadmap").body;
    const pricingBody = find("Pricing", "Cost", "Investment").body;
    const ctaBody = find("Call to Action", "Next Step", "Funding Ask").body;
    const timeline = find("Timeline", "Roadmap", "Campaign Timeline", "Development Roadmap", "Monthly Roadmap");
    const phases = normalizeTimelinePhases(timeline.body)
        .split(/\n\n+/)
        .map((phase) => phase.trim())
        .filter(Boolean)
        .slice(0, 4);
    const displayPhases = phases.length ? phases : buildFallbackPhases(form);
    const timelineIcons = [Target, FilePenLine, Megaphone, TrendingUp];
    const timelineColors = ["blue", "indigo", "violet", "teal"];
    const services = splitLines(serviceBody);
    const pricing = splitLines(pricingBody);
    const cta = splitLines(ctaBody);

    return (
        <div className="space-y-5">
            <ProposalHeader form={form} />

            <div className="grid gap-4 lg:grid-cols-3">
                {topCards.map((card) => <ProposalCard key={card.title} {...card} />)}
            </div>

            <section className="border border-blue-200 bg-white p-4 dark:border-blue-900 dark:bg-slate-900">
                <div className="mb-4 flex items-center justify-center gap-3">
                    <span className="h-px flex-1 bg-blue-200 dark:bg-blue-900"></span>
                    <h3 className="text-base font-black uppercase text-blue-900 dark:text-blue-300">Project Timeline</h3>
                    <span className="h-px flex-1 bg-blue-200 dark:bg-blue-900"></span>
                </div>
                <div className="grid gap-4 md:grid-cols-4">
                    {displayPhases.map((phase, index) => (
                        <TimelineCard
                            key={`${phase}-${index}`}
                            color={timelineColors[index]}
                            icon={timelineIcons[index]}
                            index={index}
                            phase={phase}
                        />
                    ))}
                </div>
            </section>

            <div className="grid gap-4 lg:grid-cols-3">
                <ProposalCard title="Our Services" icon={BriefcaseBusiness} bodyLines={services.length ? services : fallbackServices} color="blue" />
                <CostCard form={form} bodyLines={pricing.length ? pricing : fallbackPricing} />
                <ProposalCard title="Call To Action" icon={PhoneCall} bodyLines={cta.length ? cta : fallbackCTA} color="emerald" />
            </div>
        </div>
    );
}

function buildFallbackPhases(form) {
    const projectType = form?.projectType || "Project";
    return [
        `Week 1-2\nResearch & Strategy\nClient discovery\nAudience and competitor research\nScope confirmation\nDeliverable: ${projectType} Strategy Plan`,
        `Week 3-4\nPlanning & Setup\nService planning\nContent and asset preparation\nApproval workflow\nDeliverable: Project Roadmap`,
        `Week 5-6\nExecution\nCore implementation\nReview and revisions\nPerformance monitoring\nDeliverable: Active Project Delivery`,
        `Week 7-8\nOptimization & Handover\nFinal improvements\nReporting\nLaunch or handover support\nDeliverable: Final Project Report`,
    ];
}

function normalizeTimelinePhases(body = "") {
    return String(body)
        .replace(/(?:^|\n)(Week\s+\d+\s*-\s*\d+:?)/gi, "\n\n$1")
        .trim();
}

function StructuredProposal({ sections, form }) {
    const find = (name) => sections.find((section) => section.title.toLowerCase().includes(name.toLowerCase())) || {};
    const hasDefaultProposalShape = ["Problem", "Solution", "Value"].every((name) => find(name).body);
    const splitLines = (text = "") => text.split(/\n+|•|â€¢|-/).map((line) => line.trim()).filter(Boolean).slice(0, 6);

    if (!hasDefaultProposalShape) {
        return (
            <div className="space-y-5">
                <ProposalHeader form={form} />
                <div className="grid gap-4 lg:grid-cols-2">
                    {sections.map((section, index) => (
                        <ProposalCard
                            key={`${section.title}-${index}`}
                            title={section.title}
                            body={section.body}
                            icon={[Lightbulb, Target, ShieldCheck, Gem][index % 4]}
                            color={["blue", "emerald", "amber", "red"][index % 4]}
                        />
                    ))}
                </div>
            </div>
        );
    }

    const topCards = [
        { title: "Problem Statement", icon: AlertCircle, color: "red", body: find("Problem").body },
        { title: "Our Solution", icon: Lightbulb, color: "emerald", body: find("Solution").body },
        { title: "Value Proposition", icon: Gem, color: "amber", body: find("Value").body },
    ];
    const bottomCards = [
        { title: "Project Cost Breakdown", icon: Target, body: find("Cost").body },
        { title: "Expected Outcomes", icon: Target, body: find("Outcomes").body },
        { title: "Why Choose Us?", icon: ShieldCheck, body: find("Why").body },
    ];
    const timeline = find("Timeline");
    const phases = normalizeTimelinePhases(timeline.body)
        .split(/\n\n+/)
        .map((phase) => phase.trim())
        .filter(Boolean)
        .slice(0, 4);
    const timelineIcons = [Target, FilePenLine, Megaphone, TrendingUp];
    const timelineColors = ["blue", "indigo", "violet", "teal"];

    return (
        <div className="space-y-5">
            <ProposalHeader form={form} />

            <div className="grid gap-4 lg:grid-cols-3">
                {topCards.map((card) => <ProposalCard key={card.title} {...card} />)}
            </div>

            <section className="border border-blue-200 dark:border-blue-900 bg-white dark:bg-slate-900 p-4">
                <div className="mb-4 flex items-center justify-center gap-3">
                    <span className="h-px flex-1 bg-blue-200 dark:bg-blue-900"></span>
                    <h3 className="text-base font-black uppercase text-blue-900 dark:text-blue-300">{timeline.title || `Project Timeline (${form?.timeline || "4 Months"})`}</h3>
                    <span className="h-px flex-1 bg-blue-200 dark:bg-blue-900"></span>
                </div>
                <div className="grid gap-4 md:grid-cols-4">
                    {phases.map((phase, index) => (
                        <TimelineCard
                            key={`${phase}-${index}`}
                            color={timelineColors[index]}
                            icon={timelineIcons[index]}
                            index={index}
                            phase={phase}
                        />
                    ))}
                </div>
            </section>

            <div className="grid gap-4 lg:grid-cols-3">
                <CostCard form={form} body={bottomCards[0].body} />
                <ProposalCard {...bottomCards[1]} bodyLines={splitLines(bottomCards[1].body)} color="emerald" />
                <ProposalCard {...bottomCards[2]} bodyLines={splitLines(bottomCards[2].body)} color="blue" />
            </div>
        </div>
    );
}

function ProposalHeader({ form }) {
    const meta = [
        { label: "Client Name", value: form?.clientName || "Client", icon: User },
        { label: "Project Type", value: form?.projectType || "Project", icon: Folder },
        { label: "Timeline", value: form?.timeline || "To be discussed", icon: CalendarDays },
        { label: "Project Cost", value: form?.budget || "Custom Quote", icon: BadgeIndianRupee },
        { label: "Tone", value: form?.tone || "Professional", icon: MessageSquare },
    ];

    return (
        <header className="space-y-5">
            <div className="border-l-4 border-amber-500 pl-5">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{form?.company || "Your Company"}</p>
                <h2 className="mt-3 max-w-4xl text-4xl font-black uppercase leading-tight text-slate-950 dark:text-white md:text-5xl">
                    {(form?.projectType || "Project")} <span className="text-amber-500">Proposal</span> for {form?.clientName || "Client"}
                </h2>
                <p className="mt-4 max-w-3xl text-sm font-semibold leading-6 text-slate-600 dark:text-slate-300">
                    {form?.description || "A strategic proposal designed to solve the client's challenge and drive measurable business growth."}
                </p>
            </div>

            <div className="grid gap-0 overflow-hidden bg-slate-950 text-white shadow-lg md:grid-cols-5">
                {meta.map((item) => {
                    const Icon = item.icon;
                    return (
                        <div key={item.label} className="flex items-center gap-3 border-b border-white/15 px-4 py-4 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/70">
                                <Icon size={19} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-black uppercase tracking-wide text-amber-400">{item.label}</p>
                                <p className="truncate text-sm font-black">{item.value}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </header>
    );
}

function ProposalCard({ body, bodyLines, color = "blue", icon, title }) {
    const CardIcon = icon;
    const palette = {
        red: { text: "text-red-700 dark:text-red-300", bg: "bg-red-600", soft: "bg-red-50 dark:bg-red-950/20", border: "border-red-200 dark:border-red-900/40" },
        emerald: { text: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-700", soft: "bg-emerald-50 dark:bg-emerald-950/20", border: "border-emerald-200 dark:border-emerald-900/40" },
        amber: { text: "text-amber-700 dark:text-amber-300", bg: "bg-amber-600", soft: "bg-amber-50 dark:bg-amber-950/20", border: "border-amber-200 dark:border-amber-900/40" },
        blue: { text: "text-blue-800 dark:text-blue-300", bg: "bg-blue-800", soft: "bg-blue-50 dark:bg-blue-950/20", border: "border-blue-200 dark:border-blue-900/40" },
    }[color];
    const lines = Array.isArray(bodyLines)
        ? bodyLines
        : typeof bodyLines === "string"
            ? bodyLines.split(/\n+|•|â€¢/)
            : String(body || "").split(/\n+|•|â€¢/);
    const displayLines = lines.map((line) => String(line).trim()).filter(Boolean).slice(0, 6);

    return (
        <section className={`border ${palette.border} bg-white p-5 shadow-sm dark:bg-slate-900`}>
            <div className="mb-4 flex items-center gap-3">
                <div className={`flex h-11 w-11 items-center justify-center rounded-full ${palette.bg} text-white shadow-sm`}>
                    <CardIcon size={22} />
                </div>
                <h3 className={`text-base font-black uppercase tracking-wide ${palette.text}`}>{title}</h3>
            </div>
            <ul className="space-y-2">
                {(displayLines.length ? displayLines : ["Details will be refined from your project inputs."]).map((line, index) => (
                    <li key={`${line}-${index}`} className="flex gap-2 text-sm font-semibold leading-6 text-slate-700 dark:text-slate-300">
                        <CircleCheck size={16} className={`mt-1 shrink-0 ${palette.text}`} />
                        <span>{line}</span>
                    </li>
                ))}
            </ul>
        </section>
    );
}

function TimelineCard({ color, icon, index, phase }) {
    const Icon = icon;
    const palette = {
        blue: { bg: "bg-blue-700", text: "text-blue-900 dark:text-blue-300", border: "border-blue-200 dark:border-blue-900" },
        indigo: { bg: "bg-indigo-700", text: "text-indigo-900 dark:text-indigo-300", border: "border-indigo-200 dark:border-indigo-900" },
        violet: { bg: "bg-violet-700", text: "text-violet-900 dark:text-violet-300", border: "border-violet-200 dark:border-violet-900" },
        teal: { bg: "bg-teal-700", text: "text-teal-900 dark:text-teal-300", border: "border-teal-200 dark:border-teal-900" },
    }[color];
    const lines = String(phase || "").split(/\n+/).map((line) => line.trim()).filter(Boolean);
    const weekTitles = ["Week 1-2", "Week 3-4", "Week 5-6", "Week 7-8"];
    const rawTitle = lines[0] || weekTitles[index] || `Week ${index + 1}`;
    const title = /^week\b/i.test(rawTitle) ? rawTitle : weekTitles[index] || rawTitle.replace(/^month/i, "Week");
    const items = lines.slice(1, -1).length ? lines.slice(1, -1) : lines.slice(1);
    const deliverable = lines.find((line) => line.toLowerCase().includes("deliverable")) || items[items.length - 1] || "Final deliverable";

    return (
        <div className="relative">
            {index < 3 && <ArrowRight className="absolute -right-4 top-1/2 z-10 hidden -translate-y-1/2 text-blue-400 md:block" size={24} />}
            <div className={`h-full border ${palette.border} bg-white text-center shadow-sm dark:bg-slate-900`}>
                <div className="border-b border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-800 dark:bg-slate-800/60">
                    <p className={`text-sm font-black uppercase ${palette.text}`}>{title}</p>
                </div>
                <div className="px-4 py-5">
                    <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${palette.bg} text-white shadow-md`}>
                        <Icon size={25} />
                    </div>
                    <ul className="space-y-2 text-left">
                        {items.slice(0, 4).map((item, itemIndex) => (
                            <li key={`${item}-${itemIndex}`} className="flex gap-2 text-xs font-semibold leading-5 text-slate-700 dark:text-slate-300">
                                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-700"></span>
                                {item.replace(/^Deliverable:\s*/i, "")}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="border-t border-slate-100 bg-slate-50 px-3 py-3 dark:border-slate-800 dark:bg-slate-800/60">
                    <p className="text-[10px] font-black uppercase text-blue-900 dark:text-blue-300">Deliverable:</p>
                    <p className="text-xs font-black text-blue-900 dark:text-blue-200">{deliverable.replace(/^Deliverable:\s*/i, "")}</p>
                </div>
            </div>
        </div>
    );
}

function CostCard({ form, body, bodyLines }) {
    const rows = [
        ["Strategy & Planning", "25%"],
        ["Content & Branding", "30%"],
        ["Campaign Execution", "30%"],
        ["Optimization & Reporting", "15%"],
    ];

    return (
        <section className="border border-blue-200 bg-white shadow-sm dark:border-blue-900/40 dark:bg-slate-900">
            <div className="flex items-center gap-3 border-b border-slate-100 p-4 dark:border-slate-800">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-800 text-white">
                    <BadgeIndianRupee size={20} />
                </div>
                <h3 className="text-base font-black uppercase text-blue-900 dark:text-blue-300">Project Cost Breakdown</h3>
            </div>
            <div className="px-4 py-3">
                <div className="grid grid-cols-[1fr_auto] bg-slate-100 px-3 py-2 text-xs font-black text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    <span>Service</span>
                    <span>Cost</span>
                </div>
                {(bodyLines?.length ? bodyLines.map((line) => [line, ""]) : body ? body.split(/\n+/).filter(Boolean).slice(0, 4).map((line) => [line, ""]) : rows).map((row, index) => (
                    <div key={`${row[0]}-${index}`} className="grid grid-cols-[1fr_auto] border-b border-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 last:border-b-0 dark:border-slate-800 dark:text-slate-300">
                        <span>{Array.isArray(row) ? row[0] : row}</span>
                        <span>{Array.isArray(row) ? row[1] : ""}</span>
                    </div>
                ))}
            </div>
            <div className="flex items-center justify-between bg-slate-950 px-4 py-3 text-sm font-black uppercase text-white">
                <span>Total Project Cost</span>
                <span className="text-amber-400">{form?.budget || "Custom Quote"}</span>
            </div>
        </section>
    );
}
