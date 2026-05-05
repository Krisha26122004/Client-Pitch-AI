import { Crown, Heart, Eye, Lock, Sparkles, X, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardSidebar from "../components/DashboardSidebar";
import Navbar from "../components/Navbar";

const templatesData = [
    { id: 1, name: "Modern Business", desc: "Professional proposals for corporate clients", theme: "bg-blue-50 dark:bg-blue-900/10", tone: "formal", image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f", content: "Hello, I understand your requirements and can deliver a scalable solution. Let's discuss further.", sections: ["Executive Summary", "ROI Analysis", "Implementation Timeline", "Risk Assessment"] },
    { id: 2, name: "Creative Agency", desc: "Visually engaging creative proposals", theme: "bg-purple-50 dark:bg-purple-900/10", tone: "friendly", image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f", content: "Hey! I love your idea and would love to design something visually amazing.", sections: ["Creative Vision", "Brand Strategy", "Visual Mockups", "Campaign Timeline"] },
    { id: 3, name: "Technical Consulting", desc: "Detailed technical project proposals", theme: "bg-green-50 dark:bg-green-900/10", tone: "formal", image: "https://images.unsplash.com/photo-1518770660439-4636190af475", content: "I can build your project using modern architecture ensuring scalability and performance.", sections: ["Architecture", "Roadmap", "Security", "Support Plan"] },
    { id: 4, name: "Startup MVP", desc: "Perfect for startup ideas", theme: "bg-yellow-50 dark:bg-yellow-900/10", tone: "confident", image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d", content: "Your idea has great potential. I suggest starting with an MVP for quick validation.", sections: ["Idea Validation", "MVP Plan", "Scalability", "Growth Strategy"] },
    { id: 5, name: "Quick Freelance Bid", desc: "Short and impactful proposal", theme: "bg-gray-100 dark:bg-gray-700/30", tone: "confident", image: "https://images.unsplash.com/photo-1492724441997-5dc865305da7", content: "I can complete this quickly with high quality. Let's connect!", sections: ["Quick Intro", "Solution", "CTA"] },
    { id: 6, name: "Long-Term Collaboration", desc: "Build lasting client relationships", theme: "bg-pink-50 dark:bg-pink-900/10", tone: "friendly", image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d", content: "I would love to work with you as a long-term development partner.", sections: ["Introduction", "Partnership", "Support", "Future Scope"] },
    { id: 7, pro: true, name: "Investor Deck Pro", desc: "Premium funding proposal with traction, market, and financial framing", theme: "bg-indigo-50 dark:bg-indigo-900/20", tone: "formal", image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df", content: "Hello, this proposal positions your business for investor confidence with a clear market thesis, traction proof, financial upside, and a focused next step.", sections: ["Problem", "Market Size", "Traction", "Funding Ask"] },
    { id: 8, pro: true, name: "Enterprise Retainer", desc: "High-value monthly service proposal for serious B2B clients", theme: "bg-slate-100 dark:bg-slate-800", tone: "formal", image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40", content: "Hello, this retainer proposal outlines a premium ongoing partnership with predictable delivery, priority support, performance reporting, and strategic execution.", sections: ["Scope", "SLA", "Monthly Deliverables", "ROI"] },
    { id: 9, pro: true, name: "Brand Launch Premium", desc: "Polished campaign proposal for design, marketing, and launch work", theme: "bg-rose-50 dark:bg-rose-900/20", tone: "friendly", image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72", content: "Hey, this launch plan turns your brand into a sharp market moment with messaging, visual direction, campaign assets, and a rollout timeline.", sections: ["Positioning", "Creative Direction", "Launch Plan", "Assets"] },
    { id: 10, pro: true, name: "AI Automation Suite", desc: "Advanced technical proposal for AI workflows and business automation", theme: "bg-cyan-50 dark:bg-cyan-900/20", tone: "confident", image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3", content: "I will design a scalable AI automation system that reduces manual work, improves response speed, and gives your team measurable operational leverage.", sections: ["Workflow Map", "AI Stack", "Integrations", "Success Metrics"] }
];

const getFavoritesKey = () => {
    const userId = sessionStorage.getItem("userId");
    return userId ? `favoriteTemplates:${userId}` : "favoriteTemplates:guest";
};

const getStoredFavoriteIds = () => {
    try {
        const saved = localStorage.getItem(getFavoritesKey());
        const ids = JSON.parse(saved || "[]");
        return Array.isArray(ids) ? ids : [];
    } catch {
        return [];
    }
};

export default function Templates() {
    const navigate = useNavigate();
    const location = useLocation();
    const [favoriteIds, setFavoriteIds] = useState(getStoredFavoriteIds);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [tone, setTone] = useState("all");
    const [showFavorites, setShowFavorites] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);
    const [isPro, setIsPro] = useState(sessionStorage.getItem("plan") === "pro");
    const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";

    const tones = ["all", "formal", "friendly", "confident"];
    const templates = templatesData.map((template) => ({
        ...template,
        favorite: favoriteIds.includes(template.id),
    }));

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
            .catch(() => {});
    }, []);

    useEffect(() => {
        localStorage.setItem(getFavoritesKey(), JSON.stringify(favoriteIds));
    }, [favoriteIds]);


    const toggleFavorite = (id) => {
        setFavoriteIds((current) =>
            current.includes(id)
                ? current.filter((favoriteId) => favoriteId !== id)
                : [...current, id]
        );
    };

    const applyTone = (text) => {
        if (tone === "friendly") {
            return text.replace("Hello", "Hey").replace("I would", "I'd");
        }
        if (tone === "confident") {
            return text.replace("can", "will").replace("would", "definitely will");
        }
        return text;
    };


    const getPitchScore = (text) => {
        let score = 0;
        if (text.length > 50) score += 20;
        if (text.includes("I")) score += 20;
        if (text.toLowerCase().includes("let's")) score += 20;
        if (text.length < 200) score += 20;
        if (
            text.toLowerCase().includes("build") ||
            text.toLowerCase().includes("develop")
        )
            score += 20;
        return score;
    };

    const handleUseTemplate = (template) => {
        if (template.pro && !isPro) {
            navigate("/payment", { state: { from: location.pathname } });
            return;
        }

        navigate("/create", { state: { template: template.name } });
    };

    const filteredTemplates = templates.filter((t) => {
        const toneMatch = tone === "all" || t.tone === tone;
        const favMatch = !showFavorites || t.favorite;
        return toneMatch && favMatch;
    });


    const handleLogout = () => {
        sessionStorage.clear();
        navigate("/");
    };

    // Define childrenContent inside the component to access local state
    const childrenContent = (
        <TemplateList
            tone={tone}
            setTone={setTone}
            tones={tones}
            showFavorites={showFavorites}
            setShowFavorites={setShowFavorites}
            filteredTemplates={filteredTemplates}
            toggleFavorite={toggleFavorite}
            setSelectedTemplate={setSelectedTemplate}
            handleUseTemplate={handleUseTemplate}
            isPro={isPro}
        />
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
                                    <h2 className="truncate text-3xl font-black text-blue-700 dark:text-blue-300">Templates</h2>
                                </div>
                            </div>
                        </header>
                        <main className="px-4 py-8 sm:px-6 lg:px-8">
                            <div className="max-w-7xl mx-auto">
                                <h1 className="text-3xl sm:text-4xl font-black mb-8 text-center text-gray-900 dark:text-white tracking-tight">
                                    Premium Pitch Templates
                                </h1>
                                {childrenContent}
                            </div>
                        </main>
                    </div>
                </>
            ) : (
                <>
                    <Navbar />
                    <div className="pt-28 p-4 sm:p-8">
                        <div className="max-w-7xl mx-auto">
                            <h1 className="text-3xl sm:text-4xl font-black mb-8 text-center text-gray-900 dark:text-white tracking-tight">
                                Premium Pitch Templates
                            </h1>
                            {childrenContent}
                        </div>
                    </div>
                </>
            )}

            {/* MODAL */}
            {selectedTemplate && (
                <TemplateModal selectedTemplate={selectedTemplate} setSelectedTemplate={setSelectedTemplate} applyTone={applyTone} getPitchScore={getPitchScore} handleUseTemplate={handleUseTemplate} isPro={isPro} />
            )}
        </div>
    );
}

function TemplateList({ tone, setTone, tones, showFavorites, setShowFavorites, filteredTemplates, toggleFavorite, setSelectedTemplate, handleUseTemplate, isPro }) {
    return (
        <>
            {/* FILTERS */}
            <div className="flex flex-wrap gap-2 bg-white dark:bg-gray-800 p-3 rounded-2xl shadow-sm mb-10 items-center justify-center sm:justify-start border dark:border-gray-700">
                <span className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 px-3 hidden sm:inline">Filters:</span>
                {tones.map((t) => (
                    <button
                        key={t}
                        onClick={() => setTone(t)}
                        className={`px-6 py-2 rounded-xl capitalize font-bold transition-all duration-300 text-sm ${tone === t
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
                    >
                        {t}
                    </button>
                ))}

                <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2 hidden sm:block"></div>

                <button
                    onClick={() => setShowFavorites(!showFavorites)}
                    className={`px-6 py-2 rounded-xl transition-all font-bold text-sm ${showFavorites
                        ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                >
                    Favorites
                </button>
            </div>

            {/* CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredTemplates.map((t) => (
                    <TemplateCard key={t.id} t={t} isPro={isPro} toggleFavorite={toggleFavorite} setSelectedTemplate={setSelectedTemplate} handleUseTemplate={handleUseTemplate} />
                ))}
            </div>
        </>
    );
}

function TemplateCard({ t, isPro, toggleFavorite, setSelectedTemplate, handleUseTemplate }) {
    return (
        <div
            className={`relative overflow-hidden ${t.theme} p-6 rounded-2xl border dark:border-gray-700 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col h-full ${t.pro ? "ring-1 ring-indigo-200 dark:ring-indigo-500/30" : ""}`}
        >
            {t.pro && (
                <div className="absolute right-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-lg">
                    <Crown size={12} className="text-yellow-300" />
                    Pro
                </div>
            )}
            <img
                src={t.image}
                alt={t.name}
                className={`w-full h-44 object-cover rounded-xl mb-6 shadow-md ${t.pro && !isPro ? "brightness-75" : ""}`}
            />

            <div className="flex justify-between items-start mb-2">
                <h2 className="font-black text-xl text-gray-900 dark:text-white leading-tight">{t.name}</h2>
                <button
                    onClick={() => toggleFavorite(t.id)}
                    className="p-1 hover:scale-125 transition-transform"
                >
                    <Heart
                        className={`w-6 h-6 ${t.favorite
                            ? "text-red-500 fill-red-500"
                            : "text-gray-400 dark:text-gray-600"
                            }`}
                    />
                </button>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 font-bold mb-6 flex-grow">
                {t.desc}
            </p>

            <div className="flex justify-between items-center mt-auto pt-6 border-t dark:border-gray-700/50">
                <button
                    onClick={() => setSelectedTemplate(t)}
                    className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 flex items-center gap-2 hover:gap-3 transition-all"
                >
                    <Eye size={16} /> Preview
                </button>

                <button
                    onClick={() => handleUseTemplate(t)}
                    className={`${t.pro && !isPro ? "bg-indigo-600" : "bg-gray-900 dark:bg-blue-600"} text-white px-6 py-2 rounded-xl text-sm font-black shadow-lg hover:opacity-90 active:scale-95 transition-all inline-flex items-center gap-2`}
                >
                    {t.pro && !isPro && <Lock size={14} />}
                    {t.pro && !isPro ? "Unlock Pro" : "Use Template"}
                </button>
            </div>

            {t.pro && (
                <div className="mt-4 rounded-xl bg-white/70 dark:bg-gray-900/40 px-4 py-3 border border-white/60 dark:border-gray-700">
                    <p className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-300">
                        <Sparkles size={14} />
                        Pro feature template
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Includes advanced tone, premium sections, and export-ready structure.
                    </p>
                </div>
            )}
        </div>
    );
}

function TemplateModal({ selectedTemplate, setSelectedTemplate, applyTone, getPitchScore, handleUseTemplate, isPro }) {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-[100] p-4">
            <div className="bg-white dark:bg-gray-800 w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden relative shadow-2xl flex flex-col border dark:border-gray-700">
                <button
                    onClick={() => setSelectedTemplate(null)}
                    className="absolute top-6 right-6 p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-all z-10"
                >
                    <X size={20} />
                </button>

                <div className="overflow-y-auto p-8 sm:p-12">
                    <div className="mb-8">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 mb-2 block">Template Preview</span>
                        <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white leading-none">
                            {selectedTemplate.name}
                        </h2>
                    </div>

                    <div className="relative mb-8 group">
                        <img
                            src={selectedTemplate.image}
                            alt="preview"
                            className="w-full h-64 object-cover rounded-2xl shadow-xl transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
                    </div>

                    <div className="space-y-6">
                        <div className="p-6 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border dark:border-gray-700">
                            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">Draft Content</h3>
                            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed font-medium">
                                {applyTone(selectedTemplate.content)}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-x-8 gap-y-4 items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                                    <span className="text-blue-600 dark:text-blue-400 font-black text-lg">
                                        {getPitchScore(applyTone(selectedTemplate.content))}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Pitch Score</p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">Professional Grade</p>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                {selectedTemplate.sections.map((s, i) => (
                                    <span key={i} className="text-[10px] font-black uppercase tracking-widest bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-gray-500 dark:text-gray-400">
                                        {s}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 sm:p-8 bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-700 flex justify-end gap-4">
                    <button
                        onClick={() => setSelectedTemplate(null)}
                        className="px-8 py-3 rounded-xl font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={() => handleUseTemplate(selectedTemplate)}
                        className="bg-blue-600 text-white px-10 py-3 rounded-xl font-black shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all">
                        {selectedTemplate.pro && !isPro ? "Unlock Pro Template" : "Use This Template"}
                    </button>
                </div>
            </div>
        </div>
    );
}

