import { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as JobService from '../services/job.service';
import * as ApplicationService from '../services/application.service'; 
import axios from 'axios'; 
import { AuthContext } from '../context/AuthContext';
import { 
    MapPin, IndianRupee, Briefcase, Building, Clock, 
    CheckCircle2, ArrowLeft, Ban, FileText, Bookmark, 
    Upload, X 
} from 'lucide-react';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  
  const [job, setJob] = useState<JobService.JobData | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [hasResume, setHasResume] = useState(false);

  // --- STATE FOR MODAL & RESUME SELECTION ---
  const [showModal, setShowModal] = useState(false);
  const [resumeType, setResumeType] = useState<'profile' | 'upload'>('profile');
  const [customFile, setCustomFile] = useState<File | null>(null);

  const isRecruiter = auth?.user?.role === 'RECRUITER';

  useEffect(() => {
    if (id) {
        fetchJobDetails();
        if (auth?.user && !isRecruiter) {
            checkApplicationStatus();
            checkSavedStatus();
            verifyResumeStatus(); 
        }
    }
  }, [id, auth?.user]); 

  // --- Check if job is already saved ---
  const checkSavedStatus = async () => {
    try {
        const savedJobs = await JobService.getSavedJobs();
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
        if (auth?.user?.resumeUrl) {
            setHasResume(true);
            return;
        }
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/user/profile', {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data && response.data.resumeUrl) {
            setHasResume(true);
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

  // --- INITIAL CLICK (Opens Modal) ---
  const handleApplyClick = () => {
    if (!auth?.user) {
      alert("Please login to apply!");
      navigate('/login');
      return;
    }

    if (isRecruiter) return;
    setShowModal(true);
  };

  // --- FILE CHANGE HANDLER ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setCustomFile(e.target.files[0]);
      }
  };

  // --- FINAL SUBMIT (Inside Modal) ---
  const submitApplication = async () => {
    // Validation
    if (resumeType === 'profile' && !hasResume) {
        const confirmUpload = confirm("No profile resume found. Go to profile to upload one?");
        if (confirmUpload) navigate('/profile');
        return;
    }

    if (resumeType === 'upload' && !customFile) {
        alert("Please select a file to upload.");
        return;
    }

    setApplying(true);
    try {
      // Use ApplicationService instead of JobService to support File Upload
      const fileToUpload = resumeType === 'upload' ? customFile! : undefined;
      
      await ApplicationService.applyJob(id!, fileToUpload);
      
      alert("Application Submitted Successfully! 🚀");
      setHasApplied(true); 
      setShowModal(false);
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
                    onClick={handleApplyClick} 
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

      {/* --- APPLY MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Submit Application</h2>
                    <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-gray-500"/></button>
                </div>

                <div className="space-y-4 mb-6">
                    <p className="text-sm text-gray-600 font-medium">Select a resume to submit:</p>
                    
                    {/* Option 1: Profile Resume */}
                    <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${resumeType === 'profile' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-200'}`}>
                        <input 
                            type="radio" 
                            name="resumeOption" 
                            className="w-5 h-5 text-blue-600"
                            checked={resumeType === 'profile'}
                            onChange={() => setResumeType('profile')}
                        />
                        <div>
                            <p className="font-bold text-gray-900 flex items-center gap-2">
                                <FileText className="w-4 h-4"/> Use Profile Resume
                            </p>
                            {/* Show warning if no profile resume exists */}
                            {!hasResume ? (
                                <p className="text-xs text-red-500 mt-1 font-bold">No resume found on profile.</p>
                            ) : (
                                <p className="text-xs text-gray-500 mt-1">Uses the default resume from your profile.</p>
                            )}
                        </div>
                    </label>

                    {/* Option 2: Upload New */}
                    <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${resumeType === 'upload' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-200'}`}>
                        <input 
                            type="radio" 
                            name="resumeOption" 
                            className="w-5 h-5 text-blue-600"
                            checked={resumeType === 'upload'}
                            onChange={() => setResumeType('upload')}
                        />
                        <div className="flex-1">
                            <p className="font-bold text-gray-900 flex items-center gap-2">
                                <Upload className="w-4 h-4"/> Upload Custom Resume
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Upload a specific resume for this job.</p>
                            
                            {/* File Input (Only visible if selected) */}
                            {resumeType === 'upload' && (
                                <input 
                                    type="file" 
                                    accept=".pdf"
                                    onChange={handleFileChange}
                                    className="mt-3 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
                                />
                            )}
                        </div>
                    </label>
                </div>

                <button 
                    onClick={submitApplication}
                    disabled={applying || (resumeType === 'upload' && !customFile) || (resumeType === 'profile' && !hasResume)}
                    className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition shadow-lg shadow-blue-100"
                >
                    {applying ? "Submitting..." : "Confirm & Apply"}
                </button>
            </div>
        </div>
      )}

    </div>
  );
};

export default JobDetails;