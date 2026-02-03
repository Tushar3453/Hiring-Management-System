import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as JobService from '../services/job.service';
import { Search, MapPin, ArrowRight, Building, IndianRupee } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  companyName: string;
  location: string;
  minSalary?: string | number;
  maxSalary?: string | number;
  jobType?: string;
  currency?: string;
}

const Home = () => {
  const navigate = useNavigate();
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  // Search States
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');

  // Handle Search Redirect
  const handleSearch = () => {
    navigate(`/student-dashboard?query=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`);
  };

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await JobService.getAllJobs(); 
        setFeaturedJobs(data.slice(0, 3)); 
      } catch (error) {
        console.log("Using dummy data for home page preview");
        setFeaturedJobs([
          { id: '1', title: 'Frontend Developer', companyName: 'TechCorp', location: 'Bangalore', minSalary: 800000, maxSalary: 1500000, jobType: 'Full-time' },
          { id: '2', title: 'Product Designer', companyName: 'CreativeStudio', location: 'Mumbai', minSalary: 600000, maxSalary: 1200000, jobType: 'Remote' },
          { id: '3', title: 'Backend Engineer', companyName: 'DataSystems', location: 'Delhi NCR', minSalary: 1000000, maxSalary: 2000000, jobType: 'Full-time' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      
      {/* HERO SECTION */}
      <div className="relative bg-gradient-to-b from-blue-50 to-white pt-20 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight mb-6">
            Find Your <span className="text-blue-600">Dream Job</span> <br /> 
            Without The Hassle.
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            HireHub connects you with top companies. Create your profile, upload your resume, and get hired today.
          </p>

          {/* SEARCH BAR */}
          <div className="bg-white p-3 rounded-2xl shadow-xl border border-gray-100 flex flex-col sm:flex-row gap-2 max-w-3xl mx-auto">
            <div className="flex-1 flex items-center px-4 bg-gray-50 rounded-xl border border-gray-100 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <Search className="w-5 h-5 text-gray-400 mr-3" />
              <input 
                type="text" 
                placeholder="Job title, keywords, or company" 
                className="w-full bg-transparent py-3 outline-none text-gray-700 placeholder-gray-400"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            
            <div className="flex-1 flex items-center px-4 bg-gray-50 rounded-xl border border-gray-100 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <MapPin className="w-5 h-5 text-gray-400 mr-3" />
              <input 
                type="text" 
                placeholder="Location (e.g. Bangalore)" 
                className="w-full bg-transparent py-3 outline-none text-gray-700 placeholder-gray-400"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <button 
              onClick={handleSearch}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl transition-all shadow-md hover:shadow-lg transform active:scale-95"
            >
              Search
            </button>
          </div>

          <div className="mt-8 text-sm text-gray-500 font-medium">
            Popular: <span className="text-gray-700 hover:text-blue-600 cursor-pointer mx-1" onClick={() => setQuery('Frontend')}>Frontend</span> • <span className="text-gray-700 hover:text-blue-600 cursor-pointer mx-1" onClick={() => setQuery('Backend')}>Backend</span> • <span className="text-gray-700 hover:text-blue-600 cursor-pointer mx-1" onClick={() => setQuery('Design')}>Design</span>
          </div>
        </div>
      </div>

      {/* LATEST OPENINGS SECTION */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Latest Openings</h2>
            <p className="text-gray-500 mt-2">Explore the newest opportunities posted by top recruiters.</p>
          </div>
          <Link to="/student-dashboard" className="hidden sm:flex items-center text-blue-600 font-semibold hover:text-blue-800 transition-colors">
            View All Jobs <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {loading ? (
             <p className="col-span-3 text-center text-gray-500">Loading opportunities...</p>
          ) : (
            featuredJobs.map((job) => (
              <div key={job.id} className="group bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-600 transition-colors">
                      <Building className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                    </div>
                    {job.jobType && (
                      <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full font-medium">
                        {job.jobType}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">{job.title}</h3>
                  <p className="text-sm text-gray-500 mb-4">{job.companyName} • {job.location}</p>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <span className="text-gray-900 font-semibold flex items-center gap-1">
                    <IndianRupee className="w-4 h-4"/> 
                    {job.minSalary && job.maxSalary 
                      ? `${Number(job.minSalary) / 100000}L - ${Number(job.maxSalary) / 100000}L` 
                      : 'Disclosed'}
                  </span>
                  <Link to={`/jobs/${job.id}`} className="text-sm font-medium text-blue-600 hover:underline">
                    View Details
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Mobile View All Button */}
        <div className="mt-8 text-center sm:hidden">
          <Link to="/student-dashboard" className="inline-flex items-center text-blue-600 font-semibold">
            View All Jobs <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;