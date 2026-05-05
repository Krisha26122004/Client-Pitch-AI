import { useLocation, useNavigate } from "react-router-dom";
import { useCallback, useState, useEffect } from "react";
import axios from "axios";
import { ArrowLeft, Archive, Eye, LogOut, Moon, RotateCcw, Sun, Bell, Shield, Trash2, Wallet, Sliders, Menu } from "lucide-react";
import DashboardSidebar from "../components/DashboardSidebar";
import Navbar from "../components/Navbar";
import InlineMessage from "../components/InlineMessage";

export default function Settings() {
    const navigate = useNavigate();
    const location = useLocation();

    // Initialize dark mode from localStorage if available
    const [darkMode, setDarkMode] = useState(() => {
        return document.documentElement.classList.contains("dark");
    });
    const [notifications, setNotifications] = useState(true);
    const [archivedPitches, setArchivedPitches] = useState([]);
    const [archivesLoading, setArchivesLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);
    const [message, setMessage] = useState(null);
    const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";

    const userId = sessionStorage.getItem("userId");
    const userName = sessionStorage.getItem("userName") || "User";
    const userEmail = sessionStorage.getItem("userEmail") || "you@example.com";

    const fetchArchivedPitches = useCallback(async () => {
        if (!userId) {
            setArchivesLoading(false);
            return;
        }

        try {
            setArchivesLoading(true);
            const res = await axios.get(`/api/pitches/${userId}`);
            setArchivedPitches(res.data.filter((pitch) => pitch.isArchived));
        } catch (error) {
            console.error("Archived pitches error:", error);
        } finally {
            setArchivesLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    }, [darkMode]);

    useEffect(() => {
        fetchArchivedPitches();
    }, [fetchArchivedPitches]);

    const handleLogout = () => {
        sessionStorage.clear();
        navigate("/");
    };

    const handleUnarchive = async (pitchId) => {
        try {
            await axios.put(`/api/pitches/archive/${pitchId}`);
            setArchivedPitches((prev) => prev.filter((pitch) => pitch._id !== pitchId));
            setMessage({ tone: "success", text: "Pitch restored." });
        } catch (error) {
            console.error("Unarchive error:", error);
            setMessage({ tone: "error", text: "Could not restore this pitch." });
        }
    };

    const handleDeleteArchived = async (pitchId) => {
        if (!window.confirm("Delete this archived pitch permanently?")) return;

        try {
            await axios.delete(`/api/pitches/delete/${pitchId}`);
            setArchivedPitches((prev) => prev.filter((pitch) => pitch._id !== pitchId));
            setMessage({ tone: "success", text: "Pitch deleted." });
        } catch (error) {
            console.error("Delete archived error:", error);
            setMessage({ tone: "error", text: "Could not delete this pitch." });
        }
    };

    // Define the content inside the component to access variables like userName
    const childrenContent = (
        <SettingsContent
            userName={userName}
            userEmail={userEmail}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            notifications={notifications}
            setNotifications={setNotifications}
            archivesLoading={archivesLoading}
            archivedPitches={archivedPitches}
            navigate={navigate}
            currentPath={location.pathname}
            handleUnarchive={handleUnarchive}
            handleDeleteArchived={handleDeleteArchived}
            message={message}
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
                                    <h2 className="truncate text-3xl font-black text-blue-700 dark:text-blue-300">Settings</h2>
                                </div>
                            </div>
                        </header>
                        <main className="px-4 py-8 sm:px-6 lg:px-8">
                            {childrenContent}
                        </main>
                    </div>
                </>
            ) : (
                <>
                    <Navbar />
                    <div className="pt-24 sm:pt-32 p-6">
                        {childrenContent}
                    </div>
                </>
            )}
        </div>
    );
}

