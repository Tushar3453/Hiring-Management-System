import { useState, useContext, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, GraduationCap, Building, Briefcase, FileText, ChevronDown } from 'lucide-react';

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

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
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
              //  Logged Out State
              <>
                <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                  Login
                </Link>
                <Link to="/signup" className="bg-blue-600 text-white px-5 py-2 rounded-full font-medium hover:bg-blue-700 transition-all shadow-sm">
                  Get Started
                </Link>
              </>
            ) : (
              // Logged In State
              <>
                {/* Find Jobs Link */}
                {auth.user.role === 'STUDENT' ? (
                  <Link
                    to="/student-dashboard"
                    className="hidden sm:flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium transition-colors mr-2"
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>Find Jobs</span>
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/recruiter-dashboard"
                      className="hidden sm:flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium transition-colors mr-2"
                    >
                      <Briefcase className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Link>
                    {/* POST JOB LINK */}
                    {/* <Link
                      to="/post-job"
                      className="hidden sm:flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors mr-2"
                    >
                      <span>+ Post Job</span>
                    </Link> */}
                  </>
                )}

                {/* Profile Dropdown  */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${isDropdownOpen ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}
                  >
                    {auth.user.role === 'STUDENT' ? (
                      <GraduationCap className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Building className="w-5 h-5 text-blue-600" />
                    )}

                    <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate hidden sm:block">
                      {auth.user.firstName}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu Body */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-in fade-in zoom-in-95 duration-200 z-50">

                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 mb-1 hover:bg-gray-100 transition-colors">
                        <Link
                          to="/profile"
                          className="block"
                          onClick={() => setIsDropdownOpen(false)} 
                        >
                          <p className="text-sm font-bold text-gray-900 truncate hover:text-blue-600">
                            {auth.user.firstName} {auth.user.lastName}
                          </p>
                          <p className="text-xs text-blue-500 font-medium truncate mt-0.5">View Profile</p>
                        </Link>
                      </div>

                      {/* Menu Items */}
                      <div className="py-1">
                        {auth.user.role === 'STUDENT' && (
                          <Link
                            to="/my-applications"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <FileText className="w-4 h-4" />
                            My Applications
                          </Link>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition-colors border border-transparent hover:border-red-100"
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