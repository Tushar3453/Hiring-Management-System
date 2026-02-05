import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as ApplicationService from '../services/application.service';
import { 
  MapPin, CheckCircle2, XCircle, Clock, Eye, X, Calendar, DollarSign, FileText 
} from 'lucide-react';

const MyApplications = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedOffer, setSelectedOffer] = useState<any | null>(null);
  const [processingAction, setProcessingAction] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

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
    if (!selectedOffer) return;
    
    const message = action === 'ACCEPT' 
      ? "Are you sure you want to ACCEPT this offer? This will be your final decision." 
      : "Are you sure you want to REJECT this offer?";
      
    if (!confirm(message)) return;

    setProcessingAction(true);
    try {
        await ApplicationService.respondToOffer(selectedOffer.id, action);
        alert(`Offer ${action === 'ACCEPT' ? 'Accepted' : 'Rejected'} successfully!`);
        setSelectedOffer(null); 
        fetchApplications(); 
    } catch (error: any) {
        alert(error.response?.data?.message || "Action failed");
    } finally {
        setProcessingAction(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'HIRED':
        return <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold"><CheckCircle2 className="w-3 h-3"/> HIRED</span>;
      case 'OFFERED':
        return <span className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold animate-pulse">🎉 OFFER RECEIVED</span>;
      case 'REJECTED':
        return <span className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold"><XCircle className="w-3 h-3"/> REJECTED</span>;
      case 'SHORTLISTED':
      case 'INTERVIEW':
        return <span className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold"><Clock className="w-3 h-3"/> {status}</span>;
      default:
        return <span className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold"><Clock className="w-3 h-3"/> APPLIED</span>;
    }
  };

  // Smart Salary Formatting
  const formatSalary = (salary: string) => {
    if (!salary) return "Not Disclosed";
    // Regex check: If it contains only digits and optional dots (e.g. "7", "7.5", "12")
    // then append " LPA". Otherwise (e.g. "12 LPA", "Competitive"), show as is.
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
                        {app.status === 'OFFERED' ? (
                            <button 
                                onClick={() => setSelectedOffer(app)}
                                className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-800 transition shadow-sm"
                            >
                                <Eye className="w-3 h-3" /> View Offer
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

      {selectedOffer && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
                
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white relative">
                    <button 
                        onClick={() => setSelectedOffer(null)} 
                        className="absolute right-4 top-4 p-2 hover:bg-white/20 rounded-full transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <h2 className="text-2xl font-bold mb-1">Congratulations! 🎉</h2>
                    <p className="text-blue-100 text-sm">You have received an offer from <span className="font-bold">{selectedOffer.job.companyName}</span>.</p>
                </div>

                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase mb-1">
                                <DollarSign className="w-4 h-4" /> Offered Salary
                            </div>
                            <p className="text-lg font-bold text-gray-900">{formatSalary(selectedOffer.offerSalary)}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase mb-1">
                                <Calendar className="w-4 h-4" /> Joining Date
                            </div>
                            <p className="text-lg font-bold text-gray-900">{selectedOffer.joiningDate || "TBD"}</p>
                        </div>
                    </div>

                    {selectedOffer.offerNote && (
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                             <div className="flex items-center gap-2 text-blue-800 text-xs font-bold uppercase mb-2">
                                <FileText className="w-4 h-4" /> Message from Recruiter
                            </div>
                            <p className="text-gray-700 text-sm italic leading-relaxed">
                                "{selectedOffer.offerNote}"
                            </p>
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
                    
                    <p className="text-xs text-gray-400 text-center">
                        Once accepted, the recruiter will be notified immediately.
                    </p>
                </div>

            </div>
        </div>
      )}

    </div>
  );
};

export default MyApplications;