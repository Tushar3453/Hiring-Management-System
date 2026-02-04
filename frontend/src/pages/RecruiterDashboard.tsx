import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Added useNavigate
import * as JobService from '../services/job.service';
import { 
  Briefcase, 
  Users, 
  MapPin, 
  Plus, 
  Edit,      
  Power,      
} from 'lucide-react';

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
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
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
    if(!confirm(`Are you sure you want to ${action} this job?`)) return;

    try {
      // Call Backend
      await JobService.updateJob(jobId, { isOpen: !currentStatus });

      // Update UI Locally (Optimistic Update)
      setJobs(prevJobs => prevJobs.map(job => 
        job.id === jobId ? { ...job, isOpen: !currentStatus } : job
      ));
    } catch (error) {
      console.error("Failed to update status", error);
      alert("Failed to update job status.");
    }
  };

  // ---  Handle Edit Navigation ---
  const handleEdit = (jobId: string) => {
    // using query params to pass jobId to PostJob page
    navigate(`/post-job?edit=${jobId}`);
  };

  if (loading) return <div className="p-10 text-center">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Recruiter Dashboard</h1>
            <p className="text-gray-500">Manage your job postings and applications</p>
          </div>
          <Link 
            to="/post-job" 
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
          >
            <Plus className="w-5 h-5" /> Post New Job
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Active Jobs</p>
                {/* Count only Open Jobs */}
                <h3 className="text-2xl font-bold text-gray-900">
                  {jobs.filter(j => j.isOpen).length}
                </h3>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Total Applications</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {jobs.reduce((acc, job) => acc + job._count.apps, 0)}
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Jobs List */}
        <h2 className="text-lg font-bold text-gray-900 mb-4">Your Job Postings</h2>
        
        {jobs.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
            <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No jobs posted yet</h3>
            <p className="text-gray-500 mt-2 mb-6">Create your first job posting to start hiring.</p>
            <Link to="/post-job" className="text-blue-600 hover:underline font-medium">Create Job Post</Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {jobs.map((job) => (
              <div 
                key={job.id} 
                className={`bg-white rounded-xl shadow-sm border p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all ${
                  job.isOpen ? 'border-gray-100' : 'border-red-100 bg-red-50/20'
                }`}
              >
                
                {/* Job Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className={`text-lg font-bold ${job.isOpen ? 'text-gray-900' : 'text-gray-500'}`}>
                      {job.title}
                    </h3>
                    {/* Status Badge */}
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide border ${
                      job.isOpen 
                      ? 'bg-green-50 text-green-700 border-green-200' 
                      : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {job.isOpen ? 'Active' : 'Closed'}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-gray-500 text-sm mt-1">
                    <span className="flex items-center gap-1"><Briefcase className="w-4 h-4"/> {job.companyName}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4"/> {job.location}</span>
                    <span>• Posted on {new Date(job.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Actions Section */}
                <div className="flex items-center gap-4 w-full md:w-auto mt-4 md:mt-0">
                  
                  {/* Stats */}
                  <div className="text-center px-2">
                    <span className="block text-xl font-bold text-gray-900">{job._count.apps}</span>
                    <span className="text-xs text-gray-500 font-medium uppercase">Apps</span>
                  </div>

                  <div className="h-8 w-px bg-gray-200 mx-1 hidden md:block"></div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    
                    {/* View Apps */}
                    <Link 
                      to={`/job/${job.id}/applications`} 
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors tooltip"
                      title="View Applications"
                    >
                      <Users className="w-5 h-5" />
                    </Link>

                    {/* Edit Job */}
                    <button 
                      onClick={() => handleEdit(job.id)}
                      className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Edit Job"
                    >
                      <Edit className="w-5 h-5" />
                    </button>

                    {/* Close/Reopen Job */}
                    <button 
                      onClick={() => handleToggleStatus(job.id, job.isOpen)}
                      className={`p-2 rounded-lg transition-colors ${
                        job.isOpen 
                        ? 'text-gray-600 hover:text-red-600 hover:bg-red-50' 
                        : 'text-red-600 bg-red-50 hover:bg-red-100'
                      }`}
                      title={job.isOpen ? "Close Job" : "Reopen Job"}
                    >
                      <Power className="w-5 h-5" />
                    </button>
                  
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecruiterDashboard;