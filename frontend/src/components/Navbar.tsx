import { useState, useContext, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  LogOut, 
  Briefcase, 
  FileText, 
  ChevronDown, 
  Bookmark,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationBell from './NotificationBell'; 

const Navbar = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  // Dropdown state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    auth?.logout();
    navigate('/login');
  };

  // Helper function to get user initial
  const getInitial = () => {
    return auth?.user?.firstName ? auth.user.firstName.charAt(0).toUpperCase() : 'U';
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* LEFT: Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              HireHub
            </span>
          </Link>

          {/* CENTER: Spacer (Empty) */}
          <div className="flex-1"></div>

          {/* RIGHT: Actions & Profile */}
          <div className="flex items-center gap-4">
            {!auth?.user ? (
              // LOGGED OUT STATE
              <>
                <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                  Login
                </Link>
                <Link to="/signup" className="bg-blue-600 text-white px-5 py-2 rounded-full font-medium hover:bg-blue-700 transition-all shadow-sm active:scale-95">
                  Get Started
                </Link>
                <button data-rentsolo-trigger>Widget</button>
                <button data-rentsolo-public-trigger>public widget</button>
              </>
            ) : (
              // LOGGED IN STATE
              <>
                {/* Find Jobs / Dashboard Link) */}
                {auth.user.role === 'STUDENT' ? (
                  <Link
                    to="/student-dashboard"
                    className="hidden sm:flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium transition-colors mr-2"
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>Find Jobs</span>
                  </Link>
                ) : (
                  <Link
                    to="/recruiter-dashboard"
                    className="hidden sm:flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium transition-colors mr-2"
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>
                )}

                {/* Notification Bell */}
                <NotificationBell />

                {/* PROFILE DROPDOWN */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${isDropdownOpen ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}
                  > 
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shadow-inner">
                      {getInitial()}
                    </div>

                    <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate hidden sm:block">
                      {auth.user.firstName}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-blue-600' : ''}`} />
                  </button>

                  {/* ANIMATED COMPACT DROPDOWN MENU */}
                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 overflow-hidden"
                      >
                        {/* User Info Header */}
                        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 mb-1">
                          <p className="text-sm font-bold text-gray-900 truncate">
                            {auth.user.firstName} {auth.user.lastName}
                          </p>
                          <p className="text-xs text-blue-500 font-medium truncate mt-0.5">
                            {auth.user.role === 'STUDENT' ? 'Student Account' : 'Recruiter Account'}
                          </p>
                        </div>

                        {/* Menu Items */}
                        <div className="px-1.5 py-1 space-y-0.5">
                          
                          <Link
                            to="/profile"
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors group"
                            onClick={() => setIsDropdownOpen(false)} 
                          >
                            <div className="w-7 h-7 rounded-md bg-gray-100 text-gray-500 flex items-center justify-center group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                              <User className="w-3.5 h-3.5" />
                            </div>
                            View Profile
                          </Link>

                          {auth.user.role === 'STUDENT' && (
                            <>
                              <Link
                                to="/my-applications"
                                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors group"
                                onClick={() => setIsDropdownOpen(false)}
                              >
                                <div className="w-7 h-7 rounded-md bg-gray-100 text-gray-500 flex items-center justify-center group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                  <FileText className="w-3.5 h-3.5" />
                                </div>
                                My Applications
                              </Link>

                              <Link
                                to="/saved-jobs"
                                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors group"
                                onClick={() => setIsDropdownOpen(false)}
                              >
                                <div className="w-7 h-7 rounded-md bg-gray-100 text-gray-500 flex items-center justify-center group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                  <Bookmark className="w-3.5 h-3.5" />
                                </div>
                                Saved Jobs
                              </Link>
                            </>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Logout Button (Moved back outside exactly like original) */}
                <button
                  onClick={handleLogout}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition-colors border border-transparent hover:border-red-100 ml-1"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>

              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;