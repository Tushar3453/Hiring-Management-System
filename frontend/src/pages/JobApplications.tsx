import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as ApplicationService from '../services/application.service';
import * as JobService from '../services/job.service'; 
import { 
  FileText, Mail, GraduationCap, Save, ArrowLeft, Building, MapPin, X, CheckCircle2, Clock, ChevronDown, 
  BrainCircuit, IndianRupee, Globe, Link, Code2, Calendar, Video, Wand2, AlertCircle 
} from 'lucide-react';

// --- Interfaces ---
interface OfferFormData {
  salary: string;
  date: string;
  note: string;
}

interface InterviewFormData {
  date: string;
  link: string;
  note: string;
}

interface ExtendedApplicant extends ApplicationService.Applicant {
  confirmedStatus: string; 
  atsScore?: number;        
  missingSkills?: string[];
  rescheduleRequested?: boolean;
  rescheduleNote?: string;
  resumeUrl?: string; 
  student: ApplicationService.Applicant['student'] & {
      linkedin?: string;
      github?: string;
      website?: string;
      portfolioUrl?: string; 
  }; 
}

const JobApplications = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  
  const [applications, setApplications] = useState<ExtendedApplicant[]>([]);
  const [job, setJob] = useState<JobService.JobData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());

  // --- Modal State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'OFFER' | 'INTERVIEW' | null>(null);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  
  // Forms
  const [offerForm, setOfferForm] = useState<OfferFormData>({ salary: '', date: '', note: '' });
  const [interviewForm, setInterviewForm] = useState<InterviewFormData>({ date: '', link: '', note: '' });

  useEffect(() => {
    if (jobId) fetchData();
  }, [jobId]);

  const fetchData = async () => {
    try {
      if (!jobId) return;
      const [jobData, appsData] = await Promise.all([
        JobService.getJobById(jobId),
        ApplicationService.getJobApplications(jobId)
      ]);
      setJob(jobData);
      
      const mappedApps = appsData.map((app: any) => ({
          ...app,
          confirmedStatus: app.status 
      }));
      setApplications(mappedApps);

    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLocalChange = (appId: string, newStatus: string) => {
    setApplications(prev => prev.map(app => 
      app.id === appId ? { ...app, status: newStatus as any } : app
    ));
  };

  const handleSaveClick = (appId: string, currentStatus: string) => {
    if (currentStatus === 'OFFERED') {
        setSelectedAppId(appId);
        setModalType('OFFER');
        setIsModalOpen(true); 
    } else if (currentStatus === 'INTERVIEW') { 
        setSelectedAppId(appId);
        setModalType('INTERVIEW');
        setIsModalOpen(true);
    } else {
        submitStatusUpdate(appId, currentStatus);
    }
  };

  const generateLink = () => {
    const randomId = Math.random().toString(36).substring(7);
    const mockLink = `https://meet.google.com/${randomId}-${Math.random().toString(36).substring(7)}`;
    setInterviewForm(prev => ({ ...prev, link: mockLink }));
  };

  const submitStatusUpdate = async (appId: string, status: string, data?: any) => {
    setUpdatingIds(prev => new Set(prev).add(appId));
    
    let payload = {};
    if (status === 'OFFERED') {
        payload = { salary: data.salary, date: data.date, note: data.note };
    } else if (status === 'INTERVIEW') {
        payload = { interviewDate: data.date, interviewLink: data.link, note: data.note };
    }

    try {
      await ApplicationService.updateApplicationStatus(appId, status, payload);
      alert(status === 'INTERVIEW' ? "Interview Scheduled! 📅" : "Updated Successfully!");
      setIsModalOpen(false);
      fetchData(); 
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to update");
      fetchData();
    } finally {
      setUpdatingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(appId);
        return newSet;
      });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'bg-green-50 text-green-700 border-green-200';
    if (score >= 40) return 'bg-orange-50 text-orange-700 border-orange-200';
    return 'bg-red-50 text-red-700 border-red-200';
  };

  if (loading) return <div className="flex h-screen items-center justify-center text-gray-500">Loading Data...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <button 
          onClick={() => navigate('/recruiter-dashboard')} 
          className="flex items-center text-gray-500 hover:text-gray-900 mb-6 transition font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </button>

        {job && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-gray-500 text-sm">
                  <span className="flex items-center gap-1.5"><Building className="w-4 h-4" /> {job.companyName}</span>
                  <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {job.location}</span>  
                  <span className="flex items-center gap-1.5 font-medium text-gray-700">
                    <IndianRupee className="w-4 h-4" /> {job.minSalary} - {job.maxSalary} {job.currency}
                  </span>
                  <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium text-xs border border-blue-100">
                    {job.jobType || 'Full Time'}
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 px-8 py-4 rounded-2xl border border-gray-100 text-center">
                <span className="block text-3xl font-bold text-gray-900">{applications.length}</span>
                <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Applicants</span>
              </div>
            </div>
          </div>
        )}

        {/* CANDIDATE LIST */}
        <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Candidates</h2>
        </div>

        {applications.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl shadow-sm border border-gray-200">
            <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No applications yet</h3>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {applications.map((app) => (
              <div key={app.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col lg:flex-row gap-6 hover:border-blue-300 transition-all duration-200">
                
                {/* Candidate Info Section */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">{app.student.firstName} {app.student.lastName}</h3>
                        <div className="mt-2 space-y-1">
                            <p className="text-sm text-gray-500 flex items-center gap-2">
                                <Mail className="w-3.5 h-3.5"/> {app.student.email}
                            </p>
                            {app.student.institutionName && (
                                <p className="text-sm text-gray-500 flex items-center gap-2">
                                    <GraduationCap className="w-3.5 h-3.5"/> {app.student.institutionName}
                                </p>
                            )}
                        </div>
                        <div className="flex items-center gap-4 mt-3">
                            {app.student.linkedin && (
                                <a href={app.student.linkedin} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-[#0077b5] transition-colors flex items-center gap-1 text-xs font-medium">
                                    <Link className="w-4 h-4" /> LinkedIn
                                </a>
                            )}
                            {app.student.github && (
                                <a href={app.student.github} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-black transition-colors flex items-center gap-1 text-xs font-medium">
                                    <Code2 className="w-4 h-4" /> GitHub
                                </a>
                            )}
                            {(app.student.website || app.student.portfolioUrl) && (
                                <a href={app.student.website || app.student.portfolioUrl} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-green-600 transition-colors flex items-center gap-1 text-xs font-medium">
                                    <Globe className="w-4 h-4" /> Portfolio
                                </a>
                            )}
                        </div>
                    </div>
                  </div>
                  
                  {/* Skills */}
                  {app.student.skills && app.student.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                          {app.student.skills.slice(0, 4).map((skill: string, i: number) => (
                              <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-medium border border-gray-200">{skill}</span>
                          ))}
                      </div>
                  )}

                  {/* Resume & ATS */}
                  <div className="mt-5 flex flex-wrap items-center gap-4">
                    {/* --- RESUME LINK --- */}
                    {(app.resumeUrl || app.student.resumeUrl) && (
                      <a 
                        href={app.resumeUrl || app.student.resumeUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <FileText className="w-4 h-4" /> View Resume
                      </a>
                    )}

                    {app.atsScore !== undefined && (
                        <div className="relative group">
                            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${getScoreColor(app.atsScore)} cursor-help`}>
                                    <BrainCircuit className="w-4 h-4" />
                                    <span className="font-bold text-sm">{app.atsScore}% Match</span>
                            </div>
                            
                            {/* Tooltip for Missing Skills */}
                            {app.missingSkills && app.missingSkills.length > 0 && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-gray-900 text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 pointer-events-none">
                                    <p className="font-bold mb-2 text-gray-300">Missing Skills:</p>
                                    <div className="flex flex-wrap gap-1">
                                        {app.missingSkills.map((skill, idx) => (
                                            <span key={idx} className="bg-red-500/20 text-red-200 px-1.5 py-0.5 rounded border border-red-500/30">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                </div>
                            )}
                        </div>
                    )}
                  </div>
                </div>

                {/* Status & Actions Section */}
                <div className="lg:w-80 border-l border-gray-100 lg:pl-8 flex flex-col justify-center gap-3">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Current Status</label>

                    {/* --- Priority Check: RESCHEDULE REQUESTED --- */}
                    {app.rescheduleRequested ? (
                         <div className="bg-red-50 text-red-800 border border-red-200 p-4 rounded-xl flex flex-col gap-3 shadow-sm animate-in fade-in zoom-in duration-300">
                            <div className="flex items-center gap-2 font-bold text-sm text-red-700">
                                <AlertCircle className="w-4 h-4" /> Reschedule Requested
                            </div>
                            <div className="bg-white/60 p-2 rounded text-xs italic text-red-900 border border-red-100">
                                "{app.rescheduleNote}"
                            </div>
                            <button
                                onClick={() => { setSelectedAppId(app.id); setModalType('INTERVIEW'); setIsModalOpen(true); }}
                                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-bold text-xs transition shadow-sm"
                            >
                                Update Interview Date
                            </button>
                         </div>
                    ) : app.confirmedStatus === 'HIRED' ? (
                        <div className="w-full bg-green-50 text-green-700 border border-green-200 p-4 rounded-xl flex items-center justify-center gap-2 font-bold shadow-sm">
                            <CheckCircle2 className="w-5 h-5" /> Hired
                        </div>
                    ) : app.confirmedStatus === 'OFFERED' ? (
                        <div className="w-full bg-purple-50 text-purple-700 border border-purple-200 p-4 rounded-xl flex flex-col items-center justify-center gap-1 shadow-sm">
                             <div className="flex items-center gap-2 font-bold"><Clock className="w-4 h-4" /> Offer Sent</div>
                        </div>
                    ) : (
                        // Active States (APPLIED, SHORTLISTED, INTERVIEW)
                        <div className="flex flex-col gap-3 w-full">
                            
                            {/* Standard Interview Banner (Only if NO reschedule request) */}
                            {app.confirmedStatus === 'INTERVIEW' && (
                                <div className="bg-blue-50 text-blue-700 border border-blue-200 p-3 rounded-xl flex items-center justify-between text-xs font-bold shadow-sm">
                                    <span className="flex items-center gap-1.5"><Video className="w-3.5 h-3.5" /> Interview Scheduled</span>
                                    <button onClick={() => { setSelectedAppId(app.id); setModalType('INTERVIEW'); setIsModalOpen(true); }} className="underline hover:text-blue-900">
                                        Reschedule
                                    </button>
                                </div>
                            )}

                            {/* Dropdown Control */}
                            <div className="flex gap-2 w-full">
                                 <div className="relative flex-1">
                                    <select
                                        value={app.status} 
                                        onChange={(e) => handleLocalChange(app.id, e.target.value)}
                                        disabled={app.confirmedStatus === 'REJECTED'}
                                        className={`w-full appearance-none p-3 pr-8 rounded-xl border text-sm font-bold outline-none transition-all cursor-pointer ${app.status === 'REJECTED' ? 'bg-red-50 text-red-600' : 'bg-white text-gray-700'}`}
                                    >
                                        <option value="APPLIED">Applied</option>
                                        <option value="SHORTLISTED">Shortlisted</option>
                                        <option value="INTERVIEW">Interview</option>
                                        <option value="OFFERED">Send Offer</option>
                                        <option value="REJECTED">Reject</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                 </div>
                                 
                                 <button
                                    onClick={() => handleSaveClick(app.id, app.status)}
                                    disabled={updatingIds.has(app.id) || app.confirmedStatus === 'REJECTED'}
                                    className="bg-gray-900 hover:bg-black text-white p-3 rounded-xl transition-all active:scale-95 disabled:opacity-50"
                                 >
                                    {updatingIds.has(app.id) ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
                                 </button>
                            </div>
                        </div>
                    )}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- UNIFIED MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            {modalType === 'OFFER' ? 'Send Job Offer' : 'Schedule Interview'}
                        </h2>
                        <p className="text-sm text-gray-500">
                            {modalType === 'OFFER' ? 'Enter final details for the candidate' : 'Send invitation details'}
                        </p>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {modalType === 'OFFER' && (
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="block text-xs font-bold text-gray-500 uppercase">Salary (CTC)</label>
                                <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">Budget: {job?.minSalary}-{job?.maxSalary}</span>
                            </div>
                            <input 
                                className="w-full border border-gray-300 rounded-lg p-3 font-medium focus:ring-2 focus:ring-blue-500 outline-none" 
                                placeholder={`e.g. ${job?.maxSalary} LPA`}
                                value={offerForm.salary}
                                onChange={(e) => setOfferForm({...offerForm, salary: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Joining Date</label>
                            <input 
                                type="date"
                                className="w-full border border-gray-300 rounded-lg p-3 font-medium outline-none" 
                                value={offerForm.date}
                                onChange={(e) => setOfferForm({...offerForm, date: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Note</label>
                            <textarea 
                                rows={3}
                                className="w-full border border-gray-300 rounded-lg p-3 font-medium outline-none resize-none" 
                                value={offerForm.note}
                                onChange={(e) => setOfferForm({...offerForm, note: e.target.value})}
                            />
                        </div>
                        <button 
                            onClick={() => selectedAppId && submitStatusUpdate(selectedAppId, 'OFFERED', offerForm)}
                            disabled={!offerForm.salary || !offerForm.date}
                            className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl mt-6 hover:bg-blue-700 disabled:opacity-50"
                        >
                            Send Offer
                        </button>
                    </div>
                )}

                {modalType === 'INTERVIEW' && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Date & Time</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                <input 
                                    type="datetime-local"
                                    className="w-full border border-gray-300 rounded-lg pl-10 p-3 font-medium focus:ring-2 focus:ring-blue-500 outline-none" 
                                    value={interviewForm.date}
                                    onChange={(e) => setInterviewForm({...interviewForm, date: e.target.value})}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Meeting Link</label>
                            <div className="relative flex gap-2">
                                <div className="relative flex-1">
                                    <Video className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                    <input 
                                        className="w-full border border-gray-300 rounded-lg pl-10 p-3 font-medium focus:ring-2 focus:ring-blue-500 outline-none" 
                                        placeholder="Paste link or generate"
                                        value={interviewForm.link}
                                        onChange={(e) => setInterviewForm({...interviewForm, link: e.target.value})}
                                    />
                                </div>
                                <button 
                                    onClick={generateLink}
                                    className="bg-purple-100 text-purple-700 p-3 rounded-lg hover:bg-purple-200 transition-colors"
                                    title="Auto-Generate Link"
                                >
                                    <Wand2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Instructions</label>
                            <textarea 
                                rows={3}
                                className="w-full border border-gray-300 rounded-lg p-3 font-medium focus:ring-2 focus:ring-blue-500 outline-none resize-none" 
                                placeholder="e.g. Please bring your portfolio..."
                                value={interviewForm.note}
                                onChange={(e) => setInterviewForm({...interviewForm, note: e.target.value})}
                            />
                        </div>

                        <button 
                            onClick={() => selectedAppId && submitStatusUpdate(selectedAppId, 'INTERVIEW', interviewForm)}
                            disabled={!interviewForm.date || !interviewForm.link}
                            className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl mt-6 hover:bg-blue-700 disabled:opacity-50"
                        >
                            Schedule Interview
                        </button>
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

export default JobApplications;