// Extract the main settings content to reuse between logged-in and logged-out views
function SettingsContent({ userName, userEmail, darkMode, setDarkMode, notifications, setNotifications, archivesLoading, archivedPitches, navigate, currentPath, handleUnarchive, handleDeleteArchived, message }) {
    return (
        <>
            {/* HEADER */}
            <div className="flex items-center gap-3 mb-8 max-w-2xl mx-auto">
                <h1 className="text-3xl font-black text-blue-800 dark:text-blue-300 tracking-tight">System Preferences</h1>
            </div>

            {/* MAIN CARD */}
            <div className="max-w-2xl mx-auto space-y-6">
                {message && (
                    <InlineMessage tone={message.tone}>
                        {message.text}
                    </InlineMessage>
                )}

                {/* USER INFO */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
                    <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        <Shield size={18} className="text-blue-500" />
                        Profile Information
                    </h2>
                    <div className="space-y-3 text-base">
                        <p className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center py-2 border-b border-gray-100 dark:border-gray-700">
                            <span className="text-gray-500 dark:text-gray-400 font-medium">Name</span>
                            <span className="font-medium">{userName}</span>
                        </p>
                        <p className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center py-2">
                            <span className="text-gray-500 dark:text-gray-400 font-medium">Email</span>
                            <span className="font-medium">{userEmail}</span>
                        </p>
                    </div>
                </div>

                {/* Preferences */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
                    <h2 className="font-semibold text-lg mb-5 flex items-center gap-2">
                        <Sliders size={18} className="text-blue-500" />
                        Preferences
                    </h2>
                    <div className="space-y-6">
                        
                        {/* Notifications */}
                        <div className="flex justify-between items-center group">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    <Bell size={18} />
                                </div>
                                <div>
                                    <h3 className="font-medium">Push Notifications</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Receive alerts on updates</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setNotifications(!notifications)}
                                className={`w-14 h-7 flex items-center rounded-full p-1 transition-colors duration-300 ${notifications ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"
                                    }`}
                            >
                                <div
                                    className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${notifications ? "translate-x-7" : "translate-x-0"
                                        }`}
                                />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Archives */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
                    <h2 className="font-semibold text-lg mb-5 flex items-center gap-2">
                        <Archive size={18} className="text-blue-500" />
                        Archived Pitches
                    </h2>
                    {archivesLoading ? (
                        <p className="text-sm italic text-gray-500 dark:text-gray-400">Loading archived pitches...</p>
                    ) : archivedPitches.length === 0 ? (
                        <p className="text-sm italic text-gray-500 dark:text-gray-400">No archived pitches yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {archivedPitches.map((pitch) => (
                                <div
                                    key={pitch._id}
                                    className="flex items-center justify-between gap-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 p-4"
                                >
                                    <div className="min-w-0">
                                        <h3 className="font-semibold truncate">{pitch.title || "Untitled pitch"}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                            {pitch.company || pitch.clientName || "No client name"}
                                        </p>
                                    </div>
                                    <div className="shrink-0 flex items-center gap-2">
                                        <button
                                            onClick={() => navigate("/result", { state: { pitch, form: pitch } })}
                                            className="inline-flex items-center gap-2 rounded-lg bg-white dark:bg-gray-800 px-3 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                        >
                                            <Eye size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleUnarchive(pitch._id)}
                                            className="inline-flex items-center gap-2 rounded-lg bg-blue-50 dark:bg-blue-500/10 px-3 py-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition"
                                        >
                                            <RotateCcw size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteArchived(pitch._id)}
                                            className="inline-flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Plan */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 rounded-2xl shadow-md transition-colors duration-300 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-20">
                        <Wallet size={100} className="transform translate-x-4 -translate-y-8" />
                    </div>
                    <h2 className="font-semibold text-lg mb-2 relative z-10">Subscription Plan</h2>
                    <div className="mb-6 relative z-10">
                        <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm shadow-sm mb-2">Free Tier</span>
                        <p className="text-blue-100 text-sm">Upgrade to unlock premium AI models and export options.</p>
                    </div>
                    <button
                        onClick={() => navigate("/payment", { state: { from: currentPath } })}
                        className="w-full bg-white text-indigo-600 font-semibold py-3 rounded-xl shadow-sm hover:shadow-md hover:bg-gray-50 transition-all active:scale-[0.98] relative z-10"
                    >
                        Upgrade to Pro 🚀
                    </button>
                </div>
            </div>
        </>
    );
}
