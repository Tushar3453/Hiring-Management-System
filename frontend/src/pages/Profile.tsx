import { useEffect, useState, useContext } from 'react'; 
import * as UserService from '../services/user.service';
import { AuthContext } from '../context/AuthContext';
import {
  MapPin, Globe, Linkedin, Github,
  Briefcase, GraduationCap, Edit2, Save, X, FileText,
  Building, Sparkles, Ban, Calendar, Target
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Profile = () => {
  const auth = useContext(AuthContext); 
  const [profile, setProfile] = useState<UserService.UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  // Edit Mode Logic
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserService.UserProfile>>({});

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await UserService.getProfile();
      setProfile(data);
      setFormData(data);
      
      if (auth) auth.updateUser(data);
    } catch (error) {
      console.error("Failed to load profile", error);
      toast.error("Failed to load profile details.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const skillsArray = e.target.value.split(',').map(skill => skill.trim());
    setFormData({ ...formData, skills: skillsArray });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = new FormData();

      Object.keys(formData).forEach(key => {
        const value = (formData as any)[key];
        if (value !== null && value !== undefined) {
          if (key === 'skills' && Array.isArray(value)) {
            data.append(key, value.join(','));
          } else {
            data.append(key, value);
          }
        }
      });

      if (resumeFile) {
        data.append('resume', resumeFile);
      }

      await UserService.updateProfile(data);

      const updatedProfile = await UserService.getProfile();
      setProfile(updatedProfile);
      
      if (auth) {
        auth.updateUser(updatedProfile);
      }

      setIsEditing(false);
      setResumeFile(null);
      toast.success("Profile Updated Successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Error updating profile");
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  // --- GAMIFICATION LOGIC ---
  const getCompletionStats = () => {
    if (!profile) return { percentage: 0, missing: [] };
    let score = 0;
    const missing: string[] = [];

    // Base (Name/Email) - 30%
    if (profile.firstName) {
      score += 30;
    } else {
      missing.push('Name');
    }

    // Skills - 25%
    if (profile.skills && profile.skills.length > 0) {
      score += 25;
    } else {
      missing.push('Skills');
    }

    // Social Links - 15%
    if (profile.linkedin || profile.github || profile.website) {
      score += 15;
    } else {
      missing.push('Social Links (LinkedIn/GitHub)');
    }

    // Bio - 15%
    if (profile.bio) {
      score += 15;
    } else {
      missing.push('Bio');
    }

    // Resume - 15%
    if (profile.resumeUrl) {
      score += 15;
    } else {
      missing.push('Resume');
    }

    return { percentage: score, missing };
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 animate-pulse">
        <div className="md:col-span-1 space-y-6">
           <div className="bg-white rounded-3xl border border-gray-100 h-80"></div>
           <div className="bg-white rounded-3xl border border-gray-100 h-48"></div>
        </div>
        <div className="md:col-span-2">
           <div className="bg-white rounded-3xl border border-gray-100 h-[600px]"></div>
        </div>
      </div>
    </div>
  );

  if (!profile) return <div className="p-10 text-center text-red-500 font-bold">Error loading profile</div>;

  const isStudent = profile.role === 'STUDENT';
  const { percentage, missing } = getCompletionStats();

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-20 selection:bg-blue-100 selection:text-blue-900 relative">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-b from-blue-50/80 to-transparent pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 relative z-10">
        
        {/* --- GAMIFIED PROGRESS BANNER --- */}
        {percentage < 100 && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 shadow-lg text-white border border-blue-500/30 overflow-hidden relative"
          >
            {/* Decorative background circle */}
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-300" />
                  Profile Completion: {percentage}%
                </h3>
                <p className="text-blue-100 font-medium text-sm">
                  {missing.length > 0 
                    ? `Add your ${missing[0]} to stand out to recruiters and land your dream job!` 
                    : 'Complete your profile to get noticed!'}
                </p>
              </div>
              <div className="w-full md:w-72">
                <div className="flex justify-between text-xs font-bold text-blue-200 mb-2">
                  <span>Getting Started</span>
                  <span>All Star</span>
                </div>
                <div className="h-3 w-full bg-black/20 rounded-full overflow-hidden backdrop-blur-sm border border-black/10">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 rounded-full"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* === LEFT COLUMN: Identity Card === */}
          <div className="md:col-span-1 space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden text-center relative">
              
              {/* Banner Cover */}
              <div className="h-24 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

              {/* Overlapping Avatar */}
              <div className="relative -mt-12 mb-4">
                <div className="w-24 h-24 bg-white rounded-2xl mx-auto p-1 shadow-md">
                  <div className="w-full h-full bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
                    <span className="text-3xl font-extrabold text-blue-600">
                      {profile.firstName?.[0]}{profile.lastName?.[0]}
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-6 pb-6">
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">{profile.firstName} {profile.lastName}</h2>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-bold bg-gray-50 text-gray-500 mt-2 uppercase tracking-wider border border-gray-100">
                  {isStudent ? <GraduationCap className="w-3.5 h-3.5" /> : <Briefcase className="w-3.5 h-3.5" />} 
                  {isStudent ? 'Student Account' : 'Recruiter Account'}
                </div>

                <div className="flex items-center justify-center gap-2 mt-4 text-sm font-medium text-gray-500">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {isEditing ? (
                    <input
                      name="location"
                      value={formData.location || ''}
                      onChange={handleChange}
                      placeholder="City, Country"
                      className="border-b-2 border-gray-200 focus:border-blue-500 px-1 py-0.5 outline-none bg-transparent text-center text-gray-900 transition-colors w-full"
                    />
                  ) : (
                    <span>{profile.location || 'Add Location'}</span>
                  )}
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-4">
              <h3 className="font-bold text-gray-900 mb-2">Social Links</h3>

              <div className="flex items-center gap-3 text-sm">
                <div className="p-2 bg-gray-50 rounded-lg text-gray-400"><Globe className="w-4 h-4" /></div>
                {isEditing ? (
                  <input name="website" value={formData.website || ''} onChange={handleChange} placeholder="Portfolio URL" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all text-gray-900" />
                ) : profile.website ? (
                  <a href={profile.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-medium truncate">{profile.website}</a>
                ) : <span className="text-gray-400 font-medium">Not added</span>}
              </div>

              <div className="flex items-center gap-3 text-sm">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-500"><Linkedin className="w-4 h-4" /></div>
                {isEditing ? (
                  <input name="linkedin" value={formData.linkedin || ''} onChange={handleChange} placeholder="LinkedIn URL" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all text-gray-900" />
                ) : profile.linkedin ? (
                  <a href={profile.linkedin} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-medium truncate">LinkedIn Profile</a>
                ) : <span className="text-gray-400 font-medium">Not added</span>}
              </div>

              {isStudent && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="p-2 bg-gray-100 rounded-lg text-gray-700"><Github className="w-4 h-4" /></div>
                  {isEditing ? (
                    <input name="github" value={formData.github || ''} onChange={handleChange} placeholder="Github URL" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all text-gray-900" />
                  ) : profile.github ? (
                    <a href={profile.github} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-medium truncate">Github Profile</a>
                  ) : <span className="text-gray-400 font-medium">Not added</span>}
                </div>
              )}
            </motion.div>
          </div>

          {/* === RIGHT COLUMN: Details === */}
          <div className="md:col-span-2 space-y-6">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 relative">

              <div className="flex justify-between items-start mb-8 pb-6 border-b border-gray-100">
                <div>
                  <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Profile Details</h1>
                  <p className="text-gray-500 font-medium mt-1">Manage your professional information</p>
                </div>

                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 hover:border-blue-300 hover:text-blue-600 px-5 py-2.5 rounded-xl transition-all font-bold shadow-sm active:scale-95"
                  >
                    <Edit2 className="w-4 h-4" /> Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => setIsEditing(false)} disabled={saving} className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-100 disabled:opacity-50"><X className="w-5 h-5" /></button>
                    <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20 active:scale-95 disabled:opacity-50">
                      <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-8">

                {/* Bio Section */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
                    <FileText className="w-4 h-4 text-gray-400"/> Bio
                  </label>
                  {isEditing ? (
                    <textarea
                      name="bio"
                      value={formData.bio || ''}
                      onChange={handleChange}
                      rows={4}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 focus:ring-4 focus:ring-blue-50 focus:border-blue-300 outline-none transition-all text-gray-900 font-medium resize-none"
                      placeholder="Write a short professional bio about yourself..."
                    />
                  ) : (
                    <p className="text-gray-600 font-medium leading-relaxed bg-gray-50/50 p-5 rounded-xl border border-gray-100">
                      {profile.bio || 'No bio added yet. Tell recruiters about your journey!'}
                    </p>
                  )}
                </div>

                {/* Professional Details Section */}
                {isStudent ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
                        <GraduationCap className="w-4 h-4 text-gray-400" /> Institution
                      </label>
                      {isEditing ? (
                        <input name="institutionName" value={formData.institutionName || ''} onChange={handleChange} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-300 transition-all text-gray-900 font-medium shadow-sm" placeholder="E.g. IIT Delhi" />
                      ) : (
                        <p className="text-gray-900 font-bold text-lg">{profile.institutionName || <span className="text-gray-400 font-medium text-base">Not specified</span>}</p>
                      )}
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
                        <Calendar className="w-4 h-4 text-gray-400" /> Grad Year
                      </label>
                      {isEditing ? (
                        <input name="graduationYear" value={formData.graduationYear || ''} onChange={handleChange} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-300 transition-all text-gray-900 font-medium shadow-sm" placeholder="2026" />
                      ) : (
                        <p className="text-gray-900 font-bold text-lg">{profile.graduationYear || <span className="text-gray-400 font-medium text-base">Not specified</span>}</p>
                      )}
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
                        <Target className="w-4 h-4 text-gray-400" /> CGPA
                      </label>
                      {isEditing ? (
                        <input name="cgpa" type="number" step="0.01" value={formData.cgpa || ''} onChange={handleChange} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-300 transition-all text-gray-900 font-medium shadow-sm" placeholder="E.g. 8.5" />
                      ) : (
                        <p className="text-gray-900 font-bold text-lg">{profile.cgpa ? `${profile.cgpa} / 10` : <span className="text-gray-400 font-medium text-base">Not specified</span>}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
                        <Building className="w-4 h-4 text-gray-400" /> Company
                      </label>
                      {isEditing ? (
                        <input name="companyName" value={formData.companyName || ''} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-300 transition-all text-gray-900 font-medium" />
                      ) : <p className="text-gray-900 font-bold text-lg">{profile.companyName || <span className="text-gray-400 font-medium text-base">Not specified</span>}</p>}
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
                        <Briefcase className="w-4 h-4 text-gray-400" /> Designation
                      </label>
                      {isEditing ? (
                        <input name="designation" value={formData.designation || ''} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-300 transition-all text-gray-900 font-medium" />
                      ) : <p className="text-gray-900 font-bold text-lg">{profile.designation || <span className="text-gray-400 font-medium text-base">Not specified</span>}</p>}
                    </div>
                  </div>
                )}

                {/* Skills Section */}
                {isStudent && (
                  <div className="pt-6 border-t border-gray-100">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">
                      <Sparkles className="w-4 h-4 text-gray-400" /> Skills
                    </label>
                    {isEditing ? (
                      <div>
                        <input
                          name="skills"
                          value={formData.skills?.join(', ') || ''}
                          onChange={handleSkillsChange}
                          placeholder="E.g. React, Node.js, Python (comma separated)"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-300 transition-all text-gray-900 font-medium"
                        />
                        <p className="text-xs font-semibold text-gray-400 mt-2 ml-1">Separate skills with commas</p>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {profile.skills && profile.skills.length > 0 ? (
                          profile.skills.map((skill, index) => (
                            <span key={index} className="px-3 py-1.5 bg-blue-50 border border-blue-100 text-blue-700 text-sm font-bold rounded-lg shadow-sm">
                              {skill}
                            </span>
                          ))
                        ) : <span className="text-gray-400 text-sm font-medium bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">No skills added yet</span>}
                      </div>
                    )}
                  </div>
                )}

                {/* Resume Section */}
                {isStudent && (
                  <div className="pt-6 border-t border-gray-100">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">
                      <FileText className="w-4 h-4 text-gray-400" /> Default Resume
                    </label>
                    {isEditing ? (
                      <div className="relative group cursor-pointer">
                         <input
                           type="file"
                           accept=".pdf"
                           onChange={handleFileChange}
                           className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:transition-colors file:cursor-pointer border border-dashed border-gray-300 rounded-2xl p-2 bg-gray-50 hover:bg-gray-100 transition-colors"
                         />
                         {resumeFile && <p className="text-xs text-green-600 font-bold mt-2 ml-2">Selected: {resumeFile.name}</p>}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {profile.resumeUrl ? (
                          <a
                            href={profile.resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 px-5 py-3 rounded-xl transition-all font-bold shadow-sm"
                          >
                            <FileText className="w-4 h-4" /> View Current Resume
                          </a>
                        ) : (
                          <span className="flex items-center gap-2 text-gray-400 text-sm font-medium bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">
                            <Ban className="w-4 h-4"/> No resume uploaded
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}

              </div>
            </motion.div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;