import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Building, GraduationCap, ArrowRight, Check } from 'lucide-react'; 
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api'; 

const Signup = () => {
  const [role, setRole] = useState('STUDENT');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    companyName: '',
    institutionName: ''
  });

  // Real-time Validation Status
  const password = formData.password;
  const validations = [
    { label: "At least 6 characters", valid: password.length >= 6 },
    { label: "One Uppercase Letter (A-Z)", valid: /[A-Z]/.test(password) },
    { label: "One Number (0-9)", valid: /\d/.test(password) },
    { label: "One Special Char (!@#$%^&*)", valid: /[!@#$%^&*]/.test(password) },
  ];

  // Check if all rules are passed
  const isPasswordValid = validations.every((rule) => rule.valid);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Final Check before API Call
    if (!isPasswordValid) {
      toast.error("Please fulfill all password requirements.");
      return;
    }

    setLoading(true);
    try {
      await api.post('auth/signup', {
        ...formData,
        role: role
      });
      toast.success("Account created successfully! Please login.");
      navigate('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error signing up. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-3.5 text-sm font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-50 focus:border-blue-300 outline-none transition-all shadow-sm";
  const iconClasses = "absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-blue-100 selection:text-blue-900">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-50/80 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden relative z-10"
      >
        {/* Top Gradient Bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600" />

        <div className="p-8 md:p-10">
          
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Join HireHub</h2>
            <p className="text-sm font-medium text-gray-500 mt-2">Create an account to jumpstart your journey.</p>
          </div>
          
          {/* Role Toggle Switch */}
          <div className="flex bg-gray-50 p-1.5 rounded-2xl mb-8 border border-gray-100">
            <button 
              type="button"
              onClick={() => setRole('STUDENT')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                role === 'STUDENT' 
                ? 'bg-white shadow-sm border border-gray-200 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Student</span>
            </button>
            <button 
              type="button"
              onClick={() => setRole('RECRUITER')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                role === 'RECRUITER' 
                ? 'bg-white shadow-sm border border-gray-200 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Building className="w-4 h-4" />
              <span>Recruiter</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <User className={iconClasses} />
                <input 
                  type="text" 
                  placeholder="First Name" 
                  className={inputClasses} 
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})} 
                  required 
                />
              </div>
              <div className="relative">
                <User className={iconClasses} />
                <input 
                  type="text" 
                  placeholder="Last Name" 
                  className={inputClasses} 
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})} 
                  required 
                />
              </div>
            </div>
            
            <div className="relative">
              <Mail className={iconClasses} />
              <input 
                type="email" 
                placeholder="Email Address" 
                className={inputClasses} 
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
                required 
              />
            </div>
            
            <div>
              <div className="relative">
                <Lock className={iconClasses} />
                <input 
                  type="password" 
                  placeholder="Password" 
                  className={inputClasses} 
                  onChange={(e) => setFormData({...formData, password: e.target.value})} 
                  required 
                />
              </div>
              
              {/* Smooth Animated Password Checklist */}
              <AnimatePresence>
                {password.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }} 
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 bg-gray-50/80 p-4 rounded-xl border border-gray-100">
                        <p className="text-[11px] font-bold text-gray-500 mb-2.5 uppercase tracking-wider">Password Requirements</p>
                        <div className="grid grid-cols-1 gap-2">
                            {validations.map((rule, index) => (
                                <div key={index} className={`flex items-center text-xs transition-colors duration-300 font-medium ${rule.valid ? 'text-green-600' : 'text-gray-500'}`}>
                                    {rule.valid ? (
                                      <Check className="w-4 h-4 mr-2 text-green-500" /> 
                                    ) : (
                                      <div className="w-4 h-4 mr-2 flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div></div>
                                    )}
                                    {rule.label}
                                </div>
                            ))}
                        </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Dynamic Role Input */}
            <AnimatePresence mode='wait'>
              <motion.div 
                key={role} 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: 10 }} 
                transition={{ duration: 0.2 }}
                className="relative"
              >
                {role === 'STUDENT' ? (
                  <>
                    <GraduationCap className={iconClasses} />
                    <input 
                      type="text" 
                      placeholder="College or Institution Name" 
                      className={inputClasses} 
                      onChange={(e) => setFormData({...formData, institutionName: e.target.value})} 
                      required 
                    />
                  </>
                ) : (
                  <>
                    <Building className={iconClasses} />
                    <input 
                      type="text" 
                      placeholder="Company Name" 
                      className={inputClasses} 
                      onChange={(e) => setFormData({...formData, companyName: e.target.value})} 
                      required 
                    />
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            <button 
                type="submit" 
                disabled={!isPasswordValid || loading}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20 active:scale-[0.98] mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><span>Create Account</span> <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>
        </div>
        
        <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-sm font-medium text-gray-600">
            Already have an account? <Link to="/login" className="text-blue-600 hover:text-blue-800 font-bold ml-1 transition-colors">Log in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;