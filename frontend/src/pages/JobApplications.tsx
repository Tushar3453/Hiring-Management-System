import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as ApplicationService from '../services/application.service';
import * as JobService from '../services/job.service'; 
import { 
  FileText, 
  Mail, 
  GraduationCap, 
  Save, 
  ArrowLeft, 
  Building, 
  MapPin, 
  Briefcase 
} from 'lucide-react';

const JobApplications = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  
  const [applications, setApplications] = useState<ApplicationService.Applicant[]>([]);
  const [job, setJob] = useState<JobService.JobData | null>(null); // Job Data State
  const [loading, setLoading] = useState(true);
  
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (jobId) {
      fetchData();
    }
  }, [jobId]);

  const fetchData = async () => {
    try {
      if (!jobId) return;
      
      // Parallel Fetching: Job Details + Applications
      const [jobData, appsData] = await Promise.all([
        JobService.getJobById(jobId),
        ApplicationService.getJobApplications(jobId)
      ]);

      setJob(jobData);
      setApplications(appsData);
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

  const saveStatus = async (appId: string, status: string) => {
    setUpdatingIds(prev => new Set(prev).add(appId));

    try {
      await ApplicationService.updateApplicationStatus(appId, status);
      // Success Notification (toast can be used for future)
      alert("Candidate status updated successfully!"); 
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to update status");
      // Revert changes on error (Refetch)
      fetchData(); 
    } finally {
      setUpdatingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(appId);
        return newSet;
      });
    }
  };

  if (loading) return <div className="p-10 text-center">Loading Data...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* === Navigation & Header Section === */}
        <button 
          onClick={() => navigate('/recruiter-dashboard')} 
          className="flex items-center text-gray-500 hover:text-blue-600 mb-6 transition font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </button>

        {job && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-gray-500 text-sm">
                  <span className="flex items-center gap-1.5">
                    <Building className="w-4 h-4" /> {job.companyName}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" /> {job.location}
                  </span>
                  <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full font-medium border border-blue-100">
                    <Briefcase className="w-3.5 h-3.5" /> {job.jobType || 'Full Time'}
                  </span>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="bg-gray-50 px-6 py-3 rounded-xl border border-gray-100 text-center min-w-[120px]">
                <span className="block text-2xl font-bold text-gray-900">{applications.length}</span>
                <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Total Applicants</span>
              </div>
            </div>
          </div>
        )}

        {/* === Applications List === */}
        <h2 className="text-xl font-bold text-gray-900 mb-4">Candidate List</h2>

        {applications.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No applications yet</h3>
            <p className="text-gray-500 mt-2">Share your job post to attract candidates.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {applications.map((app) => (
              <div key={app.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col lg:flex-row gap-6 hover:shadow-md transition-shadow">
                
                {/* Left: Candidate Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {app.student.firstName} {app.student.lastName}
                      </h3>
                      <p className="text-sm text-gray-500 flex items-center gap-2 mt-1.5">
                        <Mail className="w-4 h-4" /> {app.student.email}
                      </p>
                      {app.student.institutionName && (
                        <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                          <GraduationCap className="w-4 h-4" /> {app.student.institutionName}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Skills */}
                  {app.student.skills && app.student.skills.length > 0 && (
                    <div className="mt-5">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {app.student.skills.map((skill, index) => (
                          <span key={index} className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-md border border-gray-200">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Resume Button */}
                  {app.student.resumeUrl && (
                    <div className="mt-6">
                      <a 
                        href={app.student.resumeUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors border border-blue-100"
                      >
                        <FileText className="w-4 h-4" /> View Resume
                      </a>
                    </div>
                  )}
                </div>

                {/* Right: Actions (Status Change) */}
                <div className="lg:w-80 flex flex-col gap-3 lg:border-l lg:border-gray-100 lg:pl-8 lg:ml-2">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">Application Status</label>
                    
                    <div className="flex gap-2">
                      <select
                        value={app.status}
                        onChange={(e) => handleLocalChange(app.id, e.target.value)}
                        className={`flex-1 p-2.5 rounded-lg border text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer
                          ${app.status === 'HIRED' ? 'bg-green-100 border-green-300 text-green-800' : 
                            app.status === 'REJECTED' ? 'bg-red-100 border-red-300 text-red-800' : 
                            app.status === 'SHORTLISTED' ? 'bg-yellow-50 border-yellow-300 text-yellow-800' :
                            'bg-white border-gray-300 text-gray-700'}`}
                      >
                        <option value="APPLIED">Applied</option>
                        <option value="SHORTLISTED">Shortlisted</option>
                        <option value="INTERVIEW">Interview</option>
                        <option value="OFFERED">Offered</option>
                        <option value="HIRED">Hired</option>
                        <option value="REJECTED">Rejected</option>
                      </select>

                      {/* Save Button */}
                      <button
                        onClick={() => saveStatus(app.id, app.status)}
                        disabled={updatingIds.has(app.id)}
                        className="bg-gray-900 hover:bg-black text-white px-3 py-2 rounded-lg transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                        title="Save Changes"
                      >
                        {updatingIds.has(app.id) ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                          <Save className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2 text-center leading-tight">
                      Update status and click save. <br/>Transitions are strictly validated.
                    </p>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobApplications;