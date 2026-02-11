import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as JobService from '../services/job.service';
import * as ApplicationService from '../services/application.service'; 
import { Bookmark, MapPin, IndianRupee, Clock, Briefcase, CheckCircle2 } from 'lucide-react';

const SavedJobs = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set()); // <--- Track applied jobs
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Parallel fetch: Get Saved Jobs AND Applied Jobs
      const [savedData, applicationsData] = await Promise.all([
        JobService.getSavedJobs(),
        ApplicationService.getMyApplications()
      ]);

      setJobs(savedData);

      const appliedIds = new Set<string>(applicationsData.map((app: any) => app.job.id));
      setAppliedJobIds(appliedIds);

    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (e: React.MouseEvent, jobId: string) => {
    e.stopPropagation(); 
    if(!confirm("Remove from saved jobs?")) return;
    
    await JobService.toggleSaveJob(jobId);
    setJobs(jobs.filter(job => job.id !== jobId)); 
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
          <Bookmark className="w-8 h-8 text-blue-600 fill-blue-600" /> Saved Jobs
        </h1>

        {loading ? (
           <div className="flex h-64 items-center justify-center text-gray-500">Loading saved jobs...</div> 
        ) : jobs.length === 0 ? (
           <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
             <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bookmark className="w-8 h-8 text-gray-300" />
             </div>
             <h3 className="text-lg font-bold text-gray-900">No saved jobs yet</h3>
             <p className="text-gray-500 mt-2">Jobs you bookmark will appear here for quick access.</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => {
              const isApplied = appliedJobIds.has(job.id);

              return (
                <div 
                  key={job.id} 
                  onClick={() => navigate(`/jobs/${job.id}`)}
                  className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer relative group flex flex-col h-full"
                >
                  
                  {/* --- Header: Logo & Title --- */}
                  <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-4">
                        {/* Company Logo Placeholder */}
                        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-bold text-2xl">
                            {job.companyName?.[0] || "C"}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 line-clamp-1 leading-tight" title={job.title}>
                                {job.title}
                            </h3>
                            <p className="text-gray-500 font-medium text-sm mt-1">{job.companyName}</p>
                        </div>
                      </div>
                      
                      {/* Bookmark Icon */}
                      <button 
                          onClick={(e) => handleUnsave(e, job.id)}
                          className="text-blue-600 hover:text-red-500 transition"
                          title="Remove Bookmark"
                      >
                          <Bookmark className="w-6 h-6 fill-current" />
                      </button>
                  </div>

                  {/* --- Tags Row (Colors matched to image) --- */}
                  <div className="flex flex-wrap gap-2 mb-6">
                      {/* Location: Gray */}
                      <span className="flex items-center gap-1 bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg text-sm font-semibold">
                          <MapPin className="w-3.5 h-3.5" /> {job.location}
                      </span>
                      
                      {/* Salary: Green */}
                      <span className="flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-sm font-semibold">
                          <IndianRupee className="w-3.5 h-3.5" /> 
                          {job.minSalary && job.maxSalary 
                              ? `${(job.minSalary / 100000).toFixed(1)}L - ${(job.maxSalary / 100000).toFixed(1)}L` 
                              : 'Disclosed'}
                      </span>

                      {/* Type: Blue */}
                      <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-semibold">
                          <Briefcase className="w-3.5 h-3.5" />
                          {job.jobType || 'Full Time'}
                      </span>
                  </div>

                  {/* --- Description / Status Text --- */}
                  <div className="mb-6 flex-1">
                      {isApplied ? (
                          <p className="text-green-600 font-bold flex items-center gap-2">
                             <CheckCircle2 className="w-4 h-4" /> Application Submitted
                          </p>
                      ) : (
                          <p className="text-gray-400 text-sm font-medium line-clamp-2">
                              {job.description ? job.description : "No description provided."}
                          </p>
                      )}
                  </div>

                  {/* --- Footer: Date & Button --- */}
                  <div className="flex items-center justify-between pt-2 mt-auto">
                      <div className="flex items-center gap-1.5 text-gray-400 text-sm font-medium">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>

                      <button className="border border-blue-200 text-blue-600 font-semibold px-5 py-2 rounded-xl hover:bg-blue-50 transition-colors text-sm">
                          View Details
                      </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedJobs;