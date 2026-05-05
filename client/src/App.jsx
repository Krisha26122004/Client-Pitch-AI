import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import axios from "axios";

import Home from "./Pages/Home";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import Dashboard from "./Pages/Dashboard";
import Terms from "./Pages/Terms";
import Privacy from "./Pages/Privacy";
import ForgotPassword from "./Pages/ForgotPassword";
import Settings from "./Pages/Setting";
import Generate from "./Pages/Generate";
import Templates from "./Pages/Templates";
import TemplateSelect from "./Pages/TemplateSelect";
import Create from "./Pages/Create";
import Loading from "./Pages/Loading";
import Result from "./Pages/Result";
import Payment from "./Pages/Payment";
import Analytics from "./Pages/Analytics";
import Contact from "./Pages/Contact";
import SavedPitches from "./Pages/SavedPitches";
import PublicPitch from "./Pages/PublicPitch";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Public Route Component (Redirects to dashboard if logged in)
const PublicRoute = ({ children }) => {
  const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";
  if (isLoggedIn) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

axios.defaults.baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000";
axios.defaults.withCredentials = true;


function App() {
  useEffect(() => {
    const theme = localStorage.getItem("theme") || "light";
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/templateselect" element={<ProtectedRoute><TemplateSelect /></ProtectedRoute>} />
        <Route path="/create" element={<ProtectedRoute><Create /></ProtectedRoute>} />
        <Route path="/loading" element={<ProtectedRoute><Loading /></ProtectedRoute>} />
        <Route path="/result" element={<ProtectedRoute><Result /></ProtectedRoute>} />
        <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />

        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/generate" element={<Generate />} />
        <Route path="/features" element={<Generate />} />
        <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/savedpitches" element={<ProtectedRoute><SavedPitches /></ProtectedRoute>} />
        <Route path="/share/:shareId" element={<PublicPitch />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
