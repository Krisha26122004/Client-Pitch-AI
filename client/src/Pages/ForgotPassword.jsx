import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [timeLeft, setTimeLeft] = useState(180); 
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");
  const hasMinLength = newPassword.length >= 6;
  const hasSpecialCharacter = /[^A-Za-z0-9]/.test(newPassword);

  useEffect(() => {
    let timer;
    if (step === 2 && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && step === 2) {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  // Format time (MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!email) {
      setMessageType("error");
      setMessage("Please enter your email address.");
      return;
    }
    setLoading(true);
    
    try {
      await axios.post("/api/auth/send-otp", { email });
      setLoading(false);
      setStep(2);
      setTimeLeft(180); 
    } catch (error) {
      setLoading(false);
      setMessageType("error");
      setMessage(error.response?.data?.message || "Failed to send OTP");
    }
  };

  const handleVerifyOTP = (e) => {
    e.preventDefault();
    setMessage("");
    if (!otp) {
      setMessageType("error");
      setMessage("Please enter the OTP.");
      return;
    }
    if (timeLeft === 0) {
      setMessageType("error");
      setMessage("OTP expired. Please go back and resend.");
      return;
    }
    setStep(3);
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!newPassword || newPassword !== confirmPassword) {
      setMessageType("error");
      setMessage("Please ensure both passwords match.");
      return;
    }
    if (!hasMinLength || !hasSpecialCharacter) {
      setMessageType("error");
      setMessage("Password must be at least 6 characters and include one special character.");
      return;
    }
    setLoading(true);
    
    try {
      await axios.post("/api/auth/reset-password", { email, otp, newPassword });
      setLoading(false);
      setMessageType("success");
      setMessage("Password updated successfully!");
      navigate("/login");
    } catch (error) {
      setLoading(false);
      setMessageType("error");
      setMessage(error.response?.data?.message || "Failed to reset password");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col justify-center px-4 transition-colors duration-300">
      {/*Logo*/}
      <div className="flex items-center justify-center gap-2 mb-6">
        <div className="bg-blue-500 text-white w-8 h-8 rounded-lg flex items-center justify-center font-extrabold ">
          C
        </div>
        <h1 className="text-xl font-semibold">ClientPitch AI</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md border dark:border-gray-700 rounded-xl p-6 w-full max-w-md mx-auto transition-colors duration-300">
        <h2 className="text-2xl font-bold text-center text-blue-900 dark:text-blue-400 mb-6">
          {step === 1 && "Reset Your Password"}
          {step === 2 && "Enter OTP"}
          {step === 3 && "Create New Password"}
        </h2>

        {message && (
          <p className={`mb-4 rounded-md px-3 py-2 text-sm font-medium ${
            messageType === "success"
              ? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-300"
              : "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300"
          }`}>
            {message}
          </p>
        )}

        {/* Step 1: Email */}
        {step === 1 && (
          <form onSubmit={handleSendOTP}>
            <p className="text-gray-500 dark:text-gray-400 text-center text-sm mb-6">
              Enter your registered email address and we'll send you an OTP to reset your password.
            </p>
            <div className="mb-4">
              <label className="text-sm font-medium text-blue-900 dark:text-blue-300">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="off"
                className="mt-1 w-full border dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 hover:shadow-lg hover:shadow-gray-300 dark:hover:shadow-gray-900 transition-shadow"
                placeholder="you@example.com"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 rounded-md transition text-white ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-900 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500"}`}
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
            <div className="mt-4 text-center">
              <Link to="/login" className="text-sm text-blue-900 dark:text-blue-300 hover:underline">
                Back to Login
              </Link>
            </div>
          </form>
        )}

        {/* Step 2: Verify OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTP}>
            <p className="text-gray-500 dark:text-gray-400 text-center text-sm mb-4">
              We've sent a 6-digit code to <span className="font-semibold text-gray-800 dark:text-gray-200">{email}</span>.
            </p>
            
            <div className="mb-4 text-center">
               <span className={`text-lg font-mono font-bold ${timeLeft > 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {formatTime(timeLeft)}
               </span>
               <p className="text-xs text-gray-400">Time remaining</p>
            </div>

            <div className="mb-6">
              <label className="text-sm font-medium text-blue-900 dark:text-blue-300">Enter OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                disabled={timeLeft === 0}
                className="mt-1 w-full border dark:border-gray-600 text-center font-mono tracking-[0.5em] text-xl rounded-md px-3 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-0 focus:ring-slate-300"
                placeholder="------"
              />
            </div>
            <button
              type="submit"
              disabled={loading || timeLeft === 0}
              className={`w-full py-2 rounded-md transition text-white ${(loading || timeLeft === 0) ? "bg-gray-400 cursor-not-allowed" : "bg-blue-900 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500"}`}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            {timeLeft === 0 && (
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={handleSendOTP}
                  className="text-sm text-blue-900 hover:underline"
                >
                  Resend OTP
                </button>
              </div>
            )}
            
            <div className="mt-4 text-center">
              <button type="button" onClick={() => setStep(1)} className="text-sm text-gray-500 hover:underline">
                Change Email Address
              </button>
            </div>
          </form>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <form onSubmit={handleUpdatePassword}>
            <p className="text-gray-500 dark:text-gray-400 text-center text-sm mb-6">
              Your OTP is verified! Please enter your new password below.
            </p>
            
            <div className="mb-4 relative">
              <label className="text-sm font-medium text-blue-900 dark:text-blue-300">New Password</label>
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                className="mt-1 w-full border dark:border-gray-600 rounded-md px-3 py-2 pr-10 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-0 focus:ring-slate-300"
                placeholder="Create a new password"
              />
              <span
                className="absolute right-3 top-9 cursor-pointer text-gray-500 dark:text-gray-400"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>
            <div className="mb-4 space-y-1 text-xs">
              <p className={hasMinLength ? "text-green-600" : "text-red-500"}>
                Minimum 6 characters
              </p>
              <p className={hasSpecialCharacter ? "text-green-600" : "text-red-500"}>
                At least one special character, like ! @ # $ %
              </p>
            </div>

            <div className="mb-6 relative">
              <label className="text-sm font-medium text-blue-900 dark:text-blue-300">Confirm Password</label>
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                className={`mt-1 w-full border dark:border-gray-600 rounded-md px-3 py-2 pr-10 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-0 focus:ring-slate-300 ${
                  confirmPassword && newPassword !== confirmPassword ? "border-red-500 focus:ring-red-500" : ""
                }`}
                placeholder="Confirm your password"
              />
              <span
                className="absolute right-3 top-9 cursor-pointer text-gray-500 dark:text-gray-400"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !newPassword || newPassword !== confirmPassword || !hasMinLength || !hasSpecialCharacter}
              className={`w-full py-2 rounded-md transition text-white ${(loading || !newPassword || newPassword !== confirmPassword || !hasMinLength || !hasSpecialCharacter) ? "bg-gray-400 cursor-not-allowed" : "bg-blue-900 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500"}`}
            >
              {loading ? "Updating..." : "Update Password & Continue"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
