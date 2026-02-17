import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as ApplicationService from '../services/application.service';
import * as JobService from '../services/job.service'; 
import { 
  FileText, Mail, GraduationCap, Save, ArrowLeft, Building, MapPin, X, CheckCircle2, ChevronDown, 
  BrainCircuit, IndianRupee, Globe, Link as LinkIcon, Code2, Calendar, Video, Wand2, AlertCircle, Sparkles 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

// Labels for the custom dropdown
const STATUS_LABELS: Record<string, string> = {
  APPLIED: 'Applied',
  SHORTLISTED: 'Shortlist',
  INTERVIEW: 'Interview',
  OFFERED: 'Send Offer',
  REJECTED: 'Reject'
};

const JobApplications = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  
  const [applications, setApplications] = useState<ExtendedApplicant[]>([]);
  const [job, setJob] = useState<JobService.JobData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());

  // --- Custom Dropdown State ---
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // --- Modal State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'OFFER' | 'INTERVIEW' | null>(null);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  
  // Forms
  const [offerForm, setOfferForm] = useState<OfferFormData>({ salary: '', date: '', note: '' });
  const [interviewForm, setInterviewForm] = useState<InterviewFormData>({ date: '', link: '', note: '' });

  useEffect(() => {
    window.scrollTo(0, 0);
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
    setOpenDropdownId(null); 
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

  if (loading) return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto animate-pulse">
        <div className="h-6 w-32 bg-gray-200 rounded-md mb-8"></div>
        <div className="bg-white p-8 rounded-2xl border border-gray-100 h-36 mb-8"></div>
        <div className="space-y-4">
           {[1,2,3].map(i => <div key={i} className="h-32 bg-white border border-gray-100 rounded-2xl"></div>)}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-20 selection:bg-blue-100 selection:text-blue-900 relative">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-b from-blue-50/60 to-transparent pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 relative z-10">
        
        {/* HEADER BACK BUTTON */}
        <button 
          onClick={() => navigate('/recruiter-dashboard')} 
          className="group flex items-center text-sm font-bold text-gray-500 hover:text-gray-900 mb-8 transition-colors bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm hover:shadow w-fit"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> 
          Back to Dashboard
        </button>

        {/* ================= JOB OVERVIEW HEADER ================= */}
        {job && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-10 relative">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600" />
            <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
              
              <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                  <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-2xl font-black text-gray-400 shrink-0">
                    {job.companyName.charAt(0)}
                  </div>
                  <div>
                    <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 tracking-tight mb-2">{job.title}</h1>
                    <div className="flex flex-wrap items-center gap-4 text-gray-500 text-sm font-bold">
                      <span className="flex items-center gap-1.5"><Building className="w-4 h-4 text-gray-400" /> {job.companyName}</span>
                      <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-gray-400" /> {job.location}</span>  
                      <span className="flex items-center gap-1.5 text-gray-700">
                        <IndianRupee className="w-4 h-4 text-gray-400" /> {job.minSalary} - {job.maxSalary} {job.currency}
                      </span>
                    </div>
                  </div>
              </div>

              <div className="bg-blue-50/50 px-6 py-4 rounded-xl border border-blue-100 text-center shrink-0 flex items-center gap-4">
                <div className="p-2.5 bg-white rounded-xl shadow-sm text-blue-600">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="text-left">
                    <span className="block text-2xl font-black text-gray-900 leading-none mb-1">{applications.length}</span>
                    <span className="text-[11px] text-gray-500 uppercase font-bold tracking-wider">Total Applications</span>
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* ================= CANDIDATE LIST ================= */}
        <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">Candidates</h2>
        </div>

        {applications.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 border border-gray-100">
               <Mail className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No applications yet</h3>
            <p className="text-gray-500 font-medium text-sm max-w-sm mx-auto">Candidates who apply for this role will appear here automatically.</p>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-4">
            {applications.map((app, index) => (
              <motion.div 
                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                key={app.id} 
                className={`bg-white rounded-2xl shadow-sm border p-5 md:p-6 flex flex-col lg:flex-row gap-6 transition-all hover:shadow-md ${
                    app.rescheduleRequested 
                    ? 'border-red-200 bg-red-50/30' 
                    : 'border-gray-100 hover:border-blue-300'
                }`}
              >
                
                {/* --- LEFT: Candidate Info Section --- */}
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-lg font-bold text-gray-500 shrink-0 border border-gray-200">
                           {app.student.firstName?.[0]}{app.student.lastName?.[0]}
                        </div>
                        
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 tracking-tight mb-1">{app.student.firstName} {app.student.lastName}</h3>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                <p className="text-sm font-medium text-gray-500 flex items-center gap-1.5">
                                    <Mail className="w-4 h-4 text-gray-400"/> {app.student.email}
                                </p>
                                {app.student.institutionName && (
                                    <p className="text-sm font-medium text-gray-500 flex items-center gap-1.5">
                                        <GraduationCap className="w-4 h-4 text-gray-400"/> {app.student.institutionName}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="flex flex-wrap items-center gap-3 mt-4 pl-0 sm:pl-16">
                      {app.student.linkedin && (
                          <a href={app.student.linkedin} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-[#0077b5] transition-colors flex items-center gap-1 text-xs font-bold uppercase tracking-wider bg-gray-50 px-2.5 py-1.5 rounded-md border border-gray-100">
                              <LinkIcon className="w-3.5 h-3.5" /> LinkedIn
                          </a>
                      )}
                      {app.student.github && (
                          <a href={app.student.github} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-black transition-colors flex items-center gap-1 text-xs font-bold uppercase tracking-wider bg-gray-50 px-2.5 py-1.5 rounded-md border border-gray-100">
                              <Code2 className="w-3.5 h-3.5" /> GitHub
                          </a>
                      )}
                      {(app.student.website || app.student.portfolioUrl) && (
                          <a href={app.student.website || app.student.portfolioUrl} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-green-600 transition-colors flex items-center gap-1 text-xs font-bold uppercase tracking-wider bg-gray-50 px-2.5 py-1.5 rounded-md border border-gray-100">
                              <Globe className="w-3.5 h-3.5" /> Portfolio
                          </a>
                      )}
                  </div>
                  
                  {/* Skills */}
                  {app.student.skills && app.student.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3 pl-0 sm:pl-16">
                          {app.student.skills.slice(0, 5).map((skill: string, i: number) => (
                              <span key={i} className="text-[11px] bg-white border border-gray-200 text-gray-600 px-2 py-1 rounded font-bold shadow-sm">{skill}</span>
                          ))}
                      </div>
                  )}

                  {/* Resume & ATS Block */}
                  <div className="mt-5 flex flex-wrap items-center gap-3 pl-0 sm:pl-16">
                    {(app.resumeUrl || app.student.resumeUrl) && (
                      <a 
                        href={app.resumeUrl || app.student.resumeUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors border border-blue-100"
                      >
                        <FileText className="w-3.5 h-3.5" /> View Resume
                      </a>
                    )}

                    {app.atsScore !== undefined && (
                        <div className="relative group">
                            <div className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border font-bold text-xs shadow-sm cursor-help ${getScoreColor(app.atsScore)}`}>
                                    <BrainCircuit className="w-3.5 h-3.5" />
                                    <span>{app.atsScore}% Match</span>
                            </div>
                            
                            {app.missingSkills && app.missingSkills.length > 0 && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 p-3 bg-gray-900 text-white rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 pointer-events-none">
                                    <p className="font-bold mb-2 text-gray-300 text-[10px] uppercase tracking-wider flex items-center gap-1.5"><AlertCircle className="w-3 h-3"/> Missing Skills</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {app.missingSkills.map((skill, idx) => (
                                            <span key={idx} className="bg-red-500/20 text-red-200 px-1.5 py-0.5 text-[10px] rounded border border-red-500/30 font-bold">
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

                {/* --- RIGHT: Status & Actions Section --- */}
                <div className="lg:w-[260px] border-t lg:border-t-0 lg:border-l border-gray-100 pt-5 lg:pt-0 lg:pl-6 flex flex-col justify-center gap-3">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Update Status</label>

                    {/* --- Priority Check: RESCHEDULE REQUESTED --- */}
                    {app.rescheduleRequested ? (
                         <div className="bg-red-50 text-red-800 border border-red-200 p-3 rounded-xl flex flex-col gap-2 shadow-sm animate-in fade-in zoom-in duration-300">
                            <div className="flex items-center gap-1.5 font-bold text-xs text-red-700">
                                <AlertCircle className="w-3.5 h-3.5" /> Reschedule Requested
                            </div>
                            <div className="bg-white/60 p-2 rounded-lg text-xs italic font-medium text-red-900 border border-red-100">
                                "{app.rescheduleNote}"
                            </div>
                            <button
                                onClick={() => { setSelectedAppId(app.id); setModalType('INTERVIEW'); setIsModalOpen(true); }}
                                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 mt-1 rounded-lg font-bold text-xs transition-colors shadow-sm"
                            >
                                Update Interview Date
                            </button>
                         </div>
                    ) : app.confirmedStatus === 'HIRED' ? (
                        <div className="w-full bg-green-50 text-green-700 border border-green-200 p-3 rounded-xl flex items-center justify-center gap-2 font-bold shadow-sm text-sm">
                            <CheckCircle2 className="w-4 h-4" /> Hired
                        </div>
                    ) : app.confirmedStatus === 'OFFERED' ? (
                        <div className="w-full bg-indigo-50 text-indigo-700 border border-indigo-200 p-3 rounded-xl flex flex-col items-center justify-center gap-1 shadow-sm">
                             <div className="flex items-center gap-1.5 font-bold text-sm"><Sparkles className="w-4 h-4" /> Offer Sent</div>
                             <p className="text-[10px] font-bold text-indigo-600/80 uppercase tracking-wider">Awaiting candidate response</p>
                        </div>
                    ) : (
                        // Active States (APPLIED, SHORTLISTED, INTERVIEW)
                        <div className="flex flex-col gap-3 w-full">
                            
                            {/* Standard Interview Banner */}
                            {app.confirmedStatus === 'INTERVIEW' && (
                                <div className="bg-blue-50 text-blue-700 border border-blue-200 p-2.5 rounded-lg flex items-center justify-between text-xs font-bold shadow-sm">
                                    <span className="flex items-center gap-1.5"><Video className="w-3.5 h-3.5" /> Scheduled</span>
                                    <button onClick={() => { setSelectedAppId(app.id); setModalType('INTERVIEW'); setIsModalOpen(true); }} className="underline hover:text-blue-900 transition-colors">
                                        Reschedule
                                    </button>
                                </div>
                            )}

                            {/* --- CUSTOM DROPDOWN --- */}
                            <div className="flex gap-2 w-full mt-1 relative">
                                 
                                 {/* Invisible overlay to close dropdown when clicking outside */}
                                 {openDropdownId === app.id && (
                                     <div className="fixed inset-0 z-10" onClick={() => setOpenDropdownId(null)}></div>
                                 )}

                                 <div className="relative flex-1 z-20">
                                    <button
                                        onClick={() => setOpenDropdownId(openDropdownId === app.id ? null : app.id)}
                                        disabled={app.confirmedStatus === 'REJECTED'}
                                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg border text-sm font-bold transition-all focus:outline-none shadow-sm ${
                                            app.status === 'REJECTED' 
                                            ? 'bg-red-50 border-red-200 text-red-600' 
                                            : 'bg-white border-gray-200 text-gray-900 hover:border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-50'
                                        }`}
                                    >
                                        {STATUS_LABELS[app.status] || app.status}
                                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${openDropdownId === app.id ? 'rotate-180 text-blue-600' : 'text-gray-500'}`} />
                                    </button>

                                    {/* Dropdown Menu */}
                                    <AnimatePresence>
                                        {openDropdownId === app.id && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.15 }}
                                                className="absolute top-full left-0 mt-1.5 w-full bg-white border border-gray-100 rounded-lg shadow-lg overflow-hidden py-1 z-30"
                                            >
                                                {Object.entries(STATUS_LABELS).map(([val, label]) => (
                                                    <button
                                                        key={val}
                                                        onClick={() => handleLocalChange(app.id, val)}
                                                        className={`w-full text-left px-4 py-2.5 text-sm font-bold transition-colors ${
                                                            app.status === val 
                                                            ? 'bg-blue-50/80 text-blue-700' 
                                                            : 'text-gray-700 hover:bg-gray-50'
                                                        } ${val === 'REJECTED' ? 'hover:bg-red-50 hover:text-red-600' : ''}`}
                                                    >
                                                        {label}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                 </div>
                                 
                                 <button
                                    onClick={() => handleSaveClick(app.id, app.status)}
                                    disabled={updatingIds.has(app.id) || app.confirmedStatus === 'REJECTED'}
                                    className="bg-gray-900 hover:bg-black text-white px-3.5 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center shadow-sm z-20 active:scale-95"
                                    title="Save Status"
                                 >
                                    {updatingIds.has(app.id) ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                                 </button>
                            </div>
                        </div>
                    )}
                </div>

              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ================= UNIFIED MODAL ================= */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
              <motion.div 
                initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-100"
              >
                  <div className={`p-6 relative ${modalType === 'OFFER' ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-gradient-to-r from-purple-600 to-indigo-600'}`}>
                      <button 
                          onClick={() => setIsModalOpen(false)} 
                          className="absolute right-4 top-4 p-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white"
                      >
                          <X className="w-4 h-4" />
                      </button>
                      <div className="bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center mb-3 text-white">
                        {modalType === 'OFFER' ? <Sparkles className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
                      </div>
                      <h2 className="text-xl font-extrabold text-white mb-1 tracking-tight">
                          {modalType === 'OFFER' ? 'Send Job Offer' : 'Schedule Interview'}
                      </h2>
                      <p className="text-white/80 font-bold text-xs">
                          {modalType === 'OFFER' ? 'Enter final details for the candidate' : 'Send invitation details'}
                      </p>
                  </div>

                  <div className="p-6 space-y-4">
                      
                      {/* --- OFFER FORM --- */}
                      {modalType === 'OFFER' && (
                          <>
                              <div>
                                  <div className="flex justify-between items-center mb-1.5">
                                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Salary Package</label>
                                      <span className="text-[10px] text-blue-700 font-bold bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">Budget: {job?.minSalary}-{job?.maxSalary}</span>
                                  </div>
                                  <input 
                                      className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-2.5 text-sm font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-50 focus:border-blue-300 outline-none transition-all" 
                                      placeholder={`e.g. ${job?.maxSalary}`}
                                      value={offerForm.salary}
                                      onChange={(e) => setOfferForm({...offerForm, salary: e.target.value})}
                                  />
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Joining Date</label>
                                  <input 
                                      type="date"
                                      className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-2.5 text-sm font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-50 focus:border-blue-300 outline-none transition-all" 
                                      value={offerForm.date}
                                      onChange={(e) => setOfferForm({...offerForm, date: e.target.value})}
                                  />
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Personal Note (Optional)</label>
                                  <textarea 
                                      rows={3}
                                      placeholder="Congratulate the candidate..."
                                      className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-2.5 text-sm font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-50 focus:border-blue-300 outline-none resize-none transition-all" 
                                      value={offerForm.note}
                                      onChange={(e) => setOfferForm({...offerForm, note: e.target.value})}
                                  />
                              </div>
                              <button 
                                  onClick={() => selectedAppId && submitStatusUpdate(selectedAppId, 'OFFERED', offerForm)}
                                  disabled={!offerForm.salary || !offerForm.date}
                                  className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg mt-2 hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm active:scale-95"
                              >
                                  Send Offer
                              </button>
                          </>
                      )}

                      {/* --- INTERVIEW FORM --- */}
                      {modalType === 'INTERVIEW' && (
                          <>
                              <div>
                                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Date & Time</label>
                                  <div className="relative">
                                      <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                      <input 
                                          type="datetime-local"
                                          className="w-full border border-gray-200 bg-gray-50 rounded-lg pl-10 px-4 py-2.5 text-sm font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-purple-50 focus:border-purple-300 outline-none transition-all" 
                                          value={interviewForm.date}
                                          onChange={(e) => setInterviewForm({...interviewForm, date: e.target.value})}
                                      />
                                  </div>
                              </div>

                              <div>
                                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Meeting Link</label>
                                  <div className="relative flex gap-2">
                                      <div className="relative flex-1">
                                          <Video className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                          <input 
                                              className="w-full border border-gray-200 bg-gray-50 rounded-lg pl-10 px-4 py-2.5 text-sm font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-purple-50 focus:border-purple-300 outline-none transition-all" 
                                              placeholder="Paste link or generate"
                                              value={interviewForm.link}
                                              onChange={(e) => setInterviewForm({...interviewForm, link: e.target.value})}
                                          />
                                      </div>
                                      <button 
                                          onClick={generateLink}
                                          className="bg-purple-100 text-purple-700 px-4 rounded-lg hover:bg-purple-200 transition-colors font-bold shadow-sm"
                                          title="Auto-Generate Link"
                                      >
                                          <Wand2 className="w-5 h-5" />
                                      </button>
                                  </div>
                              </div>

                              <div>
                                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Instructions</label>
                                  <textarea 
                                      rows={2}
                                      className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-2.5 text-sm font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-purple-50 focus:border-purple-300 outline-none resize-none transition-all" 
                                      placeholder="e.g. Bring your portfolio..."
                                      value={interviewForm.note}
                                      onChange={(e) => setInterviewForm({...interviewForm, note: e.target.value})}
                                  />
                              </div>

                              <button 
                                  onClick={() => selectedAppId && submitStatusUpdate(selectedAppId, 'INTERVIEW', interviewForm)}
                                  disabled={!interviewForm.date || !interviewForm.link}
                                  className="w-full bg-gray-900 text-white font-bold py-3 rounded-lg mt-2 hover:bg-black disabled:opacity-50 transition-colors shadow-sm active:scale-95"
                              >
                                  Schedule Interview
                              </button>
                          </>
                      )}
                  </div>
              </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default JobApplications;