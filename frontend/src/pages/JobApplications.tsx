import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as ApplicationService from '../services/application.service';
import * as JobService from '../services/job.service'; 
import { 
  FileText, Mail, GraduationCap, Save, ArrowLeft, Building, MapPin, X, CheckCircle2, Clock, ChevronDown
} from 'lucide-react';

interface OfferFormData {
    salary: string;
    date: string;
    note: string;
}

interface ExtendedApplicant extends ApplicationService.Applicant {
    confirmedStatus: string; 
}

const JobApplications = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  
  const [applications, setApplications] = useState<ExtendedApplicant[]>([]);
  const [job, setJob] = useState<JobService.JobData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [offerForm, setOfferForm] = useState<OfferFormData>({ salary: '', date: '', note: '' });

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
        setIsModalOpen(true); 
    } else {
        submitStatusUpdate(appId, currentStatus);
    }
  };

  const submitStatusUpdate = async (appId: string, status: string, offerDetails?: OfferFormData) => {
    setUpdatingIds(prev => new Set(prev).add(appId));
    try {
      await ApplicationService.updateApplicationStatus(appId, status, offerDetails);
      alert("Updated Successfully!");
      setIsModalOpen(false);
      fetchData(); // Refresh data to update badges from DB
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

  if (loading) return <div className="flex h-screen items-center justify-center text-gray-500">Loading Data...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* === HEADER === */}
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

        {/* === CANDIDATE LIST === */}
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
                
                {/* Candidate Details */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">{app.student.firstName} {app.student.lastName}</h3>
                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-2"><Mail className="w-3.5 h-3.5"/> {app.student.email}</p>
                        {app.student.institutionName && (
                            <p className="text-sm text-gray-500 mt-1 flex items-center gap-2"><GraduationCap className="w-3.5 h-3.5"/> {app.student.institutionName}</p>
                        )}
                    </div>
                  </div>
                  
                  {/* Skills Tag */}
                  {app.student.skills && app.student.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                          {app.student.skills.slice(0, 4).map((skill: string, i: number) => (
                              <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-medium border border-gray-200">{skill}</span>
                          ))}
                      </div>
                  )}

                  {/* Resume Action */}
                  {app.student.resumeUrl && (
                    <div className="mt-5">
                      <a href={app.student.resumeUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors">
                        <FileText className="w-4 h-4" /> View Resume
                      </a>
                    </div>
                  )}
                </div>

                {/* Action Section */}
                <div className="lg:w-80 border-l border-gray-100 lg:pl-8 flex flex-col justify-center">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Current Status</label>

                    {app.confirmedStatus === 'HIRED' ? (
                        <div className="w-full bg-green-50 text-green-700 border border-green-200 p-4 rounded-xl flex items-center justify-center gap-2 font-bold shadow-sm">
                            <CheckCircle2 className="w-5 h-5" /> Hired
                        </div>
                    ) : app.confirmedStatus === 'OFFERED' ? (
                        <div className="w-full bg-purple-50 text-purple-700 border border-purple-200 p-4 rounded-xl flex flex-col items-center justify-center gap-1 shadow-sm animate-pulse">
                             <div className="flex items-center gap-2 font-bold">
                                <Clock className="w-4 h-4" /> Offer Sent
                             </div>
                             <span className="text-[10px] text-purple-600/80 font-medium">Waiting for response</span>
                        </div>
                    ) : (
                        <div className="flex gap-2 w-full">
                             <div className="relative flex-1">
                                <select
                                    value={app.status} 
                                    onChange={(e) => handleLocalChange(app.id, e.target.value)}
                                    disabled={app.confirmedStatus === 'REJECTED'}
                                    className={`w-full appearance-none p-3 pr-8 rounded-xl border text-sm font-bold outline-none transition-all cursor-pointer
                                    ${app.status === 'REJECTED' ? 'bg-red-50 border-red-200 text-red-600' : 
                                      'bg-white border-gray-200 text-gray-700 hover:border-blue-400 focus:ring-2 focus:ring-blue-100'}`}
                                >
                                    <option value="APPLIED">Applied</option>
                                    <option value="SHORTLISTED">Shortlisted</option>
                                    <option value="INTERVIEW">Interview</option>
                                    <option value="OFFERED">Send Offer</option>
                                    <option value="REJECTED">Reject</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                             </div>
                             
                             {/* Save Button */}
                             <button
                                onClick={() => handleSaveClick(app.id, app.status)}
                                disabled={updatingIds.has(app.id) || app.confirmedStatus === 'REJECTED'}
                                className="bg-gray-900 hover:bg-black text-white p-3 rounded-xl transition-all active:scale-95 disabled:opacity-50 shadow-sm"
                                title="Save Status"
                             >
                                {updatingIds.has(app.id) ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Save className="w-5 h-5" />
                                )}
                             </button>
                        </div>
                    )}
                    
                    {/* Helper Text */}
                    {app.confirmedStatus === 'REJECTED' && (
                        <p className="text-center text-[10px] text-red-400 mt-2 font-medium">Application Rejected</p>
                    )}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- OFFER MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Send Job Offer</h2>
                        <p className="text-sm text-gray-500">Enter final details for the candidate</p>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Salary (CTC)</label>
                        <input 
                            className="w-full border border-gray-300 rounded-lg p-3 font-medium focus:ring-2 focus:ring-blue-500 outline-none transition" 
                            placeholder="e.g. 12 LPA"
                            value={offerForm.salary}
                            onChange={(e) => setOfferForm({...offerForm, salary: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Joining Date</label>
                        <input 
                            type="date"
                            className="w-full border border-gray-300 rounded-lg p-3 font-medium focus:ring-2 focus:ring-blue-500 outline-none transition" 
                            value={offerForm.date}
                            onChange={(e) => setOfferForm({...offerForm, date: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Personal Note</label>
                        <textarea 
                            rows={3}
                            className="w-full border border-gray-300 rounded-lg p-3 font-medium focus:ring-2 focus:ring-blue-500 outline-none transition resize-none" 
                            placeholder="We are excited to have you on board..."
                            value={offerForm.note}
                            onChange={(e) => setOfferForm({...offerForm, note: e.target.value})}
                        />
                    </div>
                </div>

                <button 
                    onClick={() => selectedAppId && submitStatusUpdate(selectedAppId, 'OFFERED', offerForm)}
                    disabled={!offerForm.salary || !offerForm.date}
                    className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl mt-6 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all shadow-lg shadow-blue-200"
                >
                    Send Offer & Notify Candidate
                </button>
            </div>
        </div>
      )}

    </div>
  );
};

export default JobApplications;