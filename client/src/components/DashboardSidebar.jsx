import { useNavigate, useLocation, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import {
    LayoutDashboard,
    BarChart3,
    Sparkles,
    Settings,
    LogOut,
    Menu,
    Feather,
    Users,
    Sun,
    Moon,
} from "lucide-react";

export default function DashboardSidebar({
    open = true,
    onClose = () => { },
    activePath,
    onLogout = () => {
        sessionStorage.clear();
        window.location.href = "/";
    },
}) {
    const navigate = useNavigate();
    const location = useLocation();
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

    const navItems = [
        { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
        { icon: Users, label: "Saved Pitches", path: "/savedpitches" },
        { icon: Sparkles, label: "Templates", path: "/templates" },
        { icon: Feather, label: "Features", path: "/generate" },
        { icon: BarChart3, label: "Analytics", path: "/analytics" },
        { icon: Settings, label: "Settings", path: "/settings" },
    ];

    useEffect(() => {
        if (theme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [theme]);

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
    };

    const toggleSidebar = () => {
        onClose();
    };

    const goTo = (path) => {
        if (window.innerWidth < 1024) {
            onClose();
        }
        navigate(path);
    };

    const userName = sessionStorage.getItem("userName") || "Aman Verma";
    const userEmail = sessionStorage.getItem("userEmail") || "Free Plan";

    return (
        <>
            {/* Mobile Overlay */}
            {open && (
                <button
                    className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden transition-opacity duration-300"
                    onClick={onClose}
                    aria-label="Close sidebar overlay"
                />
            )}

            <aside className={`fixed left-0 top-0 z-50 h-screen border-r border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300 shadow-2xl lg:shadow-none
                ${open ? "w-72 translate-x-0" : "w-72 -translate-x-full lg:w-24 lg:translate-x-0"}`}>

                <div className="flex h-full flex-col">
                    {/* Header / Logo */}
                    <div className={`flex h-24 items-center px-4 transition-all duration-300 ${open ? "justify-between" : "justify-center"}`}>
                        <Link to="/" className={`flex items-center gap-3 overflow-hidden shrink-0 transition-all duration-300 ${!open && "w-0 opacity-0"}`}>
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-sm font-black text-white shadow-lg shadow-blue-600/30">
                                CP
                            </div>
                            <div className="transition-opacity duration-300">
                                <p className="text-lg font-black leading-tight text-blue-700 dark:text-blue-400">ClientPitch</p>
                                <p className="text-sm font-black tracking-[0.22em] text-slate-700 dark:text-slate-300">AI</p>
                            </div>
                        </Link>

                        <button
                            onClick={toggleSidebar}
                            className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-all shadow-sm ${open ? "text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" : "bg-slate-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"}`}
                        >
                            <Menu size={24} />
                        </button>
                    </div>

                    {/* Navigation Items */}
                    <nav className="flex-1 space-y-1.5 px-4 py-6 overflow-y-auto no-scrollbar">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const active = (activePath || location.pathname) === item.path;
                            return (
                                <button
                                    key={item.label}
                                    onClick={() => goTo(item.path)}
                                    title={!open ? item.label : ""}
                                    className={`flex w-full items-center rounded-2xl transition-all duration-300 ${open ? "gap-4 px-4 py-3.5" : "justify-center p-4"} ${active
                                        ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100 dark:shadow-none"
                                        : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                                        }`}
                                >
                                    <Icon size={20} className={`shrink-0 ${active ? "text-white" : "text-slate-400 dark:text-slate-500"}`} />
                                    {open && <span className="text-sm font-bold truncate">{item.label}</span>}
                                </button>
                            );
                        })}
                    </nav>

                    {/* Theme Toggle & User Profile */}
                    <div className="p-4 border-t border-slate-50 dark:border-slate-800 space-y-3">

                        <div className={`flex items-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl transition-all duration-300 ${open ? "p-3 gap-3" : "p-2 justify-center"}`}>
                            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-indigo-100 dark:shadow-none shrink-0">
                                {userName.charAt(0)}
                            </div>
                            {open && (
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-black text-slate-800 dark:text-white truncate">{userName}</p>
                                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 truncate">{userEmail}</p>
                                </div>
                            )}
                            {open && (
                                <button onClick={onLogout} className="p-2 text-slate-300 dark:text-slate-600 hover:text-red-500 transition-colors">
                                    <LogOut size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
