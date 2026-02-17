import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react'; 
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api'; 

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); 
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => { 
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      auth?.login(res.data.user, res.data.token);
      
      toast.success(`Welcome back, ${res.data.user.firstName}!`);
      
      if (res.data.user.role === 'RECRUITER') {
        navigate('/recruiter-dashboard');
      } else {
        navigate('/student-dashboard');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Invalid Email or Password");
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
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome Back</h2>
            <p className="text-sm font-medium text-gray-500 mt-2">Please sign in to your account</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-5">
            
            <div className="relative">
              <Mail className={iconClasses} />
              <input 
                type="email" 
                placeholder="Email Address" 
                className={inputClasses}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>

            <div className="relative">
              <Lock className={iconClasses} />
              <input 
                type="password" 
                placeholder="Password" 
                className={inputClasses}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end pt-1 pb-2">
              <Link 
                to="/forgot-password" 
                className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20 active:scale-[0.98]"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><span>Log In</span> <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>
        </div>
        
        <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-sm font-medium text-gray-600">
            Don't have an account? <Link to="/signup" className="text-blue-600 hover:text-blue-800 font-bold ml-1 transition-colors">Sign up</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;