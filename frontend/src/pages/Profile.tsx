import { useEffect, useState } from 'react';
import * as UserService from '../services/user.service';
import { 
  User, MapPin, Globe, Linkedin, Github, 
  Briefcase, GraduationCap, Edit2, Save, X 
} from 'lucide-react';

const Profile = () => {
  const [profile, setProfile] = useState<UserService.UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Edit Mode Logic
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserService.UserProfile>>({});

  // Load Data on Mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await UserService.getProfile();
      setProfile(data);
      setFormData(data); 
    } catch (error) {
      console.error("Failed to load profile", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle Input Changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Special Handler for Skills (Comma separated string to Array)
  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const skillsArray = e.target.value.split(',').map(skill => skill.trim());
    setFormData({ ...formData, skills: skillsArray });
  };

  // 3. Save Changes
  const handleSave = async () => {
    try {
      await UserService.updateProfile(formData);
      setProfile(formData as UserService.UserProfile); // update ui
      setIsEditing(false); 
      alert("Profile Updated Successfully!");
    } catch (error) {
      alert("Error updating profile");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading Profile...</div>;
  if (!profile) return <div className="p-10 text-center text-red-500">Error loading profile</div>;

  const isStudent = profile.role === 'STUDENT';

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* === LEFT COLUMN: Identity Card === */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl font-bold text-blue-600">
                {profile.firstName?.[0]}{profile.lastName?.[0]}
              </span>
            </div>
            
            {/* Name & Role */}
            <h2 className="text-xl font-bold text-gray-900">{profile.firstName} {profile.lastName}</h2>
            <p className="text-sm text-gray-500 font-medium mt-1">{isStudent ? 'Student' : 'Recruiter'}</p>

            {/* Location */}
            <div className="flex items-center justify-center gap-2 mt-4 text-gray-600">
              <MapPin className="w-4 h-4" />
              {isEditing ? (
                <input 
                  name="location" 
                  value={formData.location || ''} 
                  onChange={handleChange}
                  placeholder="City, Country"
                  className="border rounded px-2 py-1 text-sm w-full"
                />
              ) : (
                <span>{profile.location || 'Add Location'}</span>
              )}
            </div>
          </div>

          {/* Social Links Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">Social Links</h3>
            
            {/* Website */}
            <div className="flex items-center gap-3 text-sm">
              <Globe className="w-4 h-4 text-gray-400" />
              {isEditing ? (
                <input name="website" value={formData.website || ''} onChange={handleChange} placeholder="Portfolio URL" className="border rounded px-2 py-1 flex-1" />
              ) : profile.website ? (
                <a href={profile.website} target="_blank" className="text-blue-600 hover:underline truncate">{profile.website}</a>
              ) : <span className="text-gray-400">Not added</span>}
            </div>

            {/* LinkedIn */}
            <div className="flex items-center gap-3 text-sm">
              <Linkedin className="w-4 h-4 text-gray-400" />
              {isEditing ? (
                <input name="linkedin" value={formData.linkedin || ''} onChange={handleChange} placeholder="LinkedIn URL" className="border rounded px-2 py-1 flex-1" />
              ) : profile.linkedin ? (
                <a href={profile.linkedin} target="_blank" className="text-blue-600 hover:underline truncate">LinkedIn Profile</a>
              ) : <span className="text-gray-400">Not added</span>}
            </div>

            {/* Github (Student Only) */}
            {isStudent && (
              <div className="flex items-center gap-3 text-sm">
                <Github className="w-4 h-4 text-gray-400" />
                {isEditing ? (
                  <input name="github" value={formData.github || ''} onChange={handleChange} placeholder="Github URL" className="border rounded px-2 py-1 flex-1" />
                ) : profile.github ? (
                  <a href={profile.github} target="_blank" className="text-blue-600 hover:underline truncate">Github Profile</a>
                ) : <span className="text-gray-400">Not added</span>}
              </div>
            )}
          </div>
        </div>

        {/* === RIGHT COLUMN: Details === */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Main Info Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 relative">
            
            {/* Header with Edit Button */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">About</h1>
                <p className="text-gray-500">Manage your professional information</p>
              </div>
              
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors font-medium"
                >
                  <Edit2 className="w-4 h-4" /> Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => setIsEditing(false)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><X className="w-5 h-5"/></button>
                  <button onClick={handleSave} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"><Save className="w-4 h-4"/> Save</button>
                </div>
              )}
            </div>

            {/* Fields */}
            <div className="space-y-6">
              
              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                {isEditing ? (
                  <textarea 
                    name="bio" 
                    value={formData.bio || ''} 
                    onChange={handleChange}
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-100 outline-none"
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="text-gray-600 leading-relaxed">{profile.bio || 'No bio added yet.'}</p>
                )}
              </div>

              {/* Work / Education Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {isStudent ? (
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <GraduationCap className="w-4 h-4" /> Institution
                    </label>
                    {isEditing ? (
                      <input name="institutionName" value={formData.institutionName || ''} onChange={handleChange} className="w-full border rounded-lg p-2" />
                    ) : <p className="text-gray-900">{profile.institutionName || 'N/A'}</p>}
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Briefcase className="w-4 h-4" /> Company
                      </label>
                      {isEditing ? (
                        <input name="companyName" value={formData.companyName || ''} onChange={handleChange} className="w-full border rounded-lg p-2" />
                      ) : <p className="text-gray-900">{profile.companyName || 'N/A'}</p>}
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <User className="w-4 h-4" /> Designation
                      </label>
                      {isEditing ? (
                        <input name="designation" value={formData.designation || ''} onChange={handleChange} className="w-full border rounded-lg p-2" />
                      ) : <p className="text-gray-900">{profile.designation || 'N/A'}</p>}
                    </div>
                  </>
                )}
              </div>

              {/* Skills Section (Only for Student) */}
              {isStudent && (
                <div className="pt-4 border-t border-gray-100">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Skills</label>
                  {isEditing ? (
                    <div>
                      <input 
                        name="skills"
                        value={formData.skills?.join(', ') || ''} 
                        onChange={handleSkillsChange}
                        placeholder="React, Node.js, Python (comma separated)"
                        className="w-full border border-gray-300 rounded-lg p-3"
                      />
                      <p className="text-xs text-gray-500 mt-1">Separate skills with commas</p>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {profile.skills && profile.skills.length > 0 ? (
                        profile.skills.map((skill, index) => (
                          <span key={index} className="px-3 py-1 bg-blue-50 text-blue-600 text-sm font-medium rounded-full">
                            {skill}
                          </span>
                        ))
                      ) : <span className="text-gray-400 text-sm">No skills added</span>}
                    </div>
                  )}
                </div>
              )}
              
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;