import { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as JobService from '../services/job.service';
import { Search, MapPin, ArrowRight, Building, IndianRupee, Sparkles, Briefcase, CheckCircle, MousePointerClick, Eye, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
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

const FadeUp = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay, ease: [0.23, 1, 0.32, 1] }}
  >
    {children}
  </motion.div>
);

const Home = () => {
  const navigate = useNavigate();
  const auth = useContext(AuthContext);

  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');

  const handleSearch = () => {
    navigate(`/student-dashboard?query=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`);
  };

  const handlePostJobClick = () => {
    if (!auth?.user) {
      toast.error("Please sign up as a Recruiter to post jobs.", { icon: '🏢' });
      navigate('/signup');
      return;
    }
    if (auth.user.role === 'STUDENT') {
      toast.error("Students cannot post jobs. Please create a Recruiter account.");
      navigate('/signup');
      return;
    }
    if (auth.user.role === 'RECRUITER') {
      navigate('/recruiter-dashboard');
    }
  };

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await JobService.getAllJobs();
        setFeaturedJobs(data.slice(0, 3)); // Slice to 3 to match dashboard grid structure
      } catch (error) {
        console.log("Using dummy data for home page preview");
        setFeaturedJobs([
          {
            id: '1',
            title: 'Frontend Developer',
            companyName: 'TechCorp',
            location: 'Bangalore',
            minSalary: 800000,
            maxSalary: 1500000,
            description: 'We are looking for an experienced Frontend Developer to join our team and build scalable UI components.',
            jobType: 'Full-time',
            createdAt: new Date().toISOString()
          },
          {
            id: '2',
            title: 'Product Designer',
            companyName: 'CreativeStudio',
            location: 'Remote',
            minSalary: 600000,
            maxSalary: 1200000,
            description: 'Join our design team to create intuitive and engaging user experiences for our flagship products.',
            jobType: 'Remote',
            createdAt: new Date(Date.now() - 86400000).toISOString()
          },
          {
            id: '3',
            title: 'Backend Engineer',
            companyName: 'DataSystems',
            location: 'Delhi NCR',
            minSalary: 1000000,
            maxSalary: 2000000,
            description: 'Seeking a strong Node.js backend developer to optimize our database queries and API endpoints.',
            jobType: 'Full-time',
            createdAt: new Date(Date.now() - 172800000).toISOString()
          },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const formatSalary = (min: number, max: number) => {
    if (!min || !max) return 'Best in Industry';
    return `₹${(min / 100000).toFixed(1)}L - ₹${(max / 100000).toFixed(1)}L`;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gray-50/50 text-gray-900 font-sans overflow-x-hidden">

      {/* ================= HERO SECTION ================= */}
      <div className="relative pt-16 pb-24 px-4 sm:px-6 lg:px-8 border-b border-gray-200 bg-white overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-50 rounded-full blur-[100px] pointer-events-none opacity-80" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f3f4f6_1px,transparent_1px),linear-gradient(to_bottom,#f3f4f6_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-80" />

        <div className="max-w-4xl mx-auto text-center relative z-10">

          <FadeUp>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-xs font-semibold text-blue-700 mb-8 shadow-sm">
              <Sparkles className="w-3 h-3 text-blue-600" />
              <span>HireHub is now in beta</span>
            </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-6 leading-[1.1]">
              Find the work that <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">works for you.</span>
            </h1>
          </FadeUp>

          <FadeUp delay={0.2}>
            <p className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
              Connect with top-tier companies. Build your profile, discover roles that match your ambition, and apply seamlessly.
            </p>
          </FadeUp>

          {/* Call To Actions */}
          <FadeUp delay={0.3}>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-16">
              <Link to="/student-dashboard" className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95 text-center">
                Explore Jobs
              </Link>
              <button
                onClick={handlePostJobClick}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white text-gray-700 font-semibold border border-gray-200 hover:bg-gray-50 hover:border-blue-200 hover:text-blue-700 transition-all shadow-sm active:scale-95"
              >
                Post a Job
              </button>
            </div>
          </FadeUp>

          {/* FLAT SEARCH BAR */}
          <FadeUp delay={0.4}>
            <div className="bg-white p-2 rounded-2xl shadow-xl shadow-blue-900/5 border border-gray-100 flex flex-col sm:flex-row gap-2 max-w-3xl mx-auto ring-1 ring-gray-100/50">
              <div className="flex-1 flex items-center px-4 h-14 bg-gray-50 rounded-xl border border-transparent focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-300 transition-all text-left">
                <Search className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Job title, keywords..."
                  className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400 font-medium"
                  value={query} onChange={(e) => setQuery(e.target.value)}
                />
              </div>

              <div className="flex-1 flex items-center px-4 h-14 bg-gray-50 rounded-xl border border-transparent focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-300 transition-all text-left">
                <MapPin className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Location"
                  className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400 font-medium"
                  value={location} onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <button
                onClick={handleSearch}
                className="h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md shadow-blue-600/20 flex items-center justify-center whitespace-nowrap"
              >
                Search
              </button>
            </div>
          </FadeUp>
        </div>
      </div>

      {/* ================= CONSUMER-FACING BENTO GRID ================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">Built for your career growth</h2>
          <p className="text-gray-500 font-medium max-w-2xl mx-auto">Everything you need to stand out and land your next big opportunity.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          <div className="md:col-span-2 bg-white rounded-3xl p-8 lg:p-10 border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6 border border-blue-100 group-hover:bg-blue-600 transition-colors duration-300">
              <CheckCircle className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors duration-300" />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-gray-900 tracking-tight">Verified Top-Tier Companies</h3>
            <p className="text-gray-500 max-w-md leading-relaxed text-sm font-medium">
              Skip the noise and spam. We carefully vet every recruiter on our platform so you can connect directly with decision-makers at companies that care about your growth.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-6 border border-indigo-100 group-hover:bg-indigo-600 transition-colors duration-300">
              <MousePointerClick className="w-6 h-6 text-indigo-600 group-hover:text-white transition-colors duration-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Seamless Applications</h3>
            <p className="text-gray-500 text-sm font-medium">Your profile is your resume. Apply to multiple roles instantly without filling out repetitive forms.</p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group">
            <div className="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center mb-6 border border-sky-100 group-hover:bg-sky-600 transition-colors duration-300">
              <Eye className="w-6 h-6 text-sky-600 group-hover:text-white transition-colors duration-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Real-Time Tracking</h3>
            <p className="text-gray-500 text-sm font-medium">Know exactly where you stand. Get instant updates when your application is viewed or shortlisted.</p>
          </div>

          <div className="md:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 lg:p-10 border border-blue-500 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all relative overflow-hidden text-white">
            <div className="relative z-10 flex flex-col justify-center h-full">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6 border border-white/20 backdrop-blur-sm">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2 tracking-tight">Campus to Corporate</h3>
              <p className="text-blue-100 max-w-md leading-relaxed text-sm font-medium">
                Bridging the gap between education and employment. An end-to-end platform taking you straight from your dorm room to your dream desk.
              </p>
            </div>
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-1/4 translate-y-1/4">
              <Building className="w-64 h-64 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* ================= LATEST OPENINGS ================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 mb-20">

        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4 border-t border-gray-200 pt-16">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Latest Openings</h2>
            <p className="text-gray-500 mt-2 text-sm font-medium">Hand-picked opportunities from top tech teams.</p>
          </div>
          <Link to="/student-dashboard" className="group flex items-center text-sm text-blue-600 font-bold hover:text-blue-800 transition-colors">
            View All Roles <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            [1, 2, 3].map(i => (
              <JobCardSkeleton key={i} />
            ))
          ) : (
            featuredJobs.map((job, index) => (
              <FadeUp key={job.id} delay={index * 0.1}>
                <div
                  onClick={() => navigate(`/jobs/${job.id}`)}
                  className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-blue-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full cursor-pointer"
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
                      className="text-sm font-semibold text-blue-600 group-hover:text-white group-hover:bg-blue-600 px-5 py-2 rounded-lg transition-all border border-blue-100 group-hover:border-transparent group-hover:shadow-md"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </FadeUp>
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default Home;