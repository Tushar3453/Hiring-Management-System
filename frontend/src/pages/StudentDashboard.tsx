import { useContext, useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import * as JobService from '../services/job.service';
import { 
  MapPin, 
  IndianRupee, 
  Briefcase, 
  Search, 
  Clock, 
  Filter,
  Bookmark // <--- Imported Bookmark Icon
} from 'lucide-react'; 

interface Job {
  id: string;
  title: string;
  companyName: string;
  location: string;
  minSalary: number;
  maxSalary: number;
  description: string;
  jobType: string;
  createdAt: string;
}

const StudentDashboard = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  // --- NEW: State for Saved Jobs ---
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());

  // Search State
  const [query, setQuery] = useState(searchParams.get('query') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const data = await JobService.getAllJobs(query, location);
      setJobs(data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- NEW: Fetch Saved Jobs IDs ---
  const fetchSavedJobs = async () => {
    if (!auth?.user) return;
    try {
      const savedData = await JobService.getSavedJobs();
      // Extract IDs and store in a Set for O(1) lookup
      const ids = new Set<string>(savedData.map((job: any) => job.id as string));
      setSavedJobIds(ids);
    } catch (error) {
      console.error("Error fetching saved jobs:", error);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchSavedJobs(); // <--- Call on mount
  }, []);

  // --- Handle Toggle Save ---
  const handleToggleSave = async (jobId: string) => {
    if (!auth?.user) {
      alert("Please login to save jobs.");
      return;
    }

    try {
      const response = await JobService.toggleSaveJob(jobId);
      
      setSavedJobIds(prev => {
        const newSet = new Set(prev);
        if (response.isSaved) {
          newSet.add(jobId);
        } else {
          newSet.delete(jobId);
        }
        return newSet;
      });
    } catch (error) {
      console.error("Failed to toggle save:", error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs();
  };

  const formatSalary = (min: number, max: number) => {
    if (!min || !max) return 'Best in Industry';
    return `₹${(min / 100000).toFixed(1)}L - ₹${(max / 100000).toFixed(1)}L`;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      
      {/* === HEADER & SEARCH SECTION === */}
      <div className="bg-white border-b border-gray-200 pt-12 pb-16 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto text-center">
          
          <div className="mb-10">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
              Find your next <span className="text-blue-600">opportunity</span>
            </h1>
            <p className="text-lg text-gray-500">
              Welcome back, <span className="font-semibold text-gray-900">{auth?.user?.firstName}</span>! 
              We found <span className="font-semibold text-blue-600">{jobs.length}</span> new jobs for you.
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-4xl mx-auto bg-white p-2 rounded-2xl shadow-xl border border-gray-100 flex flex-col md:flex-row gap-2 ring-1 ring-gray-100/50">
            <div className="flex-1 flex items-center px-4 h-14 bg-gray-50 rounded-xl border border-transparent focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-300 transition-all text-left">
              <Search className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
              <input 
                type="text" 
                placeholder="Job title, keywords..." 
                className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400 font-medium"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            
            <div className="flex-1 flex items-center px-4 h-14 bg-gray-50 rounded-xl border border-transparent focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-300 transition-all text-left">
              <MapPin className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
              <input 
                type="text" 
                placeholder="City (e.g. Bangalore)" 
                className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400 font-medium"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <button 
              type="submit" 
              className="h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 whitespace-nowrap"
            >
              Search
            </button>
          </form>

        </div>
      </div>

      {/* === JOBS GRID SECTION === */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
        
        {/* Filter Row */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recommended Jobs</h2>
          <button className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm font-medium bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm transition-colors hover:bg-gray-50">
            <Filter className="w-4 h-4" /> Filters
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {[1,2,3].map(i => (
               <div key={i} className="h-64 bg-gray-200 rounded-xl animate-pulse"></div>
             ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.length > 0 ? (
              jobs.map((job) => (
                <div 
                  key={job.id} 
                  className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-blue-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      {/* Company Info */}
                      <div className="flex gap-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-bold text-xl group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-sm">
                          {job.companyName.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                            {job.title}
                          </h3>
                          <p className="text-sm font-medium text-gray-500">{job.companyName}</p>
                        </div>
                      </div>

                      {/* --- Bookmark Button --- */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleSave(job.id);
                        }}
                        className="text-gray-400 hover:text-blue-600 transition p-1"
                        title={savedJobIds.has(job.id) ? "Remove from Saved" : "Save Job"}
                      >
                        <Bookmark 
                          className={`w-6 h-6 ${savedJobIds.has(job.id) ? 'fill-blue-600 text-blue-600' : ''}`} 
                        />
                      </button>
                    </div>

                    {/* Job Details Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                       <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                         <MapPin className="w-3 h-3" /> {job.location}
                       </span>
                       <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                         <IndianRupee className="w-3 h-3" /> {formatSalary(job.minSalary, job.maxSalary)}
                       </span>
                       <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                         <Briefcase className="w-3 h-3" /> {job.jobType || 'Full Time'}
                       </span>
                    </div>

                    <p className="text-gray-500 text-sm mb-6 line-clamp-2 leading-relaxed">
                      {job.description}
                    </p>
                  </div>

                  {/* Footer Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                    <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {formatTime(job.createdAt)}
                    </span>
                    
                    <button 
                      onClick={() => navigate(`/jobs/${job.id}`)}
                      className="text-sm font-semibold text-blue-600 hover:text-white hover:bg-blue-600 px-5 py-2 rounded-lg transition-all border border-blue-100 hover:border-transparent hover:shadow-md"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center">
                <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
                   <Briefcase className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">No Jobs Found</h3>
                <p className="text-gray-500 mt-1 max-w-sm mx-auto">
                  Try adjusting your search criteria.
                </p>
                <button 
                  onClick={() => {setQuery(''); setLocation(''); fetchJobs();}}
                  className="mt-4 text-blue-600 font-medium hover:underline"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;