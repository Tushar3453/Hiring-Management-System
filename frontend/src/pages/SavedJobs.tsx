import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as JobService from '../services/job.service';
import { Bookmark, MapPin, ArrowRight } from 'lucide-react';

const SavedJobs = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    try {
      const data = await JobService.getSavedJobs();
      setJobs(data);
    } catch (error) {
      console.error("Failed to fetch saved jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (e: React.MouseEvent, jobId: string) => {
    e.stopPropagation(); // Prevent clicking the card
    if(!confirm("Remove from saved jobs?")) return;
    
    await JobService.toggleSaveJob(jobId);
    fetchSavedJobs(); // Refresh list
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-2">
          <Bookmark className="w-8 h-8 text-blue-600" /> Saved Jobs
        </h1>

        {loading ? (
           <p>Loading...</p> 
        ) : jobs.length === 0 ? (
           <div className="text-center py-20">
             <p className="text-gray-500 text-lg">You haven't saved any jobs yet.</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <div 
                key={job.id} 
                onClick={() => navigate(`/jobs/${job.id}`)}
                className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition cursor-pointer relative group"
              >
                {/* Unsave Button */}
                <button 
                  onClick={(e) => handleUnsave(e, job.id)}
                  className="absolute top-4 right-4 p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-red-50 hover:text-red-600 transition"
                  title="Remove Bookmark"
                >
                  <Bookmark className="w-5 h-5 fill-current" />
                </button>

                <h3 className="text-xl font-bold text-gray-900 mb-1">{job.title}</h3>
                <p className="text-gray-500 mb-4">{job.companyName}</p>
                
                <div className="flex gap-2 text-sm text-gray-600 mb-4">
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4"/> {job.location}</span>
                </div>

                <div className="text-blue-600 font-semibold text-sm flex items-center gap-1">
                    View Details <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedJobs;