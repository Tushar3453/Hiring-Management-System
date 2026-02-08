import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../services/auth.service';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Check } from 'lucide-react'; 

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Real-time Validation Logic 
  const validations = [
    { label: "At least 6 characters", valid: password.length >= 6 },
    { label: "One Uppercase Letter (A-Z)", valid: /[A-Z]/.test(password) },
    { label: "One Number (0-9)", valid: /\d/.test(password) },
    { label: "One Special Char (!@#$%^&*)", valid: /[!@#$%^&*]/.test(password) },
  ];

  const isPasswordValid = validations.every((rule) => rule.valid);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!isPasswordValid) {
        setError("Please fulfill all password requirements.");
        return;
    }

    if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
    }

    setLoading(true);

    try {
      if (token) {
        await resetPassword(token, password);
        setMessage('Password reset successfully! Redirecting to login...');
        
        setTimeout(() => {
            navigate('/login');
        }, 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        
        <div className="text-center mb-8">
          <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Set New Password</h2>
          <p className="text-gray-500 mt-2 text-sm">
            Make sure your new password is strong and secure.
          </p>
        </div>

        {message ? (
          <div className="text-center bg-green-50 text-green-700 p-4 rounded-xl border border-green-200 flex flex-col items-center gap-2">
             <CheckCircle className="w-6 h-6" />
             <p className="font-bold">{message}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
              <div className="relative">
                <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition"
                    placeholder="Enter new password"
                />
                <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Password Checklist (Visible when typing) */}
              {password.length > 0 && (
                <div className="mt-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-xs font-bold text-gray-500 mb-2 uppercase">Password Requirements:</p>
                    <div className="grid grid-cols-1 gap-1">
                        {validations.map((rule, index) => (
                            <div key={index} className={`flex items-center text-xs transition-colors duration-200 ${rule.valid ? 'text-green-600 font-medium' : 'text-gray-400'}`}>
                                {rule.valid ? <Check className="w-3 h-3 mr-2" /> : <div className="w-3 h-3 mr-2 rounded-full border border-gray-300"></div>}
                                {rule.label}
                            </div>
                        ))}
                    </div>
                </div>
              )}
            </div>

            {/* Confirm Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="Re-enter new password"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !isPasswordValid} 
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
            >
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;