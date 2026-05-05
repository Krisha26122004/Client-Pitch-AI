import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import InlineMessage from "../components/InlineMessage";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const handleLogin = async () => {
    setFormError("");
    setFieldErrors({});

    if (!email || !password) {
      setFieldErrors({
        email: !email ? "Enter your email address." : "",
        password: !password ? "Enter your password." : "",
      });
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post("/api/auth/login", {
        email: email.toLowerCase().trim(),
        password: password.trim()
      });
      const data = res.data;

      sessionStorage.setItem("userName", data.fullName || "User");
      sessionStorage.setItem("userEmail", data.email);
      sessionStorage.setItem("userId", data.userId);
      sessionStorage.setItem("isLoggedIn", "true");

      navigate("/dashboard");
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Login failed. Please check your credentials.";
      setFormError(errorMsg);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col justify-center px-4">
      {/*Logo*/}
      <div className="flex items-center justify-center gap-2 mb-6">
        <div className="bg-blue-500 text-white w-8 h-8 rounded-lg flex items-center justify-center font-extrabold ">
          C
        </div>
        <h1 className="text-xl font-semibold">
          ClientPitch AI
        </h1>
      </div>
      <div className="flex items-center justify-center gap-2 mb-6 flex-col">

        <div className="text-3xl text-blue-900 dark:text-blue-400 font-extrabold text-center">
          Welcome Back
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-center mb-6">
          Sign in to your account to continue
        </p>
      </div>

      {/*Form*/}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-6 w-full max-w-md mx-auto">

        {/*Email*/}
        <div className="mb-4">
          <label className="text-sm font-medium text-blue-900 dark:text-blue-300">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setFieldErrors((current) => ({ ...current, email: "" }));
              setFormError("");
            }}
            autoComplete="off"
            className={`mt-1 w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 hover:shadow-lg hover:shadow-gray-300 dark:hover:shadow-gray-900 transition-all ${fieldErrors.email ? "border-red-500 focus:ring-red-100 dark:border-red-400" : "dark:border-gray-600"}`}
            placeholder="Enter your email"
          />
          {fieldErrors.email && (
            <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">{fieldErrors.email}</p>
          )}
        </div>
        {/*Password*/}
        <div className="mt-4 relative">
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-blue-900 dark:text-blue-300">Password</label>

          </div>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setFieldErrors((current) => ({ ...current, password: "" }));
              setFormError("");
            }}
            autoComplete="new-password"
            className={`mt-1 w-full border rounded-md px-3 py-2 pr-10 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 hover:shadow-lg hover:shadow-gray-300 dark:hover:shadow-gray-900 transition-all ${fieldErrors.password || formError ? "border-red-500 focus:ring-red-100 dark:border-red-400" : "dark:border-gray-600"}`}
            placeholder="Enter your password"
          />
          <span
            className="absolute right-3 top-11 cursor-pointer text-gray-500"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </span>
          {fieldErrors.password && (
            <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">{fieldErrors.password}</p>
          )}
        </div>

        <InlineMessage className="mt-4">{formError}</InlineMessage>

        {/*Button */}
        <div className="mt-6">
          <button
            onClick={handleLogin}
            disabled={loading}
            className={`w-full py-2 rounded-md transition text-white flex items-center justify-center gap-2 ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-900 dark:bg-blue-600 hover:bg-blue-800 dark:hover:bg-blue-500"}`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Signing in...
              </>
            ) : "Sign In"}
          </button>
          <Link to="/forgot-password" className="text-sm text-blue-900 dark:text-blue-300 mt-4 hover:underline block text-center font-medium">Forgot Password?</Link>
        </div>

      </div>

      <div className="mt-6 text-center">
        <div className="flex items-center justify-center gap-2">
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            Don't have an account?{" "}
            <Link to="/signup" className="text-blue-900 dark:text-blue-400 font-bold hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
