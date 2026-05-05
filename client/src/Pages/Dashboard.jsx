import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
    BarChart3,
    ChevronDown,
    Home,
    LayoutDashboard,
    LogOut,
    Menu,
    MoreVertical,
    Moon,
    Pencil,
    Pin,
    Plus,
    Settings,
    Share2,
    Sparkles,
    Sun,
    Trash2,
    Archive,
    X,
    LayoutGrid,
} from "lucide-react";
import Toast from "../components/Toast";
import DashboardSidebar from "../components/DashboardSidebar";
import InlineMessage from "../components/InlineMessage";

export default function Dashboard() {
    const navigate = useNavigate();

    const [pitches, setPitches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeMenu, setActiveMenu] = useState(null);
    const [renamingId, setRenamingId] = useState(null);
    const [renameValue, setRenameValue] = useState("");
    const [remaining, setRemaining] = useState(5);
    const [plan, setPlan] = useState("free");
    const [showToast, setShowToast] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);
    const [accountOpen, setAccountOpen] = useState(false);
    const [message, setMessage] = useState(null);
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

    const userId = sessionStorage.getItem("userId");
    const userName = sessionStorage.getItem("userName") || "User";
    const firstName = userName.split(" ")[0] || "User";

    const fetchData = useCallback(async () => {
        if (!userId) {
            navigate("/login");
            return;
        }

        setLoading(true);

        try {
            const [pitchesRes, statusRes] = await Promise.all([
                axios.get(`/api/pitches/${userId}`),
                axios.get(`/api/user-status/${userId}`),
            ]);

            const activePitches = pitchesRes.data
                .filter((pitch) => !pitch.isArchived)
                .sort((a, b) => Number(b.isPinned) - Number(a.isPinned));

            setPitches(activePitches);
            setRemaining(statusRes.data.remaining);
            setPlan(statusRes.data.plan || "free");
        } catch (err) {
            console.error("Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    }, [navigate, userId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (theme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
        localStorage.setItem("theme", theme);
    }, [theme]);

    useEffect(() => {
        const closeAccount = (event) => {
            if (!event.target.closest("[data-dashboard-account]")) {
                setAccountOpen(false);
            }
        };

        document.addEventListener("mousedown", closeAccount);
        return () => document.removeEventListener("mousedown", closeAccount);
    }, []);

    const handleLogout = () => {
        sessionStorage.clear();
        navigate("/");
    };

    const toggleTheme = () => {
        setTheme((current) => (current === "dark" ? "light" : "dark"));
    };

    const handleCreateClick = (e) => {
        if (Number(remaining) === 0) {
            e.preventDefault();
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this pitch?")) return;

        try {
            await axios.delete(`/api/pitches/delete/${id}`);
            setPitches((prev) => prev.filter((pitch) => pitch._id !== id));
            setMessage({ tone: "success", text: "Pitch deleted." });
        } catch {
            setMessage({ tone: "error", text: "Error deleting pitch." });
        }

        setActiveMenu(null);
    };

    const startRename = (id) => {
        const pitch = pitches.find((item) => item._id === id);
        setRenamingId(id);
        setRenameValue(pitch?.title || "");
        setActiveMenu(null);
        setMessage(null);
    };

    const cancelRename = () => {
        setRenamingId(null);
        setRenameValue("");
    };

    const handleRename = async (id) => {
        const pitch = pitches.find((item) => item._id === id);
        const newTitle = renameValue.trim();

        if (!newTitle) {
            setMessage({ tone: "error", text: "Enter a pitch title." });
            return;
        }

        if (newTitle === pitch?.title) {
            cancelRename();
            return;
        }

        try {
            const res = await axios.put(`/api/pitches/update/${id}`, {
                title: newTitle,
            });

            setPitches((prev) =>
                prev.map((item) => (item._id === id ? res.data : item))
            );
            setMessage({ tone: "success", text: "Pitch renamed." });
            cancelRename();
        } catch {
            setMessage({ tone: "error", text: "Error renaming pitch." });
        }
    };

    const handleShare = async (id) => {
        try {
            const res = await axios.post(`/api/pitches/share/${id}`);
            navigator.clipboard.writeText(res.data.link);
            setMessage({ tone: "success", text: "Link copied." });
        } catch {
            setMessage({ tone: "error", text: "Share failed." });
        }

        setActiveMenu(null);
    };

    const handlePin = async (id) => {
        try {
            await axios.put(`/api/pitches/pin/${id}`);
            fetchData();
        } catch (err) {
            console.error(err);
        }

        setActiveMenu(null);
    };

    const handleArchive = async (id) => {
        try {
            await axios.put(`/api/pitches/archive/${id}`);
            setPitches((prev) => prev.filter((pitch) => pitch._id !== id));
        } catch (err) {
            console.error(err);
        }

        setActiveMenu(null);
    };

    const today = new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });

    const recentActivity = [...pitches]
        .sort((a, b) => new Date(b.updated || b.createdAt) - new Date(a.updated || a.createdAt))
        .slice(0, 5);

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900 transition-colors duration-300 dark:bg-[#020817] dark:text-slate-100">
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
                            <h2 className="truncate text-3xl font-black text-blue-700 dark:text-blue-300">Dashboard</h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <p className="hidden text-sm font-black text-slate-500 dark:text-slate-300 sm:block">{today}</p>
                        <button
                            onClick={toggleTheme}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                            title="Toggle theme"
                            aria-label="Toggle theme"
                        >
                            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        <div className="relative" data-dashboard-account>
                            <button
                                onClick={() => setAccountOpen((open) => !open)}
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                            >
                                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-black text-white">
                                    {firstName.charAt(0).toUpperCase()}
                                </span>
                                <span className="hidden sm:inline">Hello, {firstName}</span>
                                <Sparkles size={16} className="text-blue-500" />
                                <ChevronDown size={15} className={`text-slate-400 transition ${accountOpen ? "rotate-180" : ""}`} />
                            </button>

                            {accountOpen && (
                                <div className="absolute right-0 top-14 z-50 w-44 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-800">
                                    <button
                                        onClick={() => {
                                            setAccountOpen(false);
                                            navigate("/settings");
                                        }}
                                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-bold text-slate-700 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-700"
                                    >
                                        <Settings size={16} />
                                        Settings
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                                    >
                                        <LogOut size={16} />
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <main className="px-4 py-8 sm:px-6 lg:px-8">
                    <section>
                        <div>
                            <h1 className="text-4xl font-black tracking-tight text-blue-700 dark:text-blue-300">
                                Welcome back, {userName}
                            </h1>
                            <p className="mt-3 text-sm font-black uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                                Your proposal stats
                            </p>
                        </div>

                        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
                            <StatCard title="Active Pitches" value={pitches.length} />
                            <StatCard title="Pitches Left Today" value={remaining} />
                            <StatCard title="Account Plan" value={plan === "pro" ? "Pro" : "Free"} />
                        </div>
                    </section>

                    <section className="mt-16">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <h2 className="text-3xl font-black text-blue-700 dark:text-blue-300">
                                    Active Proposals
                                </h2>
                                <p className="mt-2 text-xl font-medium text-slate-600 dark:text-slate-300">
                                    Manage and track your generated pitches
                                </p>
                            </div>

                            <Link
                                to="/templateselect"
                                onClick={handleCreateClick}
                                className="inline-flex w-full items-center justify-center gap-3 rounded-xl bg-blue-600 px-8 py-4 text-lg font-black text-white shadow-xl shadow-blue-600/20 transition hover:bg-blue-700 sm:w-auto"
                            >
                                <Plus size={24} />
                                Create New Pitch
                            </Link>
                        </div>

                        {message && (
                            <InlineMessage tone={message.tone} className="mt-6">
                                {message.text}
                            </InlineMessage>
                        )}

                        <div className="mt-10">
                            {loading ? (
                                <p className="italic text-slate-400 dark:text-slate-500">Loading proposals...</p>
                            ) : pitches.length === 0 ? (
                                <p className="italic text-slate-500 dark:text-slate-400">No active proposals found.</p>
                            ) : (
                                <div className="grid gap-5 xl:grid-cols-3">
                                    {pitches.map((item) => (
                                        <ProposalCard
                                            key={item._id}
                                            item={item}
                                            activeMenu={activeMenu}
                                            onArchive={handleArchive}
                                            onCancelRename={cancelRename}
                                            onDelete={handleDelete}
                                            onMenu={setActiveMenu}
                                            onPin={handlePin}
                                            onRename={handleRename}
                                            onRenameValue={setRenameValue}
                                            onShare={handleShare}
                                            onStartRename={startRename}
                                            renameValue={renameValue}
                                            renaming={renamingId === item._id}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="mt-16">
                        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <h2 className="text-2xl font-black text-blue-700 dark:text-blue-300">Recent Activity</h2>
                            <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                                Track your latest pitch updates and actions
                            </p>

                            <div className="mt-6 space-y-4">
                                {recentActivity.length === 0 ? (
                                    <p className="italic text-slate-400 dark:text-slate-500">No activity yet.</p>
                                ) : (
                                    recentActivity.map((item) => (
                                        <div key={item._id} className="flex items-start gap-4">
                                            <div className="mt-1 h-3 w-3 rounded-full bg-blue-600 shadow-[0_0_0_4px_rgba(37,99,235,0.12)]" />
                                            <div>
                                                <p className="font-bold text-slate-800 dark:text-slate-100">
                                                    {item.lastAction || "Updated"}: {item.title || "Untitled pitch"}
                                                </p>
                                                <p className="text-sm text-slate-400 dark:text-slate-500">
                                                    {item.template || "Standard"} template
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </section>
                </main>
            </div>

            <Toast
                show={showToast}
                message="Daily limit reached!"
                onClose={() => setShowToast(false)}
            />
        </div>
    );
}



function StatCard({ title, value }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white px-8 py-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                {title}
            </p>
            <h3 className="mt-5 text-4xl font-black text-blue-700 dark:text-blue-300">{value}</h3>
        </div>
    );
}

function ProposalCard({
    item,
    activeMenu,
    onArchive,
    onCancelRename,
    onDelete,
    onMenu,
    onPin,
    onRename,
    onRenameValue,
    onShare,
    onStartRename,
    renameValue,
    renaming,
}) {
    const navigate = useNavigate();

    return (
        <div className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    {renaming ? (
                        <input
                            autoFocus
                            value={renameValue}
                            onChange={(event) => onRenameValue(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === "Enter") onRename(item._id);
                                if (event.key === "Escape") onCancelRename();
                            }}
                            className="w-full rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-lg font-black text-slate-900 outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-slate-100"
                        />
                    ) : (
                        <h3 className="truncate text-lg font-black text-slate-900 dark:text-slate-100">
                            {item.title || "Untitled pitch"}
                        </h3>
                    )}
                    <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">
                        {item.company || item.clientName || "No client name"}
                    </p>
                    {item.isPinned && (
                        <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-600">
                            <Pin size={12} />
                            Pinned
                        </span>
                    )}
                </div>

                <button
                    onClick={() => onMenu(activeMenu === item._id ? null : item._id)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-gray-800 dark:hover:text-blue-300"
                >
                    <MoreVertical size={18} />
                </button>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
                {renaming ? (
                    <>
                        <button
                            onClick={() => onRename(item._id)}
                            className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-bold text-white hover:bg-blue-700"
                        >
                            Save
                        </button>
                        <button
                            onClick={onCancelRename}
                            className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 dark:bg-gray-800 dark:text-slate-300"
                        >
                            Cancel
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={() => navigate("/result", { state: { pitch: item } })}
                            className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
                        >
                            View
                        </button>
                        <button
                            onClick={() => navigate("/create", { state: { pitch: item } })}
                            className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-sm font-bold text-slate-600 dark:bg-gray-800 dark:text-slate-300"
                        >
                            <Pencil size={14} />
                            Edit
                        </button>
                    </>
                )}
            </div>

            {activeMenu === item._id && (
                <div className="absolute right-5 top-14 z-20 w-40 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-gray-800 dark:bg-gray-900">
                    <MenuButton icon={Pencil} label="Rename" onClick={() => onStartRename(item._id)} />
                    <MenuButton icon={Pin} label="Pin" onClick={() => onPin(item._id)} />
                    <MenuButton icon={Archive} label="Archive" onClick={() => onArchive(item._id)} />
                    <MenuButton icon={Share2} label="Share" onClick={() => onShare(item._id)} />
                    <MenuButton icon={Trash2} label="Delete" danger onClick={() => onDelete(item._id)} />
                </div>
            )}
        </div>
    );
}

function MenuButton({ danger = false, icon: Icon, label, onClick }) {
    const ButtonIcon = Icon;

    return (
        <button
            onClick={onClick}
            className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-bold transition ${danger
                ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                : "text-slate-600 hover:bg-slate-50 hover:text-blue-600 dark:text-slate-300 dark:hover:bg-gray-800 dark:hover:text-blue-300"
                }`}
        >
            <ButtonIcon size={15} />
            {label}
        </button>
    );
}
