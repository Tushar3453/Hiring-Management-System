import { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as JobService from '../services/job.service';
import * as ApplicationService from '../services/application.service'; 
import axios from 'axios'; 
import { AuthContext } from '../context/AuthContext';
import { 
    MapPin, IndianRupee, Briefcase, Building, Clock, 
    CheckCircle2, ArrowLeft, Ban, FileText, Bookmark 
} from 'lucide-react';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  
  const [job, setJob] = useState<JobService.JobData | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  
  // --- Saved Job State ---
  const [isSaved, setIsSaved] = useState(false);

  // Specific state to track if resume exists (trusting Server over Context)
  const [hasResume, setHasResume] = useState(false);

  const isRecruiter = auth?.user?.role === 'RECRUITER';

  useEffect(() => {
    if (id) {
        fetchJobDetails();
        if (auth?.user && !isRecruiter) {
            checkApplicationStatus();
            checkSavedStatus(); // <--- Check if saved on mount
            verifyResumeStatus(); 
        }
    }
  }, [id, auth?.user]); 

  // --- Check if job is already saved ---
  const checkSavedStatus = async () => {
    try {
        const savedJobs = await JobService.getSavedJobs();
        // Check if current job ID exists in the saved jobs list
        const exists = savedJobs.some((j: any) => j.id === id);
        setIsSaved(exists);
    } catch (error) {
        console.error("Failed to check saved status");
    }
  };

  // --- Toggle Save Handler ---
  const handleToggleSave = async () => {
    if (!auth?.user) {
        alert("Please login to save jobs.");
        return;
    }
    try {
        const response = await JobService.toggleSaveJob(id!);
        setIsSaved(response.isSaved);
    } catch (error) {
        console.error("Failed to toggle save", error);
    }
  };

  // Double-check with server
  const verifyResumeStatus = async () => {
    try {
        // First, trust the context if it says yes
        if (auth?.user?.resumeUrl) {
            setHasResume(true);
            return;
        }

        // If context says no, ask the server (in case user just uploaded it)
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/user/profile', {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data && response.data.resumeUrl) {
            setHasResume(true);
            console.log("Resume found on server (Context was stale)");
        }
    } catch (error) {
        console.error("Failed to verify resume status", error);
    }
  };

  const fetchJobDetails = async () => {
    try {
      const data = await JobService.getJobById(id!);
      setJob(data);
    } catch (error) {
      console.error("Error fetching job:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkApplicationStatus = async () => {
    try {
        const myApps = await ApplicationService.getMyApplications();
        const applied = myApps.some((app: any) => app.jobId === id || app.job.id === id);
        setHasApplied(applied);
    } catch (error) {
        console.error("Failed to check application status", error);
    }
  };

  const handleApply = async () => {
    if (!auth?.user) {
      alert("Please login to apply!");
      navigate('/login');
      return;
    }

    if (isRecruiter) return;
    if (!hasResume) {
      const confirmUpload = confirm("You need a resume to apply. Go to profile to upload one?");
      if (confirmUpload) navigate('/profile');
      return;
    }

    if (!confirm(`Apply for ${job?.title} at ${job?.companyName}?`)) return;

    setApplying(true);
    try {
      await JobService.applyForJob(id!);
      alert("Application Submitted Successfully! 🚀");
      setHasApplied(true); 
      navigate('/my-applications'); 
    } catch (error: any) {
      alert(error.response?.data?.message || "Something went wrong");
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading Job Details...</div>;
  if (!job) return <div className="p-10 text-center">Job not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-blue-600 mb-6 transition">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Jobs
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="p-8 border-b border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
                <div className="flex items-center gap-2 text-lg text-blue-600 font-medium mt-2">
                  <Building className="w-5 h-5" /> {job.companyName}
                </div>
              </div>
              
              <div className="flex gap-3">
                {/* --- Bookmark Button --- */}
                {!isRecruiter && (
                    <button
                        onClick={handleToggleSave}
                        className="p-3 rounded-xl border border-gray-200 text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition"
                        title={isSaved ? "Remove from Saved" : "Save Job"}
                    >
                        <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-blue-600 text-blue-600' : ''}`} />
                    </button>
                )}

                <button 
                    onClick={handleApply}
                    disabled={applying || hasApplied || isRecruiter} 
                    className={`px-8 py-3 rounded-xl font-semibold transition shadow-md flex items-center gap-2 ${
                        isRecruiter 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200 shadow-none' 
                        : hasApplied 
                            ? 'bg-green-100 text-green-700 cursor-not-allowed border border-green-200' 
                            : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg active:scale-95 disabled:opacity-50'
                    }`}
                >
                    {isRecruiter ? (
                        <> <Ban className="w-4 h-4"/> Recruiters Cannot Apply </>
                    ) : hasApplied ? (
                        "Already Applied"
                    ) : applying ? (
                        "Applying..."
                    ) : (
                        <> <FileText className="w-4 h-4"/> Apply Now </>
                    )}
                </button>
              </div>

            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-4 mt-6 text-sm text-gray-600">
              <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                <MapPin className="w-4 h-4" /> {job.location}
              </span>
              <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                <IndianRupee className="w-4 h-4" /> {job.minSalary} - {job.maxSalary} {job.currency}
              </span>
              <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                <Clock className="w-4 h-4" /> Posted recently
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 grid grid-cols-1 gap-8">
            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-gray-400" /> Job Description
              </h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{job.description}</p>
            </section>

            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-gray-400" /> Requirements
              </h3>
              <ul className="space-y-2">
                {job.requirements && job.requirements.length > 0 ? (
                  job.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-3 text-gray-600">
                      <span className="mt-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
                      {req}
                    </li>
                  ))
                ) : (
                  <p className="text-gray-500">No specific requirements listed.</p>
                )}
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;