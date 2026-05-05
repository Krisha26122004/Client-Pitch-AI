import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Crown, Lock, Sparkles, Menu } from "lucide-react";
import DashboardSidebar from "../components/DashboardSidebar";
import Navbar from "../components/Navbar";



export default function TemplateSelect() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isPro, setIsPro] = useState(sessionStorage.getItem("plan") === "pro");
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);
    const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";

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
            })
            .catch(() => { });
    }, []);

    const templates = [
        {
            name: "Modern Business",
            desc: "Professional proposals for the corporate clients and partnerships",
            image: "/assets/modern.png",
            sections: [
                "Executive Summary",
                "ROI Analysis",
                "Implementation Timeline",
                "Risk Assessment"
            ],
            bestFor: "B2B Services, Consulting, Enterprise",
        },

        {
            name: "Creative Agnecy",
            desc: "Visually stunning proposals for creative projects",
            image: "/assets/creative.png",
            sections: [
                "Creative Vision",
                "Brand Strategy",
                "Visual Mockups",
                "Campaign Timeline",
            ],
            bestFor: "Desgin, Marketing,Branding",
        },

        {
            name: "Technical Consulting",
            desc: "Detailed proposals for software & IT projects",
            image: "/assets/technical.png",
            sections: [
                "Technical Architecture",
                "Development Roadmap",
                "Security Framework",
                "Support Plan",
            ],
            bestFor: "Software Dev, IT Services",
        },
        {
            name: "Investor Deck Pro",
            desc: "Premium fundraising pitch for startups and founders",
            image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df",
            sections: [
                "Market Opportunity",
                "Traction Proof",
                "Financial Upside",
                "Funding Ask",
            ],
            bestFor: "Startups, Investors, Pitch Decks",
            pro: true,
        },
        {
            name: "Enterprise Retainer",
            desc: "High-value monthly proposal for B2B service clients",
            image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40",
            sections: [
                "Service Level Agreement",
                "Monthly Roadmap",
                "Reporting Cadence",
                "ROI Targets",
            ],
            bestFor: "Agencies, Consultants, B2B Services",
            pro: true,
        },
        {
            name: "AI Automation Suite",
            desc: "Advanced proposal for AI workflows and automations",
            image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3",
            sections: [
                "Workflow Mapping",
                "AI Stack",
                "Integrations",
                "Success Metrics",
            ],
            bestFor: "AI Tools, SaaS, Operations",
            pro: true,
        },
    ];

    const handleSelectTemplate = (template) => {
        if (template.pro && !isPro) {
            navigate("/payment", { state: { from: location.pathname } });
            return;
        }

        navigate("/create", { state: { template: template.name } });
    };

    const handleLogout = () => {
        sessionStorage.clear();
        navigate("/");
    };

    const childrenContent = (
        <TemplateSelectContent templates={templates} handleSelectTemplate={handleSelectTemplate} isPro={isPro} />
    );

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900 transition-colors duration-300 dark:bg-[#020817] dark:text-slate-100">
            {isLoggedIn ? (
                <>
                    <DashboardSidebar
                        open={sidebarOpen}
                        onClose={() => setSidebarOpen((open) => !open)}
                        onLogout={handleLogout}
                    />
                    <div className={`min-h-screen transition-all duration-300 ${sidebarOpen ? "lg:pl-72" : "lg:pl-20"}`}>
                        <header className="sticky top-0 z-30 flex h-[86px] items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:px-6 lg:px-8">
                            <div className="flex min-w-0 items-center gap-3">
                                <button
                                    onClick={() => setSidebarOpen(true)}
                                    className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 lg:hidden`}
                                    aria-label="Open sidebar"
                                >
                                    <Menu size={20} />
                                </button>
                                <div className="min-w-0">
                                    <h2 className="truncate text-3xl font-black text-blue-700 dark:text-blue-300">Select Template</h2>
                                </div>
                            </div>
                        </header>
                        <main className="px-4 py-8 sm:px-6 lg:px-8">
                            {childrenContent}
                        </main>
                    </div>
                </>
            ) : (
                <div className="min-h-screen pt-12 md:pt-16 px-4">
                    {childrenContent}
                </div>
            )}
        </div>
    );
}

function TemplateSelectContent({ templates, handleSelectTemplate, isPro }) {
    return (
        <>
            {/*Headings*/}
            <div className="text-center mb-10 md:mb-14">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black mb-3 text-gray-900 dark:text-white leading-tight">
                    Choose Your Proposal Template
                </h1>
                <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 font-medium">
                    Select a template to generate your AI-powered pitch
                </p>
            </div>

            {/*Cards*/}
            <div className="grid md:grid-cols-3 gap-10 max-w-7xl mx-auto mb-10">
                {templates.map((t, i) => (
                    <div
                        key={i}
                        className={`relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all p-6 border dark:border-gray-700 flex flex-col h-full ${t.pro ? "ring-1 ring-indigo-200 dark:ring-indigo-500/30" : ""}`}
                    >
                        {t.pro && (
                            <div className="absolute right-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-lg">
                                <Crown size={12} className="text-yellow-300" />
                                Pro
                            </div>
                        )}
                        {/*Header */}
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white pr-12">{t.name}</h2>
                            <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full mt-8">
                                AI Powered
                            </span>
                        </div>
                        {/*Description */}
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                            {t.desc}
                        </p>
                        {/*Image*/}
                        <img
                            src={t.image}
                            alt="preview"
                            className={`rounded-lg mb-4 w-full h-40 object-cover ${t.pro && !isPro ? "brightness-75" : ""}`}
                        />

                        {t.pro && (
                            <div className="mb-4 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 px-4 py-3">
                                <p className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-300">
                                    <Sparkles size={14} />
                                    Premium Template
                                </p>
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    Built for Pro users with advanced sections and export-ready structure.
                                </p>
                            </div>
                        )}

                        {/*Key Sections */}
                        <div className="mb-4">
                            <h3 className="font-semibold text-sm mb-2 text-gray-900 dark:text-gray-200">Key Section</h3>
                            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                {t.sections.map((s, idx) => (
                                    <li key={idx}>✓ {s}</li>
                                ))}
                            </ul>
                        </div>
                        {/*Best For */}
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                            <span className="font-semibold text-gray-900 dark:text-gray-200">Best for:</span> {t.bestFor}
                        </p>
                        {/*Button */}
                        <button
                            onClick={() => handleSelectTemplate(t)}
                            className={`w-full ${t.pro && !isPro ? "bg-indigo-600 hover:bg-indigo-500" : "bg-blue-600 dark:bg-blue-700 hover:bg-blue-500 dark:hover:bg-blue-600"} text-white py-2 rounded-lg mt-auto shadow-md active:scale-95 transition-all text-sm font-bold inline-flex items-center justify-center gap-2`}
                        >
                            {t.pro && !isPro && <Lock size={15} />}
                            {t.pro && !isPro ? "Unlock Pro" : "Select Template"}
                        </button>
                    </div>
                ))}
            </div>
        </>
    );
}


