import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosConfig";

export default function Signup() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [fullName, setFullName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const hasMinLength = password.length >= 6;
  const hasSpecialCharacter = /[^A-Za-z0-9]/.test(password);
  const isPasswordInvalid = touched && (!hasMinLength || !hasSpecialCharacter);

  const handleSignup = async () => {
    setFormError("");
    setFieldErrors({});

    if (!fullName || !email || !password || password !== confirmPassword) {
      setFieldErrors({
        fullName: !fullName ? "Enter your full name." : "",
        email: !email ? "Enter your email address." : "",
        password: !password ? "Create a password." : "",
        confirmPassword: password !== confirmPassword ? "Passwords do not match." : "",
      });
      return;
    }

    if (!hasMinLength || !hasSpecialCharacter) {
      setTouched(true);
      return;
    }

    setLoading(true);

    try {
      const res = await axiosInstance.post("/api/auth/signup", {
        fullName: fullName.trim(),
        email: email.toLowerCase().trim(),
        password: password.trim(),
        company: name.trim()
      });

      const data = res.data;

      sessionStorage.setItem("userName", data.fullName || fullName);
      sessionStorage.setItem("userEmail", data.email || email);
      sessionStorage.setItem("userId", data.userId);
      sessionStorage.setItem("isLoggedIn", "true");

      navigate("/dashboard");

    } catch (error) {
      console.log("Signup Error:", error);
      const errorMsg = error.response?.data?.message || "Signup failed. Is the server running?";
      if (error.response?.status === 409) {
        setFormError(errorMsg);
        navigate("/login", { state: { email: email.toLowerCase().trim() } });
        return;
      }
      setFormError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center px-4 transition-colors duration-300">
      {/*Logo*/}
      <div className="flex items-center justify-center gap-2 mb-6">
        <div className="bg-blue-500 text-white w-8 h-8 rounded-lg flex items-center justify-center font-extrabold">
          C
        </div>
        <h1 className="text-xl font-semibold">
          ClientPitch AI
        </h1>
      </div>
      {/*Heading*/}
      <div className="text-xl text-blue-900 dark:text-blue-400 font-bold text-center">
        Create Your Account
      </div>
      <p className="text-gray-500 dark:text-gray-400 text-center mb-6">
        Start creating high-converting client pitches
      </p>

      {/*Form*/}
      <div className="bg-white dark:bg-gray-800 dark:text-white shadow-md rounded-xl p-6 w-full max-w-md mx-auto">
        {/* Name + Company */}
        <div className="flex gap-3 mb-4">
          <div className="w-1/2">
            <label className="text-sm font-medium text-blue-900 dark:text-blue-300">Full Name *</label>
            <input
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                setFieldErrors((current) => ({ ...current, fullName: "" }));
                setFormError("");
              }}
              className={`mt-1 w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 hover:shadow-lg hover:shadow-gray-300 dark:hover:shadow-gray-900 transition-all font-medium ${fieldErrors.fullName ? "border-red-500 focus:ring-red-100 dark:border-red-400" : "dark:border-gray-600"}`}
            />
            {fieldErrors.fullName && (
              <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">{fieldErrors.fullName}</p>
            )}
          </div>

          <div className="w-1/2">
            <label className="text-sm font-medium text-blue-900 dark:text-blue-300">Company</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Company"
              className="mt-1 w-full border dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 hover:shadow-lg hover:shadow-gray-300 dark:hover:shadow-gray-900 transition-all font-medium"
            />
          </div>
        </div>

        {/* Email - Full Width */}
        <div className="mb-4">
          <label className="text-sm font-medium text-blue-900 dark:text-blue-300">Email *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setFieldErrors((current) => ({ ...current, email: "" }));
              setFormError("");
            }}
            placeholder="you@example.com"
            className={`mt-1 w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 hover:shadow-lg hover:shadow-gray-300 dark:hover:shadow-gray-900 transition-all font-medium ${fieldErrors.email ? "border-red-500 focus:ring-red-100 dark:border-red-400" : "dark:border-gray-600"}`}
          />
          {fieldErrors.email && (
            <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">{fieldErrors.email}</p>
          )}
        </div>

        {/* Password */}
        <div className="mb-4 relative">
          <label className="text-sm font-medium text-blue-900 dark:text-blue-300">Password *</label>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Create a password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setFieldErrors((current) => ({ ...current, password: "" }));
              setFormError("");
            }}
            onBlur={() => setTouched(true)}
            className={`mt-1 w-full border dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 hover:shadow-lg hover:shadow-gray-300 dark:hover:shadow-gray-900 transition-all font-medium
      ${isPasswordInvalid || fieldErrors.password ? "ring-2 ring-red-500" : ""}`}
          />
          <span
            className="absolute right-3 top-10 cursor-pointer text-gray-500 dark:text-gray-400"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </span>
          {touched && (
            <div className="mt-2 space-y-1 text-xs">
              <p className={hasMinLength ? "text-green-600" : "text-red-500"}>
                Minimum 6 characters
              </p>
              <p className={hasSpecialCharacter ? "text-green-600" : "text-red-500"}>
                At least one special character, like ! @ # $ %
              </p>
            </div>
          )}
          {fieldErrors.password && (
            <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">{fieldErrors.password}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="mb-4 relative">
          <label className="text-sm font-medium text-blue-900 dark:text-blue-300">Confirm Password *</label>
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setFieldErrors((current) => ({ ...current, confirmPassword: "" }));
              setFormError("");
            }}
            onBlur={() => setConfirmTouched(true)}
            className={`mt-1 w-full border dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 hover:shadow-lg hover:shadow-gray-300 dark:hover:shadow-gray-900 transition-all font-medium 
      ${(confirmTouched && password !== confirmPassword) || fieldErrors.confirmPassword ? "ring-2 ring-red-500" : ""}`}
          />
          <span
            className="absolute right-3 top-10 cursor-pointer text-gray-500 dark:text-gray-400"
            onClick={() => setShowConfirm(!showConfirm)}
          >
            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
          </span>
          {confirmTouched && password !== confirmPassword && (
            <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
          )}
          {fieldErrors.confirmPassword && !confirmTouched && (
            <p className="text-red-500 text-xs mt-1">{fieldErrors.confirmPassword}</p>
          )}
        </div>

        {formError && (
          <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-600 dark:bg-red-500/10 dark:text-red-300">
            {formError}
          </p>
        )}

        {/* Button */}
        <button
          onClick={handleSignup}
          disabled={loading}
          className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 transition-all font-bold ${loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-900 dark:bg-blue-600 hover:bg-blue-800 dark:hover:bg-blue-500 text-white shadow-lg active:scale-95"
            }`}
        >
          {loading ? (
            <>
              {/*Spinner*/}
              <div className="w-5 h-5 border-2 text-blue-900 border-white border-t-transparent rounded-full animate-spin"></div>
              Creating Account...
            </>
          ) : (
            "Create Account"
          )}
        </button>
        <div className="text-center mt-4 text-sm text-gray-600 dark:text-gray-400">
          By creating an account, you agree to our <Link to="/terms" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">Privacy Policy</Link>
        </div>
      </div>

      <div className="text-center mt-4 text-sm text-gray-600 dark:text-gray-400 font-medium">
        Already have an account? <Link to="/login" className="text-blue-500 dark:text-blue-400 font-bold hover:underline">Sign In</Link>
      </div>

    </div>
  );
}
