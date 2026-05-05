import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
    Bookmark,
    ChevronDown,
    Download,
    Eye,
    FileText,
    Globe,
    Grid,
    List,
    Megaphone,
    Pencil,
    Pin,
    Plus,
    Search,
    Share2,
    Smartphone,
    Tag,
    Trash2,
    Upload,
} from "lucide-react";
import DashboardSidebar from "../components/DashboardSidebar";
import InlineMessage from "../components/InlineMessage";

const categories = [
    "All",
    "Website Development",
    "Marketing",
    "Branding",
    "SEO",
    "Content Writing",
    "Mobile App",
    "Other",
];

const dateRanges = [
    { label: "All time", value: "all" },
    { label: "Latest 1 month", value: "month" },
    { label: "Latest 3 months", value: "quarter" },
    { label: "Latest 1 year", value: "year" },
];

const sortOptions = [
    { label: "Latest first", value: "latest" },
    { label: "Oldest first", value: "oldest" },
    { label: "Client A-Z", value: "client" },
    { label: "Title A-Z", value: "title" },
];

export default function SavedPitches() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [pitches, setPitches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);
    const [category, setCategory] = useState("All");
    const [dateRange, setDateRange] = useState("month");
    const [sortBy, setSortBy] = useState("latest");
    const [viewMode, setViewMode] = useState("grid");
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetchPitches();
    }, []);

    const fetchPitches = async () => {
        const userId = sessionStorage.getItem("userId");
        if (!userId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const res = await axios.get(`/api/pitches/${userId}`);
            setPitches(res.data || []);
        } catch (err) {
            console.error("Failed to fetch pitches:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        sessionStorage.clear();
        navigate("/");
    };

    const getPitchDate = (pitch) => new Date(pitch.updated || pitch.updatedAt || pitch.createdAt || 0);

    const filteredPitches = useMemo(() => {
        const now = new Date();
        const query = search.trim().toLowerCase();

        return pitches
            .filter((pitch) => !pitch.isArchived)
            .filter((pitch) => {
                if (!query) return true;
                const searchableClient = [
                    pitch.clientName,
                    pitch.company,
                    getClientName(pitch),
                ].filter(Boolean).join(" ").toLowerCase();
                return searchableClient.includes(query);
            })
            .filter((pitch) => {
                if (category === "All") return true;
                return getPitchCategory(pitch) === category;
            })
            .filter((pitch) => {
                if (dateRange === "all") return true;
                const created = getPitchDate(pitch);
                const days = dateRange === "month" ? 31 : dateRange === "quarter" ? 93 : 366;
                return now - created <= days * 24 * 60 * 60 * 1000;
            })
            .sort((a, b) => {
                if (sortBy === "oldest") return getPitchDate(a) - getPitchDate(b);
                if (sortBy === "client") return getClientName(a).localeCompare(getClientName(b));
                if (sortBy === "title") return getTitle(a).localeCompare(getTitle(b));
                return getPitchDate(b) - getPitchDate(a);
            });
    }, [category, dateRange, pitches, search, sortBy]);

    const handleDelete = async (pitchId) => {
        if (!window.confirm("Delete this saved pitch?")) return;

        try {
            await axios.delete(`/api/pitches/delete/${pitchId}`);
            setPitches((prev) => prev.filter((pitch) => pitch._id !== pitchId));
            setMessage({ tone: "success", text: "Pitch deleted." });
        } catch (err) {
            console.error("Failed to delete pitch:", err);
            setMessage({ tone: "error", text: "Could not delete this pitch." });
        }
    };

    const handlePin = async (pitchId) => {
        try {
            const res = await axios.put(`/api/pitches/pin/${pitchId}`);
            setPitches((prev) => prev.map((pitch) => (pitch._id === pitchId ? res.data : pitch)));
            setMessage({ tone: "success", text: "Saved status updated." });
        } catch (err) {
            console.error("Failed to save pitch:", err);
            setMessage({ tone: "error", text: "Could not update saved status." });
        }
    };

    const handleShare = async (pitchId) => {
        try {
            const res = await axios.post(`/api/pitches/share/${pitchId}`);
            const link = res.data.link;
            try {
                await navigator.clipboard.writeText(link);
                setMessage({ tone: "success", text: "Share link copied." });
            } catch (clipboardError) {
                window.prompt("Copy this share link:", link);
            }
        } catch (err) {
            console.error("Failed to share pitch:", err);
            setMessage({ tone: "error", text: "Could not share this pitch." });
        }
    };

    const handleDownload = (pitch) => {
        const body = [
            getTitle(pitch),
            `Client: ${getClientName(pitch)}`,
            `Category: ${getPitchCategory(pitch)}`,
            "",
            pitch.content || formatSections(pitch.sections) || pitch.description || "No content available.",
        ].join("\n");

        const blob = new Blob([body], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${getTitle(pitch).replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "pitch"}.txt`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleImportPitch = async (event) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;

        const userId = sessionStorage.getItem("userId");
        if (!userId) {
            setMessage({ tone: "error", text: "Please login first." });
            return;
        }

        try {
            const text = await file.text();
            let imported = {};

            try {
                imported = JSON.parse(text);
            } catch {
                imported = {
                    title: file.name.replace(/\.[^.]+$/, ""),
                    content: text,
                };
            }

            const res = await axios.post("/api/pitches/create", {
                userId,
                title: imported.title || file.name.replace(/\.[^.]+$/, ""),
                clientName: imported.clientName || imported.company || "Imported Client",
                company: imported.company || imported.clientName || "Imported Client",
                projectType: imported.projectType || imported.category || "Other",
                content: imported.content || formatSections(imported.sections) || text,
                sections: imported.sections,
                template: imported.template || "Imported",
            });

            setPitches((prev) => [res.data.pitch, ...prev]);
            setMessage({ tone: "success", text: "Pitch imported." });
        } catch (err) {
            console.error("Failed to import pitch:", err);
            setMessage({ tone: "error", text: "Could not import this pitch." });
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-[#020817] dark:text-slate-100">
            <DashboardSidebar
                open={sidebarOpen}
                onClose={() => setSidebarOpen((open) => !open)}
                onLogout={handleLogout}
            />

            <div className={`min-h-screen transition-all duration-300 ${sidebarOpen ? "lg:pl-72" : "lg:pl-24"}`}>
                <main className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-10">
                    <div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-sm dark:bg-indigo-500/10 dark:text-indigo-300">
                                <Bookmark size={24} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Saved Pitches</h1>
                                <p className="mt-1 text-sm font-bold text-slate-500 dark:text-slate-400">
                                    Search, filter, edit, download, share, or delete your saved client pitches.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <input ref={fileInputRef} type="file" accept=".txt,.json" className="hidden" onChange={handleImportPitch} />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-600 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                            >
                                <Upload size={18} />
                                Import Pitch
                            </button>
                            <button
                                onClick={() => navigate("/create")}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-black text-white shadow-xl shadow-indigo-600/20 transition hover:bg-indigo-700"
                            >
                                <Plus size={19} />
                                Create New Pitch
                            </button>
                        </div>
                    </div>

                    {message && (
                        <InlineMessage tone={message.tone} className="mb-6">
                            {message.text}
                        </InlineMessage>
                    )}

                    <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="grid gap-3 lg:grid-cols-[1fr_220px_190px_180px_auto]">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search by client name..."
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    className="h-12 w-full rounded-xl border border-slate-100 bg-slate-50 pl-12 pr-4 text-sm font-bold outline-none transition focus:border-indigo-200 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-indigo-500"
                                />
                            </div>

                            <SelectControl icon={Grid} label={category} value={category} onChange={setCategory} options={categories.map((item) => ({ label: item, value: item }))} />
                            <SelectControl icon={ChevronDown} label={dateRanges.find((item) => item.value === dateRange)?.label} value={dateRange} onChange={setDateRange} options={dateRanges} />
                            <SelectControl icon={ChevronDown} label={sortOptions.find((item) => item.value === sortBy)?.label} value={sortBy} onChange={setSortBy} options={sortOptions} />

                            <div className="flex rounded-xl bg-slate-50 p-1 dark:bg-slate-950">
                                <button
                                    onClick={() => setViewMode("grid")}
                                    className={`rounded-lg p-2.5 transition ${viewMode === "grid" ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-800" : "text-slate-400"}`}
                                    aria-label="Grid view"
                                >
                                    <Grid size={18} />
                                </button>
                                <button
                                    onClick={() => setViewMode("list")}
                                    className={`rounded-lg p-2.5 transition ${viewMode === "list" ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-800" : "text-slate-400"}`}
                                    aria-label="List view"
                                >
                                    <List size={18} />
                                </button>
                            </div>
                        </div>
                    </section>

                    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                            Showing <span className="text-slate-900 dark:text-white">{filteredPitches.length}</span> of {pitches.filter((pitch) => !pitch.isArchived).length} pitches
                        </p>
                        <button
                            onClick={() => {
                                setSearch("");
                                setCategory("All");
                                setDateRange("month");
                                setSortBy("latest");
                            }}
                            className="rounded-lg px-3 py-2 text-sm font-black text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
                        >
                            Reset filters
                        </button>
                    </div>

                    {loading ? (
                        <div className="rounded-3xl border border-slate-200 bg-white p-16 text-center font-bold text-slate-400 dark:border-slate-800 dark:bg-slate-900">
                            Loading saved pitches...
                        </div>
                    ) : filteredPitches.length > 0 ? (
                        <div className={viewMode === "grid" ? "grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4" : "space-y-4"}>
                            {filteredPitches.map((pitch) => (
                                <PitchCard
                                    key={pitch._id}
                                    pitch={pitch}
                                    viewMode={viewMode}
                                    onDelete={handleDelete}
                                    onDownload={handleDownload}
                                    onEdit={(item) => navigate("/create", { state: { pitch: item } })}
                                    onPin={handlePin}
                                    onShare={handleShare}
                                    onView={(item) => navigate("/result", { state: { pitch: item } })}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-[32px] border-2 border-dashed border-slate-200 bg-white p-16 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-500/10">
                                <FileText size={40} className="text-indigo-300" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white">No saved pitches found</h3>
                            <p className="mx-auto mt-2 max-w-sm text-sm font-bold leading-relaxed text-slate-400">
                                Try changing your search or filters, or create a new pitch for a client.
                            </p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

function SelectControl({ icon, label, value, onChange, options }) {
    const SelectIcon = icon;
    return (
        <label className="relative block">
            <SelectIcon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <select
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="h-12 w-full appearance-none rounded-xl border border-slate-100 bg-white pl-11 pr-9 text-sm font-black text-slate-600 outline-none transition hover:border-indigo-200 focus:border-indigo-300 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
            <span className="sr-only">{label}</span>
        </label>
    );
}

function PitchCard({ pitch, viewMode, onDelete, onDownload, onEdit, onPin, onShare, onView }) {
    const category = getPitchCategory(pitch);
    const compact = viewMode === "list";

    return (
        <article className={`border border-slate-200 bg-white shadow-sm transition hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 ${compact ? "flex flex-col gap-4 rounded-2xl p-5 lg:flex-row lg:items-center" : "flex h-full flex-col rounded-[28px] p-5"}`}>
            <div className={`flex ${compact ? "flex-1 items-center gap-4" : "mb-5 items-start justify-between"}`}>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
                    {getCategoryIcon(category)}
                </div>
                <div className="min-w-0 flex-1">
                    <h3 className="truncate text-lg font-black text-slate-900 dark:text-white">{getTitle(pitch)}</h3>
                    <p className="mt-1 truncate text-xs font-black uppercase tracking-[0.14em] text-slate-400">{getClientName(pitch)}</p>
                </div>
                {!compact && (
                    <span className="rounded-full bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500 dark:bg-slate-950">
                        {pitch.isPinned ? "Saved" : "Draft"}
                    </span>
                )}
            </div>

            <div className={compact ? "flex flex-wrap items-center gap-3 lg:w-80" : "flex-1"}>
                <span className="inline-flex rounded-lg bg-indigo-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
                    {category}
                </span>
                <span className="text-xs font-bold text-slate-400">
                    {formatDate(getPitchDate(pitch))}
                </span>
            </div>

            <div className={`flex gap-2 ${compact ? "lg:w-[330px]" : "mt-6 border-t border-slate-100 pt-4 dark:border-slate-800"}`}>
                <ActionButton title="View" icon={Eye} onClick={() => onView(pitch)} />
                <ActionButton title="Save" icon={Pin} active={pitch.isPinned} onClick={() => onPin(pitch._id)} />
                <ActionButton title="Edit" icon={Pencil} onClick={() => onEdit(pitch)} />
                <ActionButton title="Download" icon={Download} onClick={() => onDownload(pitch)} />
                <ActionButton title="Share" icon={Share2} onClick={() => onShare(pitch._id)} />
                <ActionButton title="Delete" icon={Trash2} danger onClick={() => onDelete(pitch._id)} />
            </div>
        </article>
    );
}

function ActionButton({ active = false, danger = false, icon, title, onClick }) {
    const ActionIcon = icon;
    return (
        <button
            onClick={onClick}
            title={title}
            className={`flex h-10 flex-1 items-center justify-center rounded-xl transition ${danger
                    ? "bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-500/10"
                    : active
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-950 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-300"
                }`}
        >
            <ActionIcon size={17} />
        </button>
    );
}

function getTitle(pitch) {
    return pitch.title || `${pitch.projectType || "Project"} Pitch`;
}

function getClientName(pitch) {
    if (pitch.clientName) return pitch.clientName;
    if (pitch.company) return pitch.company;
    const titleMatch = (pitch.title || "").match(/\bfor\s+(.+)$/i);
    return titleMatch?.[1]?.trim() || "Unknown Client";
}

function getPitchDate(pitch) {
    return new Date(pitch.updated || pitch.updatedAt || pitch.createdAt || 0);
}

function getPitchCategory(pitch) {
    const raw = pitch.category || pitch.projectType || pitch.template || "Other";
    const value = raw.toLowerCase();
    if (value.includes("web")) return "Website Development";
    if (value.includes("market")) return "Marketing";
    if (value.includes("brand")) return "Branding";
    if (value.includes("seo")) return "SEO";
    if (value.includes("content") || value.includes("writing")) return "Content Writing";
    if (value.includes("mobile") || value.includes("app")) return "Mobile App";
    return categories.includes(raw) ? raw : "Other";
}

function getCategoryIcon(category) {
    if (category === "Website Development") return <Globe size={22} />;
    if (category === "Marketing") return <Megaphone size={22} />;
    if (category === "Branding") return <Tag size={22} />;
    if (category === "Mobile App") return <Smartphone size={22} />;
    return <FileText size={22} />;
}

function formatDate(date) {
    if (!date || Number.isNaN(date.getTime())) return "No date";
    return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function formatSections(sections = []) {
    if (!Array.isArray(sections)) return "";
    return sections.map((section) => `${section.title || "Section"}\n${section.body || ""}`).join("\n\n");
}
