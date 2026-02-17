import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import * as JobService from '../services/job.service';
import { 
  Briefcase, MapPin, DollarSign, Building, Save, Clock, 
  GraduationCap, ArrowLeft, ChevronDown, CheckCircle2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const JOB_TYPES = ['Full Time', 'Part Time', 'Internship', 'Contract'];
const EXP_LEVELS = ['Fresher', '0-1 Years', '1-3 Years', '3-5 Years', '5+ Years'];
const CURRENCIES = ['INR', 'USD', 'EUR'];

const PostJob = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editJobId = searchParams.get('edit'); 

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  
  // Custom Dropdown State
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    companyName: '',
    location: '',
    minSalary: '',
    maxSalary: '',
    currency: 'INR',
    requirements: '', 
    jobType: 'Full Time',      
    experienceLevel: 'Fresher' 
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    if (editJobId) {
      setFetching(true);
      JobService.getJobById(editJobId)
        .then((job: any) => {
          setFormData({
            title: job.title,
            description: job.description,
            companyName: job.companyName,
            location: job.location || '',
            minSalary: job.minSalary || '',
            maxSalary: job.maxSalary || '',
            currency: job.currency || 'INR',
            requirements: job.requirements ? job.requirements.join(', ') : '', 
            jobType: job.jobType || 'Full Time',
            experienceLevel: job.experienceLevel || 'Fresher'
          });
        })
        .catch(err => {
          console.error("Failed to fetch job details", err);
          toast.error("Could not load job details.");
          navigate('/recruiter-dashboard');
        })
        .finally(() => setFetching(false));
    }
  }, [editJobId, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCustomSelect = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
    setOpenDropdown(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formattedRequirements = formData.requirements
        .split(',')
        .map(req => req.trim())
        .filter(req => req.length > 0);

      const payload = {
        ...formData,
        requirements: formattedRequirements,
      };

      if (editJobId) {
        await JobService.updateJob(editJobId, payload);
        toast.success("Job Updated Successfully!");
      } else {
        await JobService.postJob(payload);
        toast.success("Job Posted Successfully! 🚀");
      }
      
      navigate('/recruiter-dashboard');
    } catch (error) {
      console.error(error);
      toast.error("Failed to save job. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto animate-pulse">
        <div className="h-6 w-32 bg-gray-200 rounded-md mb-8"></div>
        <div className="bg-white p-8 md:p-10 rounded-3xl border border-gray-100 shadow-sm space-y-6">
           <div className="h-8 w-1/3 bg-gray-200 rounded-md mb-8"></div>
           <div className="h-12 bg-gray-100 rounded-xl w-full"></div>
           <div className="grid grid-cols-2 gap-6"><div className="h-12 bg-gray-100 rounded-xl"></div><div className="h-12 bg-gray-100 rounded-xl"></div></div>
           <div className="grid grid-cols-2 gap-6"><div className="h-12 bg-gray-100 rounded-xl"></div><div className="h-12 bg-gray-100 rounded-xl"></div></div>
           <div className="h-32 bg-gray-100 rounded-xl w-full mt-4"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-20 selection:bg-blue-100 selection:text-blue-900 relative">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-b from-blue-50/60 to-transparent pointer-events-none" />

      {/* Invisible Overlay to close custom dropdowns */}
      {openDropdown && (
         <div className="fixed inset-0 z-10" onClick={() => setOpenDropdown(null)}></div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 relative z-10">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate('/recruiter-dashboard')} 
          className="group flex items-center text-sm font-bold text-gray-500 hover:text-gray-900 mb-8 transition-colors bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm hover:shadow w-fit"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> 
          Back to Dashboard
        </button>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600" />
          
          <div className="p-8 md:p-10">
            <div className="mb-8 border-b border-gray-100 pb-6">
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                {editJobId ? 'Edit Job Posting' : 'Post a New Job'}
              </h1>
              <p className="text-gray-500 font-medium mt-2">
                {editJobId ? 'Update the details of your job listing below.' : 'Fill in the details to find the best talent for your company.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Job Title */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Job Title</label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    name="title"
                    required
                    placeholder="e.g. Senior React Developer"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3.5 text-sm font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-50 focus:border-blue-300 outline-none transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* Company & Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Company Name</label>
                  <div className="relative">
                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      name="companyName"
                      required
                      placeholder="e.g. Tech Corp"
                      value={formData.companyName}
                      onChange={handleChange}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3.5 text-sm font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-50 focus:border-blue-300 outline-none transition-all shadow-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      name="location"
                      placeholder="e.g. Remote / Bangalore"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3.5 text-sm font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-50 focus:border-blue-300 outline-none transition-all shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Custom Job Type & Experience Level */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Custom Job Type Dropdown */}
                <div className="relative">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Job Type</label>
                  <div className="relative z-20">
                     <button
                        type="button"
                        onClick={() => setOpenDropdown(openDropdown === 'jobType' ? null : 'jobType')}
                        className={`w-full flex items-center justify-between pl-12 pr-4 py-3.5 rounded-xl border text-sm font-bold transition-all focus:outline-none shadow-sm ${
                           openDropdown === 'jobType' ? 'bg-white border-blue-300 ring-2 ring-blue-50' : 'bg-gray-50 border-gray-200 hover:border-gray-300 text-gray-900'
                        }`}
                     >
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        {formData.jobType}
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${openDropdown === 'jobType' ? 'rotate-180 text-blue-600' : 'text-gray-400'}`} />
                     </button>

                     <AnimatePresence>
                        {openDropdown === 'jobType' && (
                           <motion.div 
                              initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.15 }}
                              className="absolute top-full left-0 mt-1.5 w-full bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden py-1.5 z-30"
                           >
                              {JOB_TYPES.map(type => (
                                 <div 
                                    key={type} 
                                    onClick={() => handleCustomSelect('jobType', type)}
                                    className={`px-4 py-2.5 text-sm font-bold cursor-pointer flex justify-between items-center transition-colors ${formData.jobType === type ? 'bg-blue-50/50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
                                 >
                                    {type}
                                    {formData.jobType === type && <CheckCircle2 className="w-4 h-4 text-blue-500" />}
                                 </div>
                              ))}
                           </motion.div>
                        )}
                     </AnimatePresence>
                  </div>
                </div>

                {/* Custom Experience Level Dropdown */}
                <div className="relative">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Experience Level</label>
                  <div className="relative z-20">
                     <button
                        type="button"
                        onClick={() => setOpenDropdown(openDropdown === 'experience' ? null : 'experience')}
                        className={`w-full flex items-center justify-between pl-12 pr-4 py-3.5 rounded-xl border text-sm font-bold transition-all focus:outline-none shadow-sm ${
                           openDropdown === 'experience' ? 'bg-white border-blue-300 ring-2 ring-blue-50' : 'bg-gray-50 border-gray-200 hover:border-gray-300 text-gray-900'
                        }`}
                     >
                        <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        {formData.experienceLevel}
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${openDropdown === 'experience' ? 'rotate-180 text-blue-600' : 'text-gray-400'}`} />
                     </button>

                     <AnimatePresence>
                        {openDropdown === 'experience' && (
                           <motion.div 
                              initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.15 }}
                              className="absolute top-full left-0 mt-1.5 w-full bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden py-1.5 z-30"
                           >
                              {EXP_LEVELS.map(level => (
                                 <div 
                                    key={level} 
                                    onClick={() => handleCustomSelect('experienceLevel', level)}
                                    className={`px-4 py-2.5 text-sm font-bold cursor-pointer flex justify-between items-center transition-colors ${formData.experienceLevel === level ? 'bg-blue-50/50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
                                 >
                                    {level}
                                    {formData.experienceLevel === level && <CheckCircle2 className="w-4 h-4 text-blue-500" />}
                                 </div>
                              ))}
                           </motion.div>
                        )}
                     </AnimatePresence>
                  </div>
                </div>

              </div>

              {/* Salary Range & Custom Currency Dropdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Min Salary</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      name="minSalary"
                      required
                      placeholder="500000"
                      value={formData.minSalary}
                      onChange={handleChange}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3.5 text-sm font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-50 focus:border-blue-300 outline-none transition-all shadow-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Max Salary</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      name="maxSalary"
                      required
                      placeholder="1200000"
                      value={formData.maxSalary}
                      onChange={handleChange}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3.5 text-sm font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-50 focus:border-blue-300 outline-none transition-all shadow-sm"
                    />
                  </div>
                </div>
                
                {/* Custom Currency Dropdown */}
                <div className="relative">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Currency</label>
                  <div className="relative z-10">
                     <button
                        type="button"
                        onClick={() => setOpenDropdown(openDropdown === 'currency' ? null : 'currency')}
                        className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border text-sm font-bold transition-all focus:outline-none shadow-sm ${
                           openDropdown === 'currency' ? 'bg-white border-blue-300 ring-2 ring-blue-50' : 'bg-gray-50 border-gray-200 hover:border-gray-300 text-gray-900'
                        }`}
                     >
                        {formData.currency}
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${openDropdown === 'currency' ? 'rotate-180 text-blue-600' : 'text-gray-400'}`} />
                     </button>

                     <AnimatePresence>
                        {openDropdown === 'currency' && (
                           <motion.div 
                              initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.15 }}
                              className="absolute top-full left-0 mt-1.5 w-full bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden py-1.5 z-30"
                           >
                              {CURRENCIES.map(currency => (
                                 <div 
                                    key={currency} 
                                    onClick={() => handleCustomSelect('currency', currency)}
                                    className={`px-4 py-2.5 text-sm font-bold cursor-pointer flex justify-between items-center transition-colors ${formData.currency === currency ? 'bg-blue-50/50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
                                 >
                                    {currency}
                                    {formData.currency === currency && <CheckCircle2 className="w-4 h-4 text-blue-500" />}
                                 </div>
                              ))}
                           </motion.div>
                        )}
                     </AnimatePresence>
                  </div>
                </div>

              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Job Description</label>
                <textarea
                  name="description"
                  required
                  rows={5}
                  placeholder="Describe the role, responsibilities, and perks..."
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-50 focus:border-blue-300 outline-none resize-y transition-all shadow-sm"
                />
              </div>

              {/* Requirements */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Requirements</label>
                <textarea
                  name="requirements"
                  rows={3}
                  placeholder="React, Node.js, TypeScript (Separate by commas)"
                  value={formData.requirements}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-50 focus:border-blue-300 outline-none resize-y transition-all shadow-sm"
                />
                <p className="text-xs font-semibold text-gray-400 mt-2 ml-1">Separate technical skills with commas (e.g. Java, Spring Boot, SQL)</p>
              </div>

              {/* Submit Button */}
              <div className="pt-6 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-4 px-4 rounded-xl hover:bg-blue-700 font-bold text-lg transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? (
                     <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                     editJobId ? <><Save className="w-5 h-5" /> Update Job Details</> : <><Save className="w-5 h-5" /> Post Job to Platform</>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostJob;