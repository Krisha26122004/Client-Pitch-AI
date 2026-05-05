import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
    LayoutDashboard, Sparkles, Settings, BarChart3, Home, Menu,
    TrendingUp, Share2, Pin, Archive, Plus, LogOut, ChevronRight,
    Target, Zap, Clock, Star
} from "lucide-react";
import { motion } from "framer-motion";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import DashboardSidebar from "../components/DashboardSidebar";

const MotionH1 = motion.h1;
const MotionDiv = motion.div;

export default function Analytics() {
    const userId = sessionStorage.getItem("userId");
    console.log("USER ID", userId);

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);
    const navigate = useNavigate();
    const location = useLocation();

    const fetchAnalytics = useCallback(async () => {
        if (!userId) {
            console.error("No UserID found in sessionStorage!");
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            console.log("Requesting Analytics for:", userId);
            const res = await axios.get(`/api/analytics-data/${userId}`);
            console.log("Analytics Received:", res.data);
            setData(res.data);
        } catch (error) {
            console.error("Error fetching analytics:", error);
            // Show zeros instead of a crash
            setData({
                totalPitches: 0,
                totalShares: 0,
                pinned: 0,
                archived: 0,
                pitchTrends: {},
                topPinned: [],
                topShared: [],
                recent: [],
                used: 0
            });
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    const handleLogout = () => {
        sessionStorage.clear();
        navigate("/");

    };

    // Format chart data
    const chartData = data ? Object.entries(data?.pitchTrends || {}).map(([date, count]) => ({
        name: date,
        pitches: count
    })) : [];
    const pieData = [
        { name: "Pinned", value: data?.pinned || 0, color: "#f59e0b" },
        { name: "Archived", value: data?.archived || 0, color: "#64748b" },
        { name: "Shared", value: data?.totalShares || 0, color: "#4f46e5" },
        {
            name: "Drafts",
            value: Math.max(0, (data?.totalPitches || 0) - (data?.pinned || 0) - (data?.archived || 0)),
            color: "#2563eb"
        },
    ].filter((item) => item.value > 0);
    const displayPieData = pieData.length ? pieData : [{ name: "No data", value: 1, color: "#e2e8f0" }];

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-gray-950">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Analyzing your data...</p>
            </div>
        </div>
    );

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
                            <h2 className="truncate text-3xl font-black text-blue-700 dark:text-blue-300">Analytics</h2>
                        </div>
                    </div>
                </header>

                <main className="px-4 py-8 sm:px-6 lg:px-8">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100">Analytics Overview ✨</h1>
                            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Deep insights into your pitch performance and usage.</p>
                        </div>
                        <div className="flex gap-3">
                            <button className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all dark:border-gray-800 dark:bg-gray-900 dark:text-slate-200 dark:hover:bg-gray-800">
                                Download PDF
                            </button>
                            <button onClick={() => navigate("/templateselect")} className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 active:scale-95 transition-all">
                                New Pitch
                            </button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard icon={Target} title="Total Pitches" value={data?.totalPitches} color="blue" />
                        <StatCard icon={Share2} title="Total Shares" value={data?.totalShares} color="indigo" />
                        <StatCard icon={Pin} title="Pinned Items" value={data?.pinned} color="amber" />
                        <StatCard icon={Archive} title="Archived" value={data?.archived} color="slate" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <MiniMetric label="Active Pitches" value={data?.active || 0} />
                        <MiniMetric label="Most Used Template" value={data?.templateStats?.[0]?.name || "Standard"} />
                        <MiniMetric label="Weekly Activity" value={`${chartData.reduce((sum, item) => sum + item.pitches, 0)} pitches`} />
                    </div>

                    {/* Main Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

                        {/* Line Chart */}

                        <div className="lg:col-span-2 min-w-0 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                    <TrendingUp className="text-blue-600" size={20} />
                                    Pitch Creation Trends
                                </h2>
                                <select className="bg-slate-50 border-none text-xs font-bold rounded-lg px-3 py-1.5 focus:ring-2 ring-blue-500/20 dark:bg-gray-800 dark:text-slate-200">
                                    <option>Last 7 Days</option>
                                    <option>Last 30 Days</option>
                                </select>
                            </div>
                            <div className="w-full min-w-0">
                                <ResponsiveContainer width="100%" height={300} minWidth={0}>
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorPitches" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', background: '#fff' }}
                                        />
                                        <Area type="monotone" dataKey="pitches" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorPitches)" isAnimationActive={false} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Usage Progress */}
                        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-3xl text-white shadow-xl flex flex-col justify-between">
                            <div>
                                <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
                                    <Zap size={24} />
                                </div>
                                <h2 className="text-xl font-black mb-2">Usage Tracker</h2>
                                <p className="text-indigo-100 text-sm font-medium">Daily free limit usage</p>
                            </div>

                            <div className="my-8">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-4xl font-black">{(data?.used || 0)} <span className="text-lg text-indigo-200">/ 5</span></span>
                                    <span className="text-sm font-bold text-indigo-100">{Math.round(((data?.used || 0) / 5) * 100)}% Used</span>
                                </div>
                                <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                                    <MotionDiv
                                        initial={{ width: 0 }}
                                        animate={{ width: `${((data?.used || 0) / 5) * 100}%` }}
                                        className="h-full bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                                    />
                                </div>
                            </div>

                        <button onClick={() => navigate("/payment", { state: { from: location.pathname } })} className="w-full bg-white text-blue-700 py-4 rounded-2xl font-black text-sm hover:shadow-2xl transition-all active:scale-95">
                                UPGRADE TO PRO
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                        <div className="lg:col-span-2 min-w-0 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                    <Target className="text-blue-600" size={20} />
                                    Pitch Distribution
                                </h2>
                                <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                    Pie Chart
                                </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                                <div className="w-full min-w-0">
                                    <ResponsiveContainer width="100%" height={280} minWidth={0}>
                                        <PieChart>
                                            <Pie
                                                data={displayPieData}
                                                dataKey="value"
                                                nameKey="name"
                                                innerRadius={70}
                                                outerRadius={110}
                                                paddingAngle={4}
                                                isAnimationActive={false}
                                            >
                                                {displayPieData.map((entry) => (
                                                    <Cell key={entry.name} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', background: '#fff' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="space-y-4">
                                    {displayPieData.map((item) => (
                                        <div key={item.name} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 dark:bg-gray-800">
                                            <span className="flex items-center gap-3 text-sm font-bold text-slate-600 dark:text-slate-300">
                                                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                                                {item.name}
                                            </span>
                                            <span className="text-lg font-black text-slate-800 dark:text-slate-100">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                            <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
                                <Target className="text-blue-600" size={20} />
                                Performance Snapshot
                            </h2>
                            <div className="space-y-5">
                                <SnapshotRow label="Share Rate" value={`${data?.totalPitches ? Math.round((data.totalShares / data.totalPitches) * 100) : 0}%`} />
                                <SnapshotRow label="Pinned Ratio" value={`${data?.totalPitches ? Math.round((data.pinned / data.totalPitches) * 100) : 0}%`} />
                                <SnapshotRow label="Remaining Today" value={`${Math.max(0, 5 - (data?.used || 0))}`} />
                            </div>
                        </div>
                    </div>

                    {/* Lists Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                        {/* Top Shared */}
                        <ListCard title="Most Shared" icon={Share2} items={data?.topShared?.map(p => ({ label: p.title, value: `${p.shares} shares` }))} />

                        {/* Top Pinned */}
                        <ListCard title="Recently Pinned" icon={Star} items={data?.topPinned?.map(p => ({ label: p.title, value: "📌" }))} />

                        {/* Recent Activity */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                            <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
                                <Clock className="text-blue-600" size={20} />
                                Recent Activity
                            </h2>
                            <div className="space-y-4">
                                {data?.recent?.map((activity, i) => (
                                    <div key={i} className="flex gap-3">
                                        <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500 shrink-0 shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
                                        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{activity}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <ListCard title="Top Templates" icon={Sparkles} items={data?.templateStats?.map(t => ({ label: t.name, value: `${t.count} used` }))} />
                    </div>

                </main>
            </div>
        </div>
    );
}

function StatCard({ icon: IconComponent, title, value, color }) {
    const StatIcon = IconComponent;
    const colors = {
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
        amber: "bg-amber-50 text-amber-600 border-amber-100",
        slate: "bg-slate-50 text-slate-600 border-slate-100"
    };

    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm group hover:shadow-xl transition-all duration-300 dark:border-gray-800 dark:bg-gray-900">
            <div className={`w-12 h-12 ${colors[color]} rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                <StatIcon size={24} />
            </div>
            <p className="text-slate-400 dark:text-slate-500 text-xs font-black uppercase tracking-wider">{title}</p>
            <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">{value || 0}</h3>
        </div>
    );
}

function ListCard({ title, icon: IconComponent, items }) {
    const ListIcon = IconComponent;
    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
                <ListIcon className="text-blue-600" size={20} />
                {title}
            </h2>
            <div className="space-y-3">
                {items && items.length > 0 ? items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 dark:hover:border-gray-700 dark:hover:bg-gray-800">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate pr-4">{item.label}</span>
                        <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg shrink-0 dark:bg-blue-500/10 dark:text-blue-300">{item.value}</span>
                    </div>
                )) : (
                    <p className="text-slate-400 dark:text-slate-500 text-xs italic">No data yet</p>
                )}
            </div>
        </div>
    );
}

function SnapshotRow({ label, value }) {
    return (
        <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-4 dark:bg-gray-800">
            <span className="text-sm font-bold text-slate-500 dark:text-slate-400">{label}</span>
            <span className="text-xl font-black text-blue-600">{value}</span>
        </div>
    );
}

function MiniMetric({ label, value }) {
    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <p className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">{label}</p>
            <p className="mt-2 truncate text-2xl font-black text-blue-600 dark:text-blue-300">{value}</p>
        </div>
    );
}
