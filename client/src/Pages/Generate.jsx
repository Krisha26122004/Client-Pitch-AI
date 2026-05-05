import { Brain, Clock, Users, CheckCircle, Zap, Shield, X, Menu } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardSidebar from "../components/DashboardSidebar";
import Navbar from "../components/Navbar";


export default function Features() {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);
    const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";

    const handleLogout = () => {
        sessionStorage.clear();
        navigate("/");
    };

    const features = [
        {
            icon: <Brain size={28} />,
            title: "Context-Aware Pitch Generation",
            desc: "AI understands your client requirements and project details to create highly relevant pitches.",
        },
        {
            icon: <Clock size={28} />,
            title: "Smart Structure Engine",
            desc: "Automatically organizes your pitch into introduction, solution, pricing, and next steps.",
        },
        {
            icon: <Users size={28} />,
            title: "Tone & Style Control",
            desc: "Choose from professional, friendly, or persuasive tones to match your client.",
        },
        {
            icon: <CheckCircle size={28} />,
            title: "Human-in-the-Loop",
            desc: "Edit, review, and refine every section before finalizing your pitch.",
        },
        {
            icon: <Zap size={28} />,
            title: "Regenerate & Improve",
            desc: "Generate multiple variations and pick the best one for your client.",
        },
        {
            icon: <Shield size={28} />,
            title: "Export & Save",
            desc: "Download, copy, or store your pitches securely for future use.",
        },
    ];

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
                                    <h2 className="truncate text-3xl font-black text-blue-700 dark:text-blue-300">Features</h2>
                                </div>
                            </div>
                        </header>
                        <main className="px-4 py-8 sm:px-6 lg:px-8">
                            <FeaturesContent features={features} />
                        </main>
                    </div>
                </>
            ) : (
                <>
                    <Navbar />
                    <div className="pt-32 pb-20 px-6">
                        <FeaturesContent features={features} />
                    </div>
                </>
            )}
        </div>
    );
}

function FeaturesContent({ features }) {
    return (
        <>
            <div className="text-center max-w-3xl mx-auto mb-16">
                <h1 className="text-4xl font-bold mb-4 text-blue-800 dark:text-white">
                    AI-powered proposal creation
                </h1>
                <p className="text-gray-500 dark:text-blue-400 text-lg">
                    Experience the perfect balance of AI efficiency and human control
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {features.map((f, i) => (
                    <div
                        key={i}
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
                    >
                        <div className="text-blue-800 dark:text-blue-400 mb-4">{f.icon}</div>
                        <h3 className="text-lg font-semibold mb-2 text-blue-800 dark:text-blue-100">{f.title}</h3>
                        <p className="text-blue-500 dark:text-blue-400 text-sm leading-relaxed">
                            {f.desc}
                        </p>
                    </div>
                ))}
            </div>
        </>
    );
}
