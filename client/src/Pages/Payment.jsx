import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Crown, CheckCircle, Shield, Zap, Star, ArrowLeft, Copy, Check, X } from "lucide-react";
import Navbar from "../components/Navbar";
import InlineMessage from "../components/InlineMessage";


const UPI_ID = "kishudarji2612@okhdfcbank";
const UPI_NAME = "ClientPitch AI";
const AMOUNT = "499";

export default function Payment({ isOpen, onClose, onUpgrade }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [step, setStep] = useState(1);
    const [copied, setCopied] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [message, setMessage] = useState(null);

    const isModalMode = isOpen !== undefined;
    const returnTo = location.state?.from || "/dashboard";
    if (isModalMode && !isOpen) return null;

    const handleClose = () => {
        setStep(1);
        setMessage(null);
        if (onClose) onClose();
        else navigate(returnTo, { replace: true });
    };

    const upiLink = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${AMOUNT}&cu=INR&tn=${encodeURIComponent("ClientPitch AI Pro Plan")}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiLink)}&bgcolor=ffffff&color=1e1b4b&margin=10`;

    const handleCopy = () => {
        navigator.clipboard.writeText(UPI_ID);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleConfirmPayment = async () => {
        setConfirming(true);
        try {
            const userId = sessionStorage.getItem("userId");
            if (!userId) {
                setMessage({ tone: "error", text: "Please login first." });
                navigate("/login");
                return;
            }

            const res = await fetch("/api/auth/user/upgrade", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId }),
            });

            if (res.ok) {
                sessionStorage.setItem("plan", "pro");
                setMessage({ tone: "success", text: "Payment confirmed. You are now PRO." });
                setStep(1);
                if (isModalMode) {
                    if (onUpgrade) onUpgrade();
                    if (onClose) onClose();
                } else {
                    navigate(returnTo, { replace: true });
                }
            } else {
                setMessage({ tone: "error", text: "Could not confirm upgrade. Please contact support." });
            }
        } catch (err) {
            console.error(err);
            setMessage({ tone: "error", text: "Error confirming payment." });
        } finally {
            setConfirming(false);
        }
    };

    const features = [
        { icon: <Zap size={14} className="text-yellow-500" />, text: "Unlimited Pitch Generations" },
        { icon: <CheckCircle size={14} className="text-green-500" />, text: "No Daily Limits" },
        { icon: <Zap size={14} className="text-yellow-500" />, text: "Faster AI Responses" },
        { icon: <CheckCircle size={14} className="text-green-500" />, text: "Download PDF / DOCX" },
        { icon: <CheckCircle size={14} className="text-green-500" />, text: "Advanced Tone & Styles" },
        { icon: <Star size={14} className="text-blue-500" />, text: "Premium Templates" },
        { icon: <CheckCircle size={14} className="text-green-500" />, text: "Unlimited Saved Pitches" },
        { icon: <Star size={14} className="text-blue-500" />, text: "Priority Support" },
    ];

    return (
        <div className="relative">
            {!isModalMode && <Navbar />}
            <div
                className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${!isModalMode ? "pt-20" : ""}`}
                style={{ background: "rgba(15, 23, 42, 0.8)", backdropFilter: "blur(10px)" }}
            >
                <div
                    className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col"
                    style={{ boxShadow: "0 32px 80px rgba(79, 70, 229, 0.3)", maxHeight: "90vh" }}
                >
                    {/* ── GRADIENT HEADER ── */}
                    <div
                        className="relative px-7 pt-5 pb-4 text-white shrink-0"
                        style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #4338ca 55%, #6366f1 100%)" }}
                    >
                        <button
                            onClick={handleClose}
                            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white"
                            aria-label="Close payment"
                        >
                            <X size={18} />
                        </button>
                        {step === 2 && (
                            <button
                                onClick={() => setStep(1)}
                                className="absolute left-4 top-4 text-white/60 hover:text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition"
                            >
                                <ArrowLeft size={18} />
                            </button>
                        )}

                        <div className="flex justify-center mb-3">
                            <div className="flex items-center gap-2 bg-white/15 rounded-full px-4 py-1.5 text-xs font-semibold border border-white/20 backdrop-blur-sm">
                                <Crown size={13} className="text-yellow-300" />
                                {step === 1 ? "PRO PLAN" : "SCAN & PAY"}
                            </div>
                        </div>

                        <div className="text-center">
                            <div className="flex items-end justify-center gap-1 mb-1">
                                <span className="text-xl font-bold text-white/60 line-through">₹999</span>
                                <span className="text-4xl font-black">₹499</span>
                                <span className="text-white/60 mb-1.5 text-sm">/mo</span>
                            </div>
                            <p className="text-white/60 text-xs">Cancel anytime • No hidden charges</p>
                            <span className="inline-block mt-2 bg-green-400 text-green-900 text-xs font-bold px-3 py-0.5 rounded-full">
                                🎉 Save 50% – Limited Offer
                            </span>
                        </div>
                    </div>

                    {/* ── STEP 1: PLAN DETAILS ── */}
                    {step === 1 && (
                        <div className="px-6 py-4 overflow-y-auto">
                            {message && (
                                <InlineMessage tone={message.tone} className="mb-4">
                                    {message.text}
                                </InlineMessage>
                            )}
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Everything in Pro</p>
                            <div className="grid grid-cols-2 gap-2 mb-5">
                                {features.map((f, i) => (
                                    <div key={i} className="flex items-start gap-2 bg-gray-50 rounded-xl px-3 py-2">
                                        <span className="mt-0.5 shrink-0">{f.icon}</span>
                                        <span className="text-xs text-gray-700 font-medium leading-snug">{f.text}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => setStep(2)}
                                className="w-full py-4 rounded-2xl text-white font-bold text-sm transition-all duration-200 active:scale-95 hover:opacity-90"
                                style={{
                                    background: "linear-gradient(135deg, #4338ca, #6366f1)",
                                    boxShadow: "0 8px 30px rgba(99,102,241,0.4)"
                                }}
                            >
                                👑 Upgrade to Pro — ₹499/month
                            </button>

                            <div className="flex items-center justify-center gap-4 mt-4">
                                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                    <Shield size={11} className="text-green-500" /> SSL Secured
                                </div>
                                <div className="w-px h-3 bg-gray-200" />
                                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                    <CheckCircle size={11} className="text-blue-500" /> UPI Protected
                                </div>
                                <div className="w-px h-3 bg-gray-200" />
                                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                    <Zap size={11} className="text-yellow-500" /> Instant Access
                                </div>
                            </div>

                            <p className="text-[10px] text-center text-gray-400 mt-3">
                                By upgrading you agree to our{" "}
                                <Link to="/terms" className="text-indigo-500 hover:underline">Terms</Link> &{" "}
                                <Link to="/privacy" className="text-indigo-500 hover:underline">Privacy Policy</Link>
                            </p>
                        </div>
                    )}

                    {/* ── STEP 2: QR CODE ── */}
                    {step === 2 && (
                        <div className="px-6 py-4 overflow-y-auto text-center">
                            {message && (
                                <InlineMessage tone={message.tone} className="mb-4 text-left">
                                    {message.text}
                                </InlineMessage>
                            )}
                            <p className="text-sm font-semibold text-gray-700 mb-1">Scan with any UPI app to pay</p>
                            <p className="text-xs text-gray-400 mb-4">Google Pay · PhonePe · Paytm · BHIM</p>

                            <div className="flex justify-center mb-4">
                                <div className="border-4 border-indigo-100 rounded-2xl p-2 bg-white shadow-lg">
                                    <img
                                        src={qrUrl}
                                        alt="UPI QR Code"
                                        className="w-48 h-48 rounded-xl"
                                        onError={(e) => { e.target.src = "https://via.placeholder.com/220x220?text=QR+Code"; }}
                                    />
                                </div>
                            </div>

                            <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5 mb-4">
                                <span className="text-indigo-700 font-black text-lg">₹499</span>
                                <span className="text-indigo-400 text-xs font-medium">/ month</span>
                            </div>

                            <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-5">
                                <div className="text-left">
                                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">UPI ID</p>
                                    <p className="text-sm font-bold text-gray-800 font-mono">{UPI_ID}</p>
                                </div>
                                <button
                                    onClick={handleCopy}
                                    className="ml-3 flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-lg transition"
                                >
                                    {copied ? <Check size={13} /> : <Copy size={13} />}
                                    {copied ? "Copied!" : "Copy"}
                                </button>
                            </div>

                            <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-5 text-left">
                                <p className="text-xs font-bold text-amber-700 mb-1">How to pay:</p>
                                <ol className="text-xs text-amber-600 space-y-0.5 list-decimal list-inside">
                                    <li>Open any UPI app</li>
                                    <li>Scan the QR code or enter UPI ID</li>
                                    <li>Enter ₹499 and complete payment</li>
                                    <li>Click <strong>"I've Paid"</strong> below</li>
                                </ol>
                            </div>

                            <button
                                onClick={handleConfirmPayment}
                                disabled={confirming}
                                className="w-full py-3.5 rounded-2xl text-white font-bold text-sm transition-all active:scale-95 disabled:opacity-60"
                                style={{
                                    background: "linear-gradient(135deg, #059669, #10b981)",
                                    boxShadow: "0 8px 24px rgba(16,185,129,0.35)"
                                }}
                            >
                                
                                {confirming ? "Verifying..." : "✅ I've Paid – Activate Pro" }
                            </button>

                            <p className="text-[10px] text-gray-400 mt-3">
                                Having trouble? Contact{" "}
                                <a href="mailto:support@clientpitch.ai" className="text-indigo-500 hover:underline">
                                    support@clientpitch.ai
                                </a>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
