import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as JobService from '../services/job.service';
import { Briefcase, Users, MapPin, Plus, ExternalLink } from 'lucide-react';

interface JobWithCount extends JobService.JobData {
  id: string;
  createdAt: string;
  _count: {
    apps: number;
  };
}

const RecruiterDashboard = () => {
  const [jobs, setJobs] = useState<JobWithCount[]>([]);
  const [loading, setLoading] = useState(true);

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

        {/* Stats Cards  */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Active Jobs</p>
                <h3 className="text-2xl font-bold text-gray-900">{jobs.length}</h3>
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
              <div key={job.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-shadow">
                
                {/* Job Info */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{job.title}</h3>
                  <div className="flex items-center gap-4 text-gray-500 text-sm mt-1">
                    <span className="flex items-center gap-1"><Briefcase className="w-4 h-4"/> {job.companyName}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4"/> {job.location}</span>
                    <span>• Posted on {new Date(job.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Actions & Count */}
                <div className="flex items-center gap-6 w-full md:w-auto mt-2 md:mt-0">
                  <div className="text-center px-4">
                    <span className="block text-2xl font-bold text-gray-900">{job._count.apps}</span>
                    <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Applicants</span>
                  </div>
                  
                  <Link 
                    to={`/job/${job.id}/applications`} 
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                  >
                    Check Applications <ExternalLink className="w-4 h-4" />
                  </Link>
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