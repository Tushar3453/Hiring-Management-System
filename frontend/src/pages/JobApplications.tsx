import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import * as ApplicationService from '../services/application.service';
import { FileText, Mail, GraduationCap, Save } from 'lucide-react';

const JobApplications = () => {
  const { jobId } = useParams();
  const [applications, setApplications] = useState<ApplicationService.Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Track which application IDs are currently updating (for loading spinner on button)
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (jobId) fetchApplications();
  }, [jobId]);

  const fetchApplications = async () => {
    try {
      if (!jobId) return;
      const data = await ApplicationService.getJobApplications(jobId);
      setApplications(data);
    } catch (error) {
      console.error("Failed to fetch applications", error);
    } finally {
      setLoading(false);
    }
  };

  // updating local state
  const handleLocalChange = (appId: string, newStatus: string) => {
    setApplications(prev => prev.map(app => 
      app.id === appId ? { ...app, status: newStatus as any } : app
    ));
  };

  // updating database
  const saveStatus = async (appId: string, status: string) => {
    // updating ids
    setUpdatingIds(prev => new Set(prev).add(appId));

    try {
      await ApplicationService.updateApplicationStatus(appId, status);
      alert("Status updated successfully!");
    } catch (error) {
      alert("Failed to update status");
      fetchApplications();
    } finally {
      setUpdatingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(appId);
        return newSet;
      });
    }
  };

  if (loading) return <div className="p-10 text-center">Loading Applicants...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Job Applicants</h1>
        <p className="text-gray-500 mb-8">Review and manage candidates for this role.</p>

        {applications.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-medium text-gray-900">No applications yet</h3>
            <p className="text-gray-500 mt-2">Waiting for candidates to apply.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {applications.map((app) => (
              <div key={app.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row gap-6">
                
                {/* Left: Candidate Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {app.student.firstName} {app.student.lastName}
                      </h3>
                      <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
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
                  <div className="mt-4 flex flex-wrap gap-2">
                    {app.student.skills.map((skill, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Resume Button */}
                  {app.student.resumeUrl && (
                    <div className="mt-4">
                      <a 
                        href={app.student.resumeUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:underline"
                      >
                        <FileText className="w-4 h-4" /> View Resume
                      </a>
                    </div>
                  )}
                </div>

                {/* Right: Actions */}
                <div className="md:w-72 flex flex-col gap-3 border-l border-gray-100 md:pl-6">
                  <label className="text-sm font-medium text-gray-700">Change Status</label>
                  
                  <div className="flex gap-2">
                    <select
                      value={app.status}
                      onChange={(e) => handleLocalChange(app.id, e.target.value)}
                      className={`flex-1 p-2.5 rounded-lg border text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none
                        ${app.status === 'HIRED' ? 'bg-green-50 border-green-200 text-green-700' : 
                          app.status === 'REJECTED' ? 'bg-red-50 border-red-200 text-red-700' : 
                          'bg-white border-gray-300 text-gray-700'}`}
                    >
                      <option value="APPLIED">Applied</option>
                      <option value="SHORTLISTED">Shortlisted</option>
                      <option value="INTERVIEW">Interview</option>
                      <option value="OFFERED">Offered</option>
                      <option value="HIRED">Hired</option>
                      <option value="REJECTED">Rejected</option>
                    </select>

                    {/* Finalize Button */}
                    <button
                      onClick={() => saveStatus(app.id, app.status)}
                      disabled={updatingIds.has(app.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-lg transition-colors disabled:opacity-50"
                      title="Save Status"
                    >
                      {updatingIds.has(app.id) ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Save className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  <div className="text-xs text-gray-400 mt-auto">
                    Select a status and click save to finalize.
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