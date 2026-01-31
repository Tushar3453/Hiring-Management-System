import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as JobService from '../services/job.service';
import { Briefcase, MapPin, DollarSign, Building, Save } from 'lucide-react';

const PostJob = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    companyName: '',
    location: '',
    minSalary: '',
    maxSalary: '',
    currency: 'INR',
    requirements: '', // String rakhenge, submit karte waqt array banayenge
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Requirements string ko array mein convert karna (comma ya new line se)
      const formattedRequirements = formData.requirements
        .split(',')
        .map(req => req.trim())
        .filter(req => req.length > 0);

      const payload = {
        ...formData,
        requirements: formattedRequirements,
      };

      await JobService.postJob(payload);
      
      alert("Job Posted Successfully!");
      navigate('/dashboard'); // Job post hone ke baad dashboard par bhejo
    } catch (error) {
      console.error(error);
      alert("Failed to post job. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Post a New Job</h1>
            <p className="text-gray-500 mt-1">Find the best talent for your company</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Job Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  name="title"
                  required
                  placeholder="e.g. Senior React Developer"
                  value={formData.title}
                  onChange={handleChange}
                  className="pl-10 w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Company & Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    name="companyName"
                    required
                    placeholder="e.g. Tech Corp"
                    value={formData.companyName}
                    onChange={handleChange}
                    className="pl-10 w-full border border-gray-300 rounded-lg p-2.5"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    name="location"
                    placeholder="e.g. Remote / Bangalore"
                    value={formData.location}
                    onChange={handleChange}
                    className="pl-10 w-full border border-gray-300 rounded-lg p-2.5"
                  />
                </div>
              </div>
            </div>

            {/* Salary Range */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Min Salary</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    name="minSalary"
                    required
                    placeholder="500000"
                    value={formData.minSalary}
                    onChange={handleChange}
                    className="pl-10 w-full border border-gray-300 rounded-lg p-2.5"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Salary</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    name="maxSalary"
                    required
                    placeholder="1200000"
                    value={formData.maxSalary}
                    onChange={handleChange}
                    className="pl-10 w-full border border-gray-300 rounded-lg p-2.5"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2.5 bg-white"
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Job Description</label>
              <textarea
                name="description"
                required
                rows={4}
                placeholder="Describe the role and responsibilities..."
                value={formData.description}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-3"
              />
            </div>

            {/* Requirements */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Requirements</label>
              <textarea
                name="requirements"
                rows={3}
                placeholder="React, Node.js, TypeScript (Separate by commas)"
                value={formData.requirements}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-3"
              />
              <p className="text-xs text-gray-500 mt-1">Separate skills with commas (e.g. Java, Spring Boot, SQL)</p>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50"
              >
                {loading ? 'Posting...' : <><Save className="w-5 h-5" /> Post Job</>}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default PostJob;