import { useEffect, useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import * as ApplicationService from '../services/application.service';
import { 
  MapPin, CheckCircle2, XCircle, Clock, Eye, X, Calendar, DollarSign, 
  FileText, Video, ExternalLink, Search, Sparkles, Briefcase
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const MyApplications = () => {
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const location = useLocation();
  
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [modalType, setModalType] = useState<'OFFER' | 'INTERVIEW' | null>(null);
  
  const [processingAction, setProcessingAction] = useState(false);

  // --- Reschedule State ---
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleNote, setRescheduleNote] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    if (user) {
      fetchApplications();
    }
  }, [user, location.state]); 

  const fetchApplications = async () => {
    try {
      const data = await ApplicationService.getMyApplications();
      setApplications(data);
    } catch (error) {
      console.error("Failed to load applications", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (action: 'ACCEPT' | 'REJECT') => {
    if (!selectedApp) return;
    
    const message = action === 'ACCEPT' 
      ? "Are you sure you want to ACCEPT this offer? This will be your final decision." 
      : "Are you sure you want to REJECT this offer?";
      
    if (!window.confirm(message)) return;

    setProcessingAction(true);
    try {
        await ApplicationService.respondToOffer(selectedApp.id, action);
        alert(`Offer ${action === 'ACCEPT' ? 'Accepted' : 'Rejected'} successfully!`);
        closeModal();
        fetchApplications(); 
    } catch (error: any) {
        alert(error.response?.data?.message || "Action failed");
    } finally {
        setProcessingAction(false);
    }
  };

  const handleRescheduleSubmit = async () => {
    if (!selectedApp || !rescheduleNote.trim()) return;
    
    setProcessingAction(true);
    try {
        await ApplicationService.requestReschedule(selectedApp.id, rescheduleNote);
        alert("Reschedule request sent! The recruiter will update the time.");
        closeModal();
    } catch (error: any) {
        alert(error.response?.data?.message || "Failed to send request");
    } finally {
        setProcessingAction(false);
    }
  };

  const openModal = (app: any) => {
      setSelectedApp(app);
      setIsRescheduling(false); 
      setRescheduleNote("");    
      if (app.status === 'OFFERED') setModalType('OFFER');
      if (app.status === 'INTERVIEW') setModalType('INTERVIEW');
  };

  const closeModal = () => {
      setSelectedApp(null);
      setModalType(null);
      setIsRescheduling(false);
      setRescheduleNote("");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'HIRED':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-100 text-green-700 rounded-lg text-xs font-bold shadow-sm"><CheckCircle2 className="w-3.5 h-3.5"/> HIRED</span>;
      case 'OFFERED':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-lg text-xs font-bold shadow-sm animate-pulse"><Sparkles className="w-3.5 h-3.5"/> OFFER RECEIVED</span>;
      case 'REJECTED':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-100 text-red-700 rounded-lg text-xs font-bold shadow-sm"><XCircle className="w-3.5 h-3.5"/> REJECTED</span>;
      case 'INTERVIEW':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-100 text-blue-700 rounded-lg text-xs font-bold shadow-sm"><Video className="w-3.5 h-3.5"/> INTERVIEW</span>;
      case 'SHORTLISTED':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 border border-orange-100 text-orange-700 rounded-lg text-xs font-bold shadow-sm"><Clock className="w-3.5 h-3.5"/> SHORTLISTED</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 border border-gray-200 text-gray-700 rounded-lg text-xs font-bold shadow-sm"><Clock className="w-3.5 h-3.5"/> APPLIED</span>;
    }
  };

  const formatSalary = (salary: string) => {
    if (!salary) return "Not Disclosed";
    if (/^[\d.]+$/.test(salary)) {
        return `${salary} LPA`;
    }
    return salary;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-20 selection:bg-blue-100 selection:text-blue-900 relative">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-b from-blue-50/80 to-transparent pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 relative z-10">
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Applications</h1>
          <p className="text-gray-500 font-medium mt-2">Track the status of roles you've applied for.</p>
        </motion.div>

        {loading ? (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
             <div className="p-6 border-b border-gray-100 bg-gray-50/50">
               <div className="h-4 w-1/3 bg-gray-200 rounded-md animate-pulse"></div>
             </div>
             <div className="divide-y divide-gray-50">
               {[1,2,3,4,5].map(i => (
                 <div key={i} className="p-6 flex items-center justify-between animate-pulse">
                   <div className="flex gap-4 items-center w-1/3">
                     <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                     <div className="space-y-2 flex-1">
                       <div className="h-4 bg-gray-200 rounded-md w-3/4"></div>
                       <div className="h-3 bg-gray-200 rounded-md w-1/2"></div>
                     </div>
                   </div>
                   <div className="w-1/4 h-4 bg-gray-200 rounded-md"></div>
                   <div className="w-24 h-8 bg-gray-200 rounded-lg"></div>
                   <div className="w-1/6 h-4 bg-gray-200 rounded-md"></div>
                 </div>
               ))}
             </div>
          </div>
        ) : applications.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-24 bg-white rounded-3xl shadow-sm border border-gray-100 mt-6">
            <div className="bg-blue-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-100">
               <Briefcase className="w-10 h-10 text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No applications yet</h3>
            <p className="text-gray-500 font-medium mb-8 max-w-md mx-auto">You haven't applied to any roles yet. Start exploring opportunities to kickstart your career!</p>
            <Link to="/student-dashboard" className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20 active:scale-95">
              <Search className="w-4 h-4" /> Browse Jobs
            </Link>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/80 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-5 text-xs font-extrabold text-gray-500 uppercase tracking-wider">Company</th>
                    <th className="px-6 py-5 text-xs font-extrabold text-gray-500 uppercase tracking-wider">Role (Click for details)</th>
                    <th className="px-6 py-5 text-xs font-extrabold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-5 text-xs font-extrabold text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-5 text-xs font-extrabold text-gray-500 uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-blue-50/30 transition-colors group">
                      
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center text-blue-600 font-bold text-lg shadow-sm group-hover:bg-white transition-colors shrink-0">
                            {app.job?.companyName?.[0] || 'C'}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm md:text-base">{app.job?.companyName}</p>
                            <p className="text-xs font-medium text-gray-500">{app.job?.recruiter?.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <Link 
                          to={`/jobs/${app.job?.id || app.jobId}`} 
                          className="inline-flex items-center gap-1.5 font-bold text-gray-900 hover:text-blue-600 transition-colors text-sm md:text-base"
                        >
                          {app.job?.title}
                          <ExternalLink className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-blue-600" />
                        </Link>
                      </td>

                      <td className="px-6 py-5 whitespace-nowrap">
                        {getStatusBadge(app.status)}
                      </td>

                      <td className="px-6 py-5 text-gray-500 text-sm font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-gray-400" /> {app.job?.location}
                        </div>
                      </td>
                      
                      <td className="px-6 py-5 text-right whitespace-nowrap">
                        {app.status === 'OFFERED' || app.status === 'INTERVIEW' ? (
                            <button 
                                onClick={() => openModal(app)}
                                className="inline-flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-600 transition-all shadow-md active:scale-95"
                            >
                                <Eye className="w-4 h-4" /> View Update
                            </button>
                        ) : (
                            <span className="text-gray-300 font-medium text-sm pr-6">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>

      {/* --- UNIFIED MODAL --- */}
      <AnimatePresence>
        {selectedApp && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
              <motion.div 
                initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-100"
              >
                  <div className={`p-8 relative ${modalType === 'OFFER' ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-gradient-to-r from-purple-600 to-indigo-600'}`}>
                      <button 
                          onClick={closeModal} 
                          className="absolute right-4 top-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white"
                      >
                          <X className="w-5 h-5" />
                      </button>
                      <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 text-white">
                        {modalType === 'OFFER' ? <Sparkles className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                      </div>
                      <h2 className="text-2xl font-extrabold text-white mb-1 tracking-tight">
                          {modalType === 'OFFER' ? 'Congratulations! 🎉' : 'Interview Invitation'}
                      </h2>
                      <p className="text-white/80 font-medium text-sm">
                          {modalType === 'OFFER' 
                             ? `You have received an offer from ${selectedApp.job.companyName}.`
                             : `You have been shortlisted for an interview at ${selectedApp.job.companyName}.`
                          }
                      </p>
                  </div>

                  <div className="p-8 space-y-6">
                      
                      {/* --- OFFER CONTENT --- */}
                      {modalType === 'OFFER' && (
                          <>
                              <div className="grid grid-cols-2 gap-4">
                                  <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                                      <div className="flex items-center gap-1.5 text-gray-500 text-xs font-bold uppercase mb-2 tracking-wider">
                                          <DollarSign className="w-4 h-4" /> Package
                                      </div>
                                      <p className="text-xl font-black text-gray-900">{formatSalary(selectedApp.offerSalary)}</p>
                                  </div>
                                  <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                                      <div className="flex items-center gap-1.5 text-gray-500 text-xs font-bold uppercase mb-2 tracking-wider">
                                          <Calendar className="w-4 h-4" /> Joining Date
                                      </div>
                                      <p className="text-xl font-black text-gray-900">{selectedApp.joiningDate || "TBD"}</p>
                                  </div>
                              </div>
                              {selectedApp.offerNote && (
                                  <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 relative">
                                       <div className="flex items-center gap-2 text-blue-800 text-xs font-bold uppercase mb-3 tracking-wider">
                                          <FileText className="w-4 h-4" /> Message from Recruiter
                                       </div>
                                       <p className="text-gray-700 font-medium italic leading-relaxed">"{selectedApp.offerNote}"</p>
                                  </div>
                              )}
                              <div className="flex gap-3 pt-4">
                                  <button 
                                      onClick={() => handleResponse('ACCEPT')}
                                      disabled={processingAction}
                                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2 shadow-lg shadow-green-600/20"
                                  >
                                      {processingAction ? "Processing..." : <><CheckCircle2 className="w-5 h-5" /> Accept Offer</>}
                                  </button>
                                  <button 
                                      onClick={() => handleResponse('REJECT')}
                                      disabled={processingAction}
                                      className="flex-1 bg-white border-2 border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200 py-4 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2"
                                  >
                                      <XCircle className="w-5 h-5" /> Reject Offer
                                  </button>
                              </div>
                          </>
                      )}

                      {/* --- INTERVIEW CONTENT --- */}
                      {modalType === 'INTERVIEW' && (
                          <>
                              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                                  <div className="flex items-center gap-1.5 text-gray-500 text-xs font-bold uppercase mb-2 tracking-wider">
                                      <Calendar className="w-4 h-4" /> Date & Time
                                  </div>
                                  <p className="text-lg font-black text-gray-900">
                                      {selectedApp.interviewDate 
                                        ? new Date(selectedApp.interviewDate).toLocaleString([], { dateStyle: 'long', timeStyle: 'short' }) 
                                        : "Date not set"
                                      }
                                  </p>
                              </div>
                              
                              <div className="bg-indigo-50 p-5 rounded-2xl border border-indigo-100">
                                  <div className="flex items-center gap-1.5 text-indigo-800 text-xs font-bold uppercase mb-2 tracking-wider">
                                      <Video className="w-4 h-4" /> Meeting Link
                                  </div>
                                  <a 
                                      href={selectedApp.interviewLink} 
                                      target="_blank" 
                                      rel="noreferrer"
                                      className="text-blue-600 font-bold hover:underline break-all text-lg"
                                  >
                                      {selectedApp.interviewLink || "No link provided"}
                                  </a>
                              </div>

                              {selectedApp.interviewNote && (
                                  <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                                       <div className="flex items-center gap-1.5 text-gray-500 text-xs font-bold uppercase mb-3 tracking-wider">
                                          <FileText className="w-4 h-4" /> Instructions
                                       </div>
                                       <p className="text-gray-700 font-medium italic leading-relaxed">"{selectedApp.interviewNote}"</p>
                                  </div>
                              )}

                              {isRescheduling ? (
                                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="bg-orange-50 p-5 rounded-2xl border border-orange-200 overflow-hidden">
                                      <label className="block text-xs font-bold text-orange-800 uppercase mb-3 tracking-wider">
                                          Reason for Rescheduling
                                      </label>
                                      <textarea 
                                          className="w-full p-4 rounded-xl border border-orange-200 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-400 bg-white resize-none transition-all"
                                          rows={3}
                                          placeholder="e.g. I have a prior commitment at that time. Available tomorrow after 4 PM."
                                          value={rescheduleNote}
                                          onChange={(e) => setRescheduleNote(e.target.value)}
                                      />
                                      <div className="flex gap-3 mt-4">
                                           <button 
                                              onClick={handleRescheduleSubmit}
                                              disabled={!rescheduleNote.trim() || processingAction}
                                              className="flex-1 bg-orange-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-orange-700 transition-colors disabled:opacity-50 shadow-md shadow-orange-600/20 active:scale-95"
                                          >
                                              {processingAction ? "Sending..." : "Submit Request"}
                                          </button>
                                          <button 
                                              onClick={() => setIsRescheduling(false)}
                                              className="px-6 py-3 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-sm font-bold transition-colors"
                                          >
                                              Cancel
                                          </button>
                                      </div>
                                  </motion.div>
                              ) : (
                                  <div className="flex gap-3 pt-4">
                                      <button 
                                          onClick={() => setIsRescheduling(true)}
                                          className="flex-1 bg-white border-2 border-gray-200 text-gray-700 py-4 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95"
                                      >
                                          Request Reschedule
                                      </button>
                                      <button 
                                          onClick={closeModal}
                                          className="flex-1 bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-black transition-all active:scale-95 shadow-md shadow-gray-900/20"
                                      >
                                          Close
                                      </button>
                                  </div>
                              )}
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

export default MyApplications;