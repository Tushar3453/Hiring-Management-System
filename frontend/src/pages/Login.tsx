import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react'; 

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
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      auth?.login(res.data.user, res.data.token);
      if (res.data.user.role === 'RECRUITER') {
        navigate('/recruiter-dashboard');
      } else {
        navigate('/student-dashboard');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Invalid Credentials");
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center bg-gray-50 pt-16 sm:pt-24 px-4 pb-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900">Welcome Back!</h2>
            <p className="text-sm text-gray-600 mt-2">Please sign in to your account</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field with Icon */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input 
                type="email" 
                placeholder="Email Address" 
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>

            {/* Password Field with Icon */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input 
                type="password" 
                placeholder="Password" 
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <Link 
                to="/forgot-password" 
                className="text-sm font-medium text-blue-600 hover:text-blue-500 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 rounded-lg font-bold hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-300 transition-all flex items-center justify-center space-x-2 disabled:opacity-70"
            >
              {loading ? 'Signing In...' : <><LogIn className="w-5 h-5" /> <span>Login</span></>}
            </button>
          </form>
        </div>
        <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account? <Link to="/signup" className="text-blue-600 hover:underline font-medium">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;