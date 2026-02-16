import { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as JobService from '../services/job.service';
import * as ApplicationService from '../services/application.service'; 
import { AuthContext } from '../context/AuthContext';
import { 
    MapPin, IndianRupee, Briefcase, Building, 
    CheckCircle2, ArrowLeft, ArrowRight, Ban, FileText, Bookmark, 
    Upload, X, Sparkles, CalendarDays
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  
  const [job, setJob] = useState<JobService.JobData | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [hasResume, setHasResume] = useState(false);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [resumeType, setResumeType] = useState<'profile' | 'upload'>('profile');
  const [customFile, setCustomFile] = useState<File | null>(null);

  const isRecruiter = auth?.user?.role === 'RECRUITER';

  useEffect(() => {
    window.scrollTo(0, 0);

    if (id) {
        fetchJobDetails();
        if (auth?.user && !isRecruiter) {
            checkApplicationStatus();
            checkSavedStatus();
            verifyResumeStatus(); 
        }
    }
  }, [id, auth?.user]); 

  const checkSavedStatus = async () => {
    try {
        const savedJobs = await JobService.getSavedJobs();
        const exists = savedJobs.some((j: any) => j.id === id);
        setIsSaved(exists);
    } catch (error) {
        console.error("Failed to check saved status");
    }
  };

  const handleToggleSave = async () => {
    if (!auth?.user) {
        toast.error("Please login to save jobs.");
        return;
    }
    try {
        const response = await JobService.toggleSaveJob(id!);
        setIsSaved(response.isSaved);
        if(response.isSaved) toast.success("Job saved successfully!");
        else toast.success("Job removed from saved list.");
    } catch (error) {
        console.error("Failed to toggle save", error);
    }
  };

  const verifyResumeStatus = async () => {
    try {
        if (auth?.user?.resumeUrl) {
            setHasResume(true);
            return;
        }
        const token = localStorage.getItem('token');
        const response = await api.get('/user/profile', {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data && response.data.resumeUrl) {
            setHasResume(true);
        }
    } catch (error) {
        console.error("Failed to verify resume status", error);
    }
  };

  const fetchJobDetails = async () => {
    try {
      const data = await JobService.getJobById(id!);
      setJob(data);
    } catch (error) {
      console.error("Error fetching job:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkApplicationStatus = async () => {
    try {
        const myApps = await ApplicationService.getMyApplications();
        const applied = myApps.some((app: any) => app.jobId === id || app.job.id === id);
        setHasApplied(applied);
    } catch (error) {
        console.error("Failed to check application status", error);
    }
  };

  const handleApplyClick = () => {
    if (!auth?.user) {
      toast.error("Please login to apply!");
      navigate('/login');
      return;
    }

    if (isRecruiter) return;
    setShowModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setCustomFile(e.target.files[0]);
      }
  };

  const submitApplication = async () => {
    if (resumeType === 'profile' && !hasResume) {
        toast.error("No profile resume found. Please upload one or update your profile.");
        return;
    }

    if (resumeType === 'upload' && !customFile) {
        toast.error("Please select a file to upload.");
        return;
    }

    setApplying(true);
    try {
      const fileToUpload = resumeType === 'upload' ? customFile! : undefined;
      await ApplicationService.applyJob(id!, fileToUpload);
      
      toast.success("Application Submitted Successfully! 🚀");
      setHasApplied(true); 
      setShowModal(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setApplying(false);
    }
  };

  const formatSalary = (min?: string | number, max?: string | number) => {
    if (!min || !max) return 'Best in Industry';
    const minNum = Number(min);
    const maxNum = Number(max);
    return `₹${(minNum / 100000).toFixed(1)}L - ₹${(maxNum / 100000).toFixed(1)}L`;
  };

  // Safe Date Formatter
  const formatTime = (dateString?: string) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50/50 py-10 px-4">
      <div className="max-w-6xl mx-auto animate-pulse">
        <div className="h-6 w-32 bg-gray-200 rounded-md mb-8"></div>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 h-64"></div>
            <div className="bg-white p-8 rounded-3xl border border-gray-100 h-96"></div>
          </div>
          <div className="lg:w-[380px]"><div className="bg-white p-6 rounded-3xl border border-gray-100 h-[400px]"></div></div>
        </div>
      </div>
    </div>
  );

  if (!job) return <div className="p-20 text-center font-bold text-gray-500 text-xl">Job not found</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-20 selection:bg-blue-100 selection:text-blue-900">
      
      <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-b from-blue-50/80 to-transparent pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 relative z-10">
        
        <button 
          onClick={() => navigate(-1)} 
          className="group flex items-center text-sm font-semibold text-gray-500 hover:text-blue-600 mb-8 transition-colors bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm hover:shadow w-fit"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> 
          Back to Jobs
        </button>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* ================= LEFT COLUMN: DETAILS ================= */}
          <div className="flex-1 w-full space-y-6">
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-indigo-600" />
              
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                <div className="w-20 h-20 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-3xl font-black text-gray-400 shrink-0">
                  {job.companyName.charAt(0)}
                </div>
                
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 mb-3 uppercase tracking-wider">
                    <Sparkles className="w-3 h-3" /> Actively Hiring
                  </div>
                  <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
                    {job.title}
                  </h1>
                  <p className="text-lg text-gray-500 font-medium flex items-center gap-2">
                    <Building className="w-5 h-5 text-gray-400" /> {job.companyName}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" /> About the role
              </h2>
              <div className="prose max-w-none text-gray-600 leading-relaxed font-medium">
                {job.description.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4">{paragraph}</p>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600" /> Key Requirements
              </h2>
              {job.requirements && job.requirements.length > 0 ? (
                <ul className="space-y-4">
                  {job.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-3 text-gray-600 font-medium">
                      <div className="mt-1.5 p-1 rounded-full bg-blue-50 text-blue-600 shrink-0">
                        <CheckCircle2 className="w-3 h-3" />
                      </div>
                      <span className="leading-relaxed">{req}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 font-medium bg-gray-50 p-4 rounded-xl border border-gray-100">No specific requirements listed.</p>
              )}
            </motion.div>
          </div>

          {/* ================= RIGHT COLUMN: STICKY ACTIONS ================= */}
          <div className="w-full lg:w-[380px] lg:sticky lg:top-24">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
              
              <div className="p-6 bg-gray-50/50 border-b border-gray-100 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1"><MapPin className="w-3 h-3"/> Location</p>
                  <p className="font-semibold text-gray-900">{job.location}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1"><Briefcase className="w-3 h-3"/> Job Type</p>
                  <p className="font-semibold text-gray-900">{job.jobType || 'Full-time'}</p>
                </div>
                <div className="col-span-2 mt-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1"><IndianRupee className="w-3 h-3"/> Package</p>
                  <p className="text-xl font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100 inline-block">
                    {formatSalary(job.minSalary, job.maxSalary)}
                  </p>
                </div>
                <div className="col-span-2 mt-2 flex items-center gap-2 text-xs font-medium text-gray-400">
                   <CalendarDays className="w-4 h-4" /> Posted on {formatTime(job.createdAt)}
                </div>
              </div>

              <div className="p-6 space-y-4">
                <button 
                  onClick={handleApplyClick} 
                  disabled={applying || hasApplied || isRecruiter} 
                  className={`w-full py-4 rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2 text-lg ${
                      isRecruiter 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' 
                      : hasApplied 
                          ? 'bg-green-100 text-green-700 cursor-not-allowed border border-green-200 shadow-none' 
                          : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-600/20 active:scale-95 hover:-translate-y-0.5'
                  }`}
                >
                  {isRecruiter ? (
                      <> <Ban className="w-5 h-5"/> Recruiters Cannot Apply </>
                  ) : hasApplied ? (
                      <> <CheckCircle2 className="w-5 h-5"/> Already Applied </>
                  ) : applying ? (
                      "Applying..."
                  ) : (
                      <> Apply for this role <ArrowRight className="w-5 h-5"/> </>
                  )}
                </button>

                {!isRecruiter && (
                    <button
                        onClick={handleToggleSave}
                        className={`w-full py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 border-2 ${
                          isSaved 
                          ? 'bg-blue-50 border-blue-200 text-blue-700' 
                          : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-blue-600' : ''}`} /> 
                        {isSaved ? 'Saved to Profile' : 'Save for later'}
                    </button>
                )}
              </div>
            </motion.div>
          </div>

        </div>
      </div>

      {/* ================= APPLY MODAL ================= */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
              <motion.div 
                initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl border border-gray-100"
              >
                  <div className="flex justify-between items-start mb-6">
                      <div>
                        <h2 className="text-2xl font-extrabold text-gray-900">Submit Application</h2>
                        <p className="text-gray-500 font-medium mt-1">For {job.title} at {job.companyName}</p>
                      </div>
                      <button onClick={() => setShowModal(false)} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500"/>
                      </button>
                  </div>

                  <div className="space-y-4 mb-8 mt-4">
                      <p className="text-sm font-bold text-gray-700 uppercase tracking-wider">Select your resume</p>
                      
                      <label 
                        onClick={() => setResumeType('profile')}
                        className={`flex items-start gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${resumeType === 'profile' ? 'border-blue-500 bg-blue-50/50 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}
                      >
                          <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${resumeType === 'profile' ? 'border-blue-600' : 'border-gray-300'}`}>
                            {resumeType === 'profile' && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
                          </div>
                          <div>
                              <p className="font-bold text-gray-900 flex items-center gap-2 text-lg">
                                  <FileText className="w-5 h-5 text-blue-600"/> Use Profile Resume
                              </p>
                              {!hasResume ? (
                                  <p className="text-sm text-red-500 mt-1.5 font-semibold bg-red-50 inline-block px-2 py-1 rounded">No resume found on profile.</p>
                              ) : (
                                  <p className="text-sm text-gray-500 mt-1 font-medium">Submit the default resume saved in your profile.</p>
                              )}
                          </div>
                      </label>

                      <label 
                        onClick={() => setResumeType('upload')}
                        className={`flex items-start gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${resumeType === 'upload' ? 'border-blue-500 bg-blue-50/50 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}
                      >
                          <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${resumeType === 'upload' ? 'border-blue-600' : 'border-gray-300'}`}>
                            {resumeType === 'upload' && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
                          </div>
                          <div className="flex-1">
                              <p className="font-bold text-gray-900 flex items-center gap-2 text-lg">
                                  <Upload className="w-5 h-5 text-blue-600"/> Upload Custom Resume
                              </p>
                              <p className="text-sm text-gray-500 mt-1 font-medium mb-3">Upload a tailored PDF resume just for this role.</p>
                              
                              <AnimatePresence>
                                {resumeType === 'upload' && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                      <input 
                                          type="file" accept=".pdf" onChange={handleFileChange}
                                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-white file:border-gray-200 file:border file:text-gray-700 hover:file:bg-gray-50 file:transition-colors file:cursor-pointer"
                                      />
                                    </motion.div>
                                )}
                              </AnimatePresence>
                          </div>
                      </label>
                  </div>

                  <button 
                      onClick={submitApplication}
                      disabled={applying || (resumeType === 'upload' && !customFile) || (resumeType === 'profile' && !hasResume)}
                      className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]"
                  >
                      {applying ? "Submitting Application..." : "Confirm & Submit Application"}
                  </button>
              </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default JobDetails;