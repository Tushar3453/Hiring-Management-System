import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import * as JobService from '../services/job.service';
import { 
  Briefcase, 
  Users, 
  MapPin, 
  Plus, 
  Edit,      
  Power,
  BarChart3,
  CalendarDays,
  ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';

interface JobWithCount extends JobService.JobData {
  id: string;
  createdAt: string;
  isOpen: boolean;
  _count: {
    apps: number;
  };
}

const RecruiterDashboard = () => {
  const [jobs, setJobs] = useState<JobWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); 

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchMyJobs();
  }, []);

  const fetchMyJobs = async () => {
    try {
      const data = await JobService.getMyJobs();
      setJobs(data);
    } catch (error) {
      console.error("Failed to load jobs", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Handle Close/Reopen ---
  const handleToggleStatus = async (jobId: string, currentStatus: boolean) => {
    const action = currentStatus ? "close" : "reopen";
    if(!window.confirm(`Are you sure you want to ${action} this job?`)) return;

    try {
      await JobService.updateJob(jobId, { isOpen: !currentStatus });

      setJobs(prevJobs => prevJobs.map(job => 
        job.id === jobId ? { ...job, isOpen: !currentStatus } : job
      ));
    } catch (error) {
      console.error("Failed to update status", error);
      alert("Failed to update job status.");
    }
  };

  // --- Handle Edit Navigation ---
  const handleEdit = (jobId: string) => {
    navigate(`/post-job?edit=${jobId}`);
  };

  // --- Handle View Job Details ---
  const handleViewJob = (jobId: string) => {
    navigate(`/jobs/${jobId}`);
  };

  // Derived Stats
  const activeJobsCount = jobs.filter(j => j.isOpen).length;
  const totalAppsCount = jobs.reduce((acc, job) => acc + job._count.apps, 0);
  const avgAppsPerJob = jobs.length > 0 ? Math.round(totalAppsCount / jobs.length) : 0;

  if (loading) return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto animate-pulse">
        <div className="h-10 bg-gray-200 rounded-lg w-1/3 mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[1,2,3].map(i => <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>)}
        </div>
        <div className="space-y-4">
           {[1,2,3].map(i => <div key={i} className="h-28 bg-gray-200 rounded-2xl"></div>)}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-20 selection:bg-blue-100 selection:text-blue-900 relative">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-50/80 to-transparent pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 relative z-10">
        
        {/* ================= HEADER SECTION ================= */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Recruiter Dashboard</h1>
            <p className="text-gray-500 font-medium mt-1">Manage your active job postings and track applicants.</p>
          </div>
          <Link 
            to="/post-job" 
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-all font-medium shadow-sm shadow-blue-600/20 active:scale-95 shrink-0"
          >
            <Plus className="w-5 h-5" /> Post New Job
          </Link>
        </motion.div>

        {/* ================= STATS CARDS ================= */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out z-0"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">Active Postings</p>
                <h3 className="text-3xl font-bold text-gray-900">{activeJobsCount}</h3>
              </div>
              <div className="p-4 bg-blue-100 text-blue-600 rounded-2xl">
                <Briefcase className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out z-0"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">Total Applicants</p>
                <h3 className="text-3xl font-bold text-gray-900">{totalAppsCount}</h3>
              </div>
              <div className="p-4 bg-indigo-100 text-indigo-600 rounded-2xl">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-green-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out z-0"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">Avg. Apps / Job</p>
                <h3 className="text-3xl font-bold text-gray-900">{avgAppsPerJob}</h3>
              </div>
              <div className="p-4 bg-green-100 text-green-600 rounded-2xl">
                <BarChart3 className="w-6 h-6" />
              </div>
            </div>
          </div>

        </motion.div>

        {/* ================= JOBS LIST ================= */}
        <div className="flex items-center justify-between mb-6">
           <h2 className="text-lg font-bold text-gray-900 tracking-tight">Your Job Postings</h2>
        </div>
        
        {jobs.length === 0 ? (
          // Empty State
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
            <div className="bg-blue-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-100">
               <Briefcase className="w-10 h-10 text-blue-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No jobs posted yet</h3>
            <p className="text-gray-500 font-medium mb-8 max-w-md mx-auto">You haven't created any job postings. Create one now to start attracting top talent!</p>
            <Link to="/post-job" className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-all shadow-sm active:scale-95">
              <Plus className="w-5 h-5" /> Create First Job
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job, index) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                key={job.id} 
                className={`bg-white rounded-2xl shadow-sm border p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition-all hover:shadow-md ${
                  job.isOpen ? 'border-gray-200 hover:border-blue-300' : 'border-gray-200 bg-gray-50/50 grayscale-[20%]'
                }`}
              >
                
                {/* Job Info (Left Side) */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {/* Clickable Title to View Job Details */}
                    <button 
                      onClick={() => handleViewJob(job.id)}
                      className="group inline-flex items-center gap-2 text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors text-left"
                    >
                      {job.title}
                      <ExternalLink className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </button>
                    
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider border ${
                      job.isOpen 
                      ? 'bg-green-50 text-green-700 border-green-200 shadow-sm' 
                      : 'bg-gray-100 text-gray-600 border-gray-200'
                    }`}>
                      {job.isOpen ? 'Active' : 'Closed'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-gray-500 text-sm font-medium">
                    <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4"/> {job.companyName}</span>
                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4"/> {job.location}</span>
                    <span className="flex items-center gap-1.5"><CalendarDays className="w-4 h-4"/> {new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>

                {/* Actions & Stats (Right Side) */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 w-full md:w-auto mt-2 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
                  
                  {/* Applicant Stat Block */}
                  <div className="bg-blue-50/50 px-4 py-2 rounded-xl border border-blue-100 flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm text-blue-600">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="block text-xl font-bold text-gray-900 leading-none">{job._count.apps}</span>
                      <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                        {/* Dynamic Applicant / Applicants Logic */}
                        {job._count.apps === 1 ? 'Applicant' : 'Applicants'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    
                    {/* View Applications Button */}
                    <button 
                      onClick={() => navigate(`/job/${job.id}/applications`)}
                      className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm active:scale-95"
                    >
                      View Applications
                    </button>

                    {/* Edit Job */}
                    <button 
                      onClick={() => handleEdit(job.id)}
                      className="p-2.5 bg-white border border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 rounded-xl transition-all shadow-sm tooltip"
                      title="Edit Job"
                    >
                      <Edit className="w-5 h-5" />
                    </button>

                    {/* Close/Reopen Job */}
                    <button 
                      onClick={() => handleToggleStatus(job.id, job.isOpen)}
                      className={`p-2.5 rounded-xl border transition-all shadow-sm tooltip ${
                        job.isOpen 
                        ? 'bg-white border-gray-200 text-red-500 hover:bg-red-50 hover:border-red-200' 
                        : 'bg-white border-gray-200 text-green-600 hover:bg-green-50 hover:border-green-200'
                      }`}
                      title={job.isOpen ? "Close Job Posting" : "Reopen Job Posting"}
                    >
                      <Power className="w-5 h-5" />
                    </button>
                  
                  </div>
                </div>

              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecruiterDashboard;