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
  Bookmark,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'; 
import { motion } from 'framer-motion';
import JobCardSkeleton from '../components/JobCardSkeleton'; 

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

  // === PAGINATION STATES ===
  const [totalJobs, setTotalJobs] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);

  // State for Saved Jobs
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());

  // Search State
  const [query, setQuery] = useState(searchParams.get('query') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');

  const loadJobs = async (pageNum: number) => {
    setLoading(true);
    try {
      const data = await JobService.getAllJobs(query, location, pageNum);
      
      setJobs(data.jobs); 
      setTotalJobs(data.meta.totalJobs); 
      setTotalPages(data.meta.totalPages);
      setPage(pageNum);
      
      // Smooth scroll to top when page changes
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedJobs = async () => {
    if (!auth?.user) return;
    try {
      const savedData = await JobService.getSavedJobs();
      const ids = new Set<string>(savedData.map((job: any) => job.id as string));
      setSavedJobIds(ids);
    } catch (error) {
      console.error("Error fetching saved jobs:", error);
    }
  };

  useEffect(() => {
    loadJobs(1);
    fetchSavedJobs();
  }, []);

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
    loadJobs(1); // Search hamesha page 1 se start hoga
  };

  const formatSalary = (min: number, max: number) => {
    if (!min || !max) return 'Best in Industry';
    return `₹${(min / 100000).toFixed(1)}L - ₹${(max / 100000).toFixed(1)}L`;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Pagination UI Generator (To show max 5 page numbers)
  const renderPaginationButtons = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    let startPage = Math.max(1, page - 2);
    let endPage = Math.min(totalPages, page + 2);

    if (page <= 3) {
      endPage = Math.min(5, totalPages);
    }
    if (page >= totalPages - 2) {
      startPage = Math.max(1, totalPages - 4);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => loadJobs(i)}
          className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold transition-all ${
            page === i
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-blue-300'
          }`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="mt-12 flex justify-center items-center gap-2">
        <button
          onClick={() => loadJobs(page - 1)}
          disabled={page === 1}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        {pageNumbers}

        <button
          onClick={() => loadJobs(page + 1)}
          disabled={page === totalPages}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans">
      
      {/* === HEADER & SEARCH SECTION === */}
      <div className="relative bg-white border-b border-gray-200 pt-16 pb-20 px-4 sm:px-8 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-50/80 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f8fafc_1px,transparent_1px),linear-gradient(to_bottom,#f8fafc_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-70" />

        <div className="max-w-7xl mx-auto text-center relative z-10">
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
              Find your next <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">opportunity</span>
            </h1>
            <p className="text-lg text-gray-500 font-medium max-w-2xl mx-auto">
              Welcome back, <span className="font-bold text-gray-900">{auth?.user?.firstName}</span>! 
              We found <span className="font-bold text-blue-600 px-1">{totalJobs}</span> new jobs for you.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.form 
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            onSubmit={handleSearch} 
            className="max-w-4xl mx-auto bg-white p-2 rounded-2xl shadow-xl shadow-blue-900/5 border border-gray-100 flex flex-col md:flex-row gap-2 ring-1 ring-gray-100/50 focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-50 transition-all"
          >
            <div className="flex-1 flex items-center px-4 h-14 bg-transparent rounded-xl transition-all text-left">
              <Search className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
              <input 
                type="text" 
                placeholder="Job title, keywords..." 
                className="w-full bg-transparent outline-none text-gray-900 placeholder-gray-400 font-medium"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            
            <div className="hidden md:block w-[1px] bg-gray-100 my-2"></div>

            <div className="flex-1 flex items-center px-4 h-14 bg-transparent rounded-xl transition-all text-left">
              <MapPin className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
              <input 
                type="text" 
                placeholder="City (e.g. Bangalore)" 
                className="w-full bg-transparent outline-none text-gray-900 placeholder-gray-400 font-medium"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <button 
              type="submit" 
              className="h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 whitespace-nowrap active:scale-95"
            >
              Search
            </button>
          </motion.form>

        </div>
      </div>

      {/* === JOBS GRID SECTION === */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mb-20">
        
        {/* Filter Row */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Recommended Jobs</h2>
          <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 text-sm font-semibold bg-white px-5 py-2.5 rounded-xl border border-gray-200 shadow-sm transition-all hover:border-blue-200 hover:bg-blue-50 active:scale-95">
            <Filter className="w-4 h-4" /> Filters
          </button>
        </div>

        {loading ? (
          // === SKELETON LOADERS (3 Columns) ===
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {[1,2,3,4,5,6,7,8,9].map(i => (
               <JobCardSkeleton key={i} />
             ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.length > 0 ? (
                jobs.map((job, index) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    key={job.id} 
                    onClick={() => navigate(`/jobs/${job.id}`)}
                    className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-blue-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full cursor-pointer"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-4">
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

                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleSave(job.id);
                          }}
                          className="text-gray-300 hover:text-blue-600 transition p-1.5 rounded-lg hover:bg-blue-50 shrink-0"
                          title={savedJobIds.has(job.id) ? "Remove from Saved" : "Save Job"}
                        >
                          <Bookmark 
                            className={`w-5 h-5 ${savedJobIds.has(job.id) ? 'fill-blue-600 text-blue-600' : ''}`} 
                          />
                        </button>
                      </div>

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

                    <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                      <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {formatTime(job.createdAt)}
                      </span>
                      
                      <button 
                        className="text-sm font-semibold text-blue-600 group-hover:text-white group-hover:bg-blue-600 px-5 py-2 rounded-lg transition-all border border-blue-100 group-hover:border-transparent group-hover:shadow-md"
                      >
                        View Details
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="col-span-full py-24 text-center bg-white rounded-3xl border border-gray-100 shadow-sm"
                >
                  <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-100">
                     <Search className="w-10 h-10 text-gray-300" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No jobs matched your search</h3>
                  <p className="text-gray-500 max-w-sm mx-auto font-medium mb-6">
                    Try adjusting your keywords or location to find more opportunities.
                  </p>
                  <button 
                    onClick={() => {setQuery(''); setLocation(''); loadJobs(1);}}
                    className="px-6 py-2.5 bg-white text-gray-700 border border-gray-200 font-bold rounded-xl shadow-sm hover:bg-gray-50 hover:text-blue-600 transition-all"
                  >
                    Clear Filters
                  </button>
                </motion.div>
              )}
            </div>

            {/* === NUMBERED PAGINATION === */}
            {renderPaginationButtons()}
          </>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;