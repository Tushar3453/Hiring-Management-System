import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Building, GraduationCap, ArrowRight } from 'lucide-react';

const Signup = () => {
  const [role, setRole] = useState('STUDENT');
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    companyName: '',
    institutionName: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/signup', {
        ...formData,
        role: role
      });
      navigate('/login');
    } catch (err: any) {
      alert(err.response?.data?.message || "Error signing up");
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8">
          
          <div className="text-center mb-6">
            <h2 className="text-3xl font-extrabold text-gray-900">Create Account</h2>
            <p className="text-sm text-gray-600 mt-2">Join HMS today</p>
          </div>
          
          {/* Role Toggle */}
          <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
            <button 
              onClick={() => setRole('STUDENT')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-lg text-sm font-bold transition-all ${role === 'STUDENT' ? 'bg-white shadow-md text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Student</span>
            </button>
            <button 
              onClick={() => setRole('RECRUITER')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-lg text-sm font-bold transition-all ${role === 'RECRUITER' ? 'bg-white shadow-md text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Building className="w-4 h-4" />
              <span>Recruiter</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User className="h-5 w-5 text-gray-400" /></div>
                <input type="text" placeholder="First Name" className="w-full pl-10 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})} required />
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User className="h-5 w-5 text-gray-400" /></div>
                <input type="text" placeholder="Last Name" className="w-full pl-10 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})} required />
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail className="h-5 w-5 text-gray-400" /></div>
              <input type="email" placeholder="Email Address" className="w-full pl-10 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                onChange={(e) => setFormData({...formData, email: e.target.value})} required />
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="h-5 w-5 text-gray-400" /></div>
              <input type="password" placeholder="Password" className="w-full pl-10 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                onChange={(e) => setFormData({...formData, password: e.target.value})} required />
            </div>

            {role === 'STUDENT' ? (
              <div className="relative animate-fade-in">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><GraduationCap className="h-5 w-5 text-gray-400" /></div>
                <input type="text" placeholder="College/Institution Name" className="w-full pl-10 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                  onChange={(e) => setFormData({...formData, institutionName: e.target.value})} required />
              </div>
            ) : (
              <div className="relative animate-fade-in">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Building className="h-5 w-5 text-gray-400" /></div>
                <input type="text" placeholder="Company Name" className="w-full pl-10 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                  onChange={(e) => setFormData({...formData, companyName: e.target.value})} required />
              </div>
            )}

            <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 rounded-lg font-bold hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center space-x-2">
              <span>Create Account</span> <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>
        
        <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-600">
            Already have an account? <Link to="/login" className="text-blue-600 hover:underline font-medium">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;