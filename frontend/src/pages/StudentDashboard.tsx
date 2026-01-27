import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import * as JobService from '../services/job.service';
import { MapPin, IndianRupee, Clock, Briefcase } from 'lucide-react'; 

interface Job {
  id: string;
  title: string;
  companyName: string;
  location: string;
  salary: string;
  description: string;
  jobType: string;
}

const StudentDashboard = () => {
  const auth = useContext(AuthContext);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      if (auth?.token) {
        const data = await JobService.getAllJobs(auth.token);
        setJobs(data);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [auth?.token]);

  const handleApply = async (jobId: string) => {
    if (!confirm("Are you sure you want to apply for this job?")) return;
    try {
      if (auth?.token) {
        await JobService.applyForJob(jobId, auth.token);
        alert("Applied Successfully! Good Luck 🚀");
      }
    } catch (error: any) {
      alert(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Find Your Dream Job</h1>
        <p className="text-gray-500 mt-1">
          Welcome back, <span className="font-semibold text-blue-600">{auth?.user?.firstName}</span> 👋. Here are the latest openings for you.
        </p>
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading jobs...</div>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.length > 0 ? (
            jobs.map((job) => (
              <div key={job.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-6 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 line-clamp-1">{job.title}</h3>
                      <p className="text-sm font-medium text-blue-600 mb-1">{job.companyName}</p>
                    </div>
                    <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                      {job.jobType}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" /> {job.location}
                    </div>
                    <div className="flex items-center gap-2">
                      <IndianRupee className="w-4 h-4 text-gray-400" /> {job.salary}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" /> Posted Recently
                    </div>
                  </div>
                  
                  <p className="text-gray-500 text-sm mb-6 line-clamp-3">
                    {job.description}
                  </p>
                </div>

                <button 
                  onClick={() => handleApply(job.id)}
                  className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition active:scale-95"
                >
                  Apply Now
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
              <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900">No Jobs Found</h3>
              <p className="text-gray-500">Recruiters haven't posted any jobs yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;