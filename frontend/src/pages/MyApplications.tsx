import { useEffect, useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import * as ApplicationService from '../services/application.service';
import { 
  MapPin, CheckCircle2, XCircle, Clock, Eye, X, Calendar, DollarSign, FileText, Video 
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const MyApplications = () => {
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const location = useLocation();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Combine Offer/Interview selection into one state
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [modalType, setModalType] = useState<'OFFER' | 'INTERVIEW' | null>(null);
  
  const [processingAction, setProcessingAction] = useState(false);

  // --- Reschedule State ---
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleNote, setRescheduleNote] = useState("");

  useEffect(() => {
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
      
    if (!confirm(message)) return;

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

  // --- Reschedule Logic ---
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
      setIsRescheduling(false); // Reset
      setRescheduleNote("");    // Reset
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
        return <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold"><CheckCircle2 className="w-3 h-3"/> HIRED</span>;
      case 'OFFERED':
        return <span className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold animate-pulse">🎉 OFFER RECEIVED</span>;
      case 'REJECTED':
        return <span className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold"><XCircle className="w-3 h-3"/> REJECTED</span>;
      case 'INTERVIEW':
        return <span className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold"><Video className="w-3 h-3"/> INTERVIEW</span>;
      case 'SHORTLISTED':
        return <span className="flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold"><Clock className="w-3 h-3"/> SHORTLISTED</span>;
      default:
        return <span className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold"><Clock className="w-3 h-3"/> APPLIED</span>;
    }
  };

  const formatSalary = (salary: string) => {
    if (!salary) return "Not Disclosed";
    if (/^[\d.]+$/.test(salary)) {
        return `${salary} LPA`;
    }
    return salary;
  };

  if (loading) return <div className="flex h-screen items-center justify-center text-gray-500">Loading your applications...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Applications</h1>

        {applications.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-medium text-gray-900">No applications yet</h3>
            <p className="text-gray-500 mt-2">Start applying to jobs to see them here!</p>
            <Link to="/student-dashboard" className="mt-4 inline-block text-blue-600 hover:underline">Browse Jobs</Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Company</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Location</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 font-bold">
                            {app.job.companyName?.[0] || 'C'}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{app.job.companyName}</p>
                            <p className="text-xs text-gray-500">{app.job.recruiter?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 text-sm">{app.job.title}</td>
                      <td className="px-6 py-4">{getStatusBadge(app.status)}</td>
                      <td className="px-6 py-4 text-gray-500 text-sm">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" /> {app.job.location}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        {app.status === 'OFFERED' || app.status === 'INTERVIEW' ? (
                            <button 
                                onClick={() => openModal(app)}
                                className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-800 transition shadow-sm"
                            >
                                <Eye className="w-3 h-3" /> View Details
                            </button>
                        ) : (
                            <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* --- UNIFIED MODAL --- */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
                
                {/* Modal Header */}
                <div className={`p-6 text-white relative ${modalType === 'OFFER' ? 'bg-gradient-to-r from-blue-600 to-blue-800' : 'bg-gradient-to-r from-purple-600 to-indigo-800'}`}>
                    <button 
                        onClick={closeModal} 
                        className="absolute right-4 top-4 p-2 hover:bg-white/20 rounded-full transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <h2 className="text-2xl font-bold mb-1">
                        {modalType === 'OFFER' ? 'Congratulations! 🎉' : 'Interview Invitation 📅'}
                    </h2>
                    <p className="text-white/80 text-sm">
                        {modalType === 'OFFER' 
                           ? `You have received an offer from ${selectedApp.job.companyName}.`
                           : `You have been shortlisted for an interview at ${selectedApp.job.companyName}.`
                        }
                    </p>
                </div>

                <div className="p-6 space-y-6">
                    
                    {/* --- OFFER CONTENT --- */}
                    {modalType === 'OFFER' && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase mb-1">
                                        <DollarSign className="w-4 h-4" /> Offered Salary
                                    </div>
                                    <p className="text-lg font-bold text-gray-900">{formatSalary(selectedApp.offerSalary)}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase mb-1">
                                        <Calendar className="w-4 h-4" /> Joining Date
                                    </div>
                                    <p className="text-lg font-bold text-gray-900">{selectedApp.joiningDate || "TBD"}</p>
                                </div>
                            </div>
                            {selectedApp.offerNote && (
                                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                     <div className="flex items-center gap-2 text-blue-800 text-xs font-bold uppercase mb-2">
                                        <FileText className="w-4 h-4" /> Message
                                     </div>
                                     <p className="text-gray-700 text-sm italic leading-relaxed">"{selectedApp.offerNote}"</p>
                                </div>
                            )}
                            <div className="flex gap-3 pt-2">
                                <button 
                                    onClick={() => handleResponse('ACCEPT')}
                                    disabled={processingAction}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-green-200 transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2"
                                >
                                    {processingAction ? "Processing..." : <><CheckCircle2 className="w-5 h-5" /> Accept Offer</>}
                                </button>
                                <button 
                                    onClick={() => handleResponse('REJECT')}
                                    disabled={processingAction}
                                    className="flex-1 bg-white border border-gray-200 text-red-600 hover:bg-red-50 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2"
                                >
                                    <XCircle className="w-5 h-5" /> Reject Offer
                                </button>
                            </div>
                        </>
                    )}

                    {/* --- INTERVIEW CONTENT --- */}
                    {modalType === 'INTERVIEW' && (
                        <>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase mb-1">
                                    <Calendar className="w-4 h-4" /> Date & Time
                                </div>
                                <p className="text-lg font-bold text-gray-900">
                                    {selectedApp.interviewDate 
                                      ? new Date(selectedApp.interviewDate).toLocaleString() 
                                      : "Date not set"
                                    }
                                </p>
                            </div>
                            
                            <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                                <div className="flex items-center gap-2 text-purple-800 text-xs font-bold uppercase mb-1">
                                    <Video className="w-4 h-4" /> Meeting Link
                                </div>
                                <a 
                                    href={selectedApp.interviewLink} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="text-blue-600 font-bold hover:underline break-all"
                                >
                                    {selectedApp.interviewLink || "No link provided"}
                                </a>
                            </div>

                            {selectedApp.interviewNote && (
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                     <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase mb-2">
                                        <FileText className="w-4 h-4" /> Instructions
                                     </div>
                                     <p className="text-gray-700 text-sm italic leading-relaxed">"{selectedApp.interviewNote}"</p>
                                </div>
                            )}

                            {/* Reschedule Section */}
                            {isRescheduling ? (
                                <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 animate-in fade-in zoom-in duration-200">
                                    <label className="block text-xs font-bold text-orange-800 uppercase mb-2">
                                        Reason for Rescheduling
                                    </label>
                                    <textarea 
                                        className="w-full p-3 rounded-lg border border-orange-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
                                        rows={3}
                                        placeholder="e.g. I have an exam at that time. Available after 4 PM."
                                        value={rescheduleNote}
                                        onChange={(e) => setRescheduleNote(e.target.value)}
                                    />
                                    <div className="flex gap-2 mt-3">
                                         <button 
                                            onClick={handleRescheduleSubmit}
                                            disabled={!rescheduleNote.trim() || processingAction}
                                            className="flex-1 bg-orange-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-orange-700 transition disabled:opacity-50"
                                        >
                                            {processingAction ? "Sending..." : "Submit Request"}
                                        </button>
                                        <button 
                                            onClick={() => setIsRescheduling(false)}
                                            className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm font-medium"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => setIsRescheduling(true)}
                                        className="flex-1 bg-white border border-gray-300 text-gray-700 py-3 rounded-xl font-bold text-sm hover:bg-gray-50 transition"
                                    >
                                        Request Reschedule
                                    </button>
                                    
                                    <button 
                                        onClick={closeModal}
                                        className="flex-1 bg-gray-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-black transition"
                                    >
                                        Close
                                    </button>
                                </div>
                            )}
                        </>
                    )}

                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default MyApplications;