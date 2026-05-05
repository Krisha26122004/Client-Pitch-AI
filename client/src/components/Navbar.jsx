import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { Menu, X, LogOut, Settings, ChevronDown, Sun, Moon } from "lucide-react";

const HashLink = ({ to, children, className, onClick, smooth = true }) => {
  const handleClick = (e) => {
    if (to.startsWith("/#")) {
      const id = to.split("#")[1];
      const element = document.getElementById(id);
      if (element) {
        e.preventDefault();
        element.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
        if (onClick) onClick();
      }
    }
  };
  return (
    <Link to={to} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
};

function Navbar({ hideThemeToggle = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const getSessionUser = () => ({
    isLoggedIn: sessionStorage.getItem("isLoggedIn") === "true",
    userName: sessionStorage.getItem("userName") || "User",
    userEmail: sessionStorage.getItem("userEmail") || "",
  });
  const [sessionUser, setSessionUser] = useState(getSessionUser);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const { isLoggedIn, userName, userEmail } = sessionUser;
  const firstName = userName.split(" ")[0] || "User";

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  useEffect(() => {
    setSessionUser(getSessionUser());
  }, [location.pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    sessionStorage.clear();
    setSessionUser(getSessionUser());
    setDropdownOpen(false);
    setIsOpen(false);
    navigate("/");
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <nav className="fixed top-0 left-0 w-full backdrop-blur-md bg-white/70 dark:bg-gray-900/70 border-b border-gray-100 dark:border-gray-800 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">

          <Link
            to="/"
            onClick={(e) => {
              if (window.location.pathname === "/") {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            className="flex items-center gap-2 cursor-pointer flex-shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-800 flex items-center justify-center shadow-lg">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 4h16v12H7l-3 3V4z" />
              </svg>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight">
              ClientPitch <span className="text-blue-600 dark:text-blue-400">AI</span>
            </h1>
          </Link>

          {/* CENTER LINKS (Desktop) */}
          <div className="hidden md:flex items-center gap-1 text-gray-700 dark:text-gray-300 font-bold">
            <Link to="/features" className="px-4 py-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-gray-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200">
              Features
            </Link>
            <Link to="/templates" className="px-4 py-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-gray-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200">
              Templates
            </Link>
            <HashLink smooth to="/#pricing" className="px-4 py-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-gray-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200">
              Pricing
            </HashLink>
          </div>


          {/* RIGHT SIDE (Desktop) */}
          <div className="hidden md:flex items-center gap-4">
            {/* Theme Toggle (Visible only on Dashboard) */}
            {!hideThemeToggle && location.pathname === "/dashboard" && (
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all border border-gray-100 dark:border-gray-700 shadow-sm"
                title="Toggle theme"
              >
                {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
              </button>
            )}

            {isLoggedIn ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold shadow">
                      {firstName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Hi, {firstName}
                    </span>
                    <ChevronDown
                      size={15}
                      className={`text-gray-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 top-14 w-52 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 py-2 overflow-hidden animate-fade-in z-50">
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{userName}</p>
                        <p className="text-xs text-gray-400 truncate">{userEmail}</p>
                      </div>

                      <Link
                        to="/settings"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Settings size={16} className="text-gray-400" />
                        Settings
                      </Link>

                      <div className="border-t border-gray-100 dark:border-gray-700 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <LogOut size={16} />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-gray-700 dark:text-gray-200 font-bold hover:text-blue-600 dark:hover:text-blue-400 transition-colors px-4 py-2">
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                >
                  Get Started →
                </Link>
              </div>
            )}
          </div>

          {/* MOBILE SIDE */}
          <div className="md:hidden flex items-center gap-2">
            {!hideThemeToggle && location.pathname === "/dashboard" && (
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 transition-all"
              >
                {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
              </button>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 focus:outline-none transition-colors"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="px-4 pt-2 pb-10 space-y-2 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shadow-xl">
          <Link to="/features" className="block px-4 py-4 rounded-xl text-base font-bold text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-800 transition-all" onClick={() => setIsOpen(false)}>
            Features
          </Link>
          <Link to="/templates" className="block px-4 py-4 rounded-xl text-base font-bold text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-800 transition-all" onClick={() => setIsOpen(false)}>
            Templates
          </Link>
          <HashLink smooth to="/#pricing" className="block px-4 py-4 rounded-xl text-base font-bold text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-800 transition-all" onClick={() => setIsOpen(false)}>
            Pricing
          </HashLink>

          <div className="pt-6 flex flex-col gap-3">
            {isLoggedIn ? (
              <>
                <div className="flex items-center gap-3 px-4 py-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow">
                    {firstName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{userName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{userEmail}</p>
                  </div>
                </div>

                <Link to="/settings" className="flex items-center gap-3 w-full py-4 px-5 rounded-2xl font-bold text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all" onClick={() => setIsOpen(false)}>
                  <Settings size={18} className="text-gray-400" /> Settings
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-3 w-full py-4 px-5 rounded-2xl font-bold text-red-600 border border-red-100 dark:border-red-900/20 hover:bg-red-50 dark:hover:bg-red-900/40 transition-all"
                >
                  <LogOut size={18} /> Logout
                </button>
              </>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                <Link to="/login" className="w-full text-center py-4 rounded-2xl font-bold text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all" onClick={() => setIsOpen(false)}>
                  Sign in
                </Link>
                <Link to="/signup" className="w-full text-center py-4 rounded-2xl font-bold bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-all" onClick={() => setIsOpen(false)}>
                  Get Started →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
