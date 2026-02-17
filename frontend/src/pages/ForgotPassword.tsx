import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../services/auth.service';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);

    try {
      await forgotPassword(email);
      setIsSuccess(true);
      toast.success("Reset link sent successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
          
          <AnimatePresence mode="wait">
            {isSuccess ? (
              // --- SUCCESS STATE ---
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }}
                className="text-center py-4"
              >
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-green-100/50">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900 mb-2 tracking-tight">Check your email</h2>
                <p className="text-sm font-medium text-gray-500 mb-8 leading-relaxed">
                  We've sent a password reset link to <br/><span className="text-gray-900 font-bold">{email}</span>
                </p>
                <p className="text-xs text-gray-400 mb-6">
                  Did not receive the email? Check your spam folder or try again.
                </p>
                <button 
                  onClick={() => { setIsSuccess(false); setEmail(''); }}
                  className="w-full bg-gray-50 text-gray-700 font-bold py-3.5 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200 active:scale-[0.98]"
                >
                  Try another email
                </button>
              </motion.div>
            ) : (
              // --- FORM STATE ---
              <motion.div 
                key="form"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }}
              >
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-blue-100 shadow-sm shadow-blue-100/50">
                    <Mail className="w-8 h-8 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Forgot Password?</h2>
                  <p className="text-gray-500 mt-2 text-sm font-medium">
                    No worries! Enter your email and we'll send you reset instructions.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-3.5 text-sm font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-50 focus:border-blue-300 outline-none transition-all shadow-sm"
                      placeholder="Enter your email address"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !email}
                    className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20 active:scale-[0.98] flex items-center justify-center"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      "Send Reset Link"
                    )}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Back to Login Footer */}
        <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 text-center">
          <Link to="/login" className="inline-flex items-center text-gray-500 hover:text-gray-900 font-bold text-sm transition-colors group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Login
          </Link>
        </div>

      </motion.div>
    </div>
  );
};

export default ForgotPassword;          