import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { jobAPI, applicationAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  MapPin, Building, Calendar, DollarSign, Clock,
  ArrowLeft, Send, CheckCircle, AlertCircle
} from 'lucide-react';

interface Job {
  _id: string;
  title: string;
  description: string;
  company: string;
  location: string;
  jobType: string;
  experience: string;
  salary?: {
    min?: number;
    max?: number;
  };
  requirements: string[];
  benefits: string[];
  skills: string[];
  createdAt: string;
  applicationDeadline?: string;
  createdBy: {
    _id: string;
    name: string;
    company: string;
    email: string;
  };
  isExpired?: boolean;
}

const JobDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationData, setApplicationData] = useState({
    coverLetter: '',
    resumeUrl: ''
  });
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  useEffect(() => {
    if (id) {
      fetchJobDetails();
    }
  }, [id]);

  useEffect(() => {
    const checkApplied = async () => {
      if (!user || user.role !== 'jobseeker' || !id) return;
      try {
        const res = await applicationAPI.getMyApplications({ limit: 50 });
        const apps = res.data?.data?.applications || [];
        setHasApplied(apps.some((a: any) => a.jobId?._id === id));
      } catch {}
    };
    checkApplied();
  }, [user, id]);

  const fetchJobDetails = async () => {
    try {
      const response = await jobAPI.getJob(id!);
      setJob(response.data.data.job);
      setApplicationData(prev => ({
        ...prev,
        resumeUrl: user?.resumeLink || ''
      }));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch job details');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/jobs/${id}` } } });
      return;
    }

    if (user.role !== 'jobseeker') {
      alert('Only job seekers can apply for jobs');
      return;
    }

    setApplying(true);
    try {
      await applicationAPI.applyForJob({
        jobId: id,
        coverLetter: applicationData.coverLetter,
        resumeUrl: applicationData.resumeUrl
      });
      
      setHasApplied(true);
      setShowApplicationForm(false);
      alert('Application submitted successfully!');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to submit application';
      // Common causes: not authorized role, missing token, duplicate apply, deadline passed
      alert(msg);
    } finally {
      setApplying(false);
    }
  };

  const formatSalary = (salary?: { min?: number; max?: number }) => {
    if (!salary || (!salary.min && !salary.max)) return 'Salary not specified';
    
    if (salary.min && salary.max) {
      return `$${salary.min.toLocaleString()} - $${salary.max.toLocaleString()}`;
    } else if (salary.min) {
      return `$${salary.min.toLocaleString()}+`;
    } else if (salary.max) {
      return `Up to $${salary.max.toLocaleString()}`;
    }
    return 'Salary not specified';
  };

  const formatJobType = (type: string) => {
    return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const formatExperience = (exp: string) => {
    const expMap: { [key: string]: string } = {
      'entry': 'Entry Level',
      'mid': 'Mid Level', 
      'senior': 'Senior Level',
      'executive': 'Executive'
    };
    return expMap[exp] || exp;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h2>
          <p className="text-gray-600 mb-6">
            {error || 'The job you are looking for does not exist or has been removed.'}
          </p>
          <Link
            to="/jobs"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  const isExpired = job.applicationDeadline && new Date(job.applicationDeadline) < new Date();
  const canApply = user && user.role === 'jobseeker' && !hasApplied && !isExpired;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            to="/jobs"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="px-8 py-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
                <div className="flex items-center text-gray-600 mb-4">
                  <Building className="h-5 w-5 mr-2" />
                  <span className="text-lg font-medium">{job.company}</span>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {job.location}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {formatExperience(job.experience)}
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />
                    {formatSalary(job.salary)}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Posted {formatDate(job.createdAt)}
                  </div>
                </div>
              </div>
              <div className="mt-6 lg:mt-0 lg:ml-8 flex flex-col items-start lg:items-end space-y-4">
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                  job.jobType === 'full-time' ? 'bg-green-100 text-green-800' :
                  job.jobType === 'part-time' ? 'bg-blue-100 text-blue-800' :
                  job.jobType === 'contract' ? 'bg-purple-100 text-purple-800' :
                  'bg-orange-100 text-orange-800'
                }`}>
                  {formatJobType(job.jobType)}
                </span>
                
                {isExpired ? (
                  <div className="flex items-center text-red-600 bg-red-50 px-4 py-2 rounded-lg">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Application Deadline Passed
                  </div>
                ) : hasApplied ? (
                  <div className="flex items-center text-green-600 bg-green-50 px-4 py-2 rounded-lg">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Application Submitted
                  </div>
                ) : canApply ? (
                  <button
                    onClick={() => setShowApplicationForm(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center font-medium"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Apply Now
                  </button>
                ) : !user ? (
                  <Link
                    to="/login"
                    state={{ from: { pathname: `/jobs/${id}` } }}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center font-medium"
                  >
                    Login to Apply
                  </Link>
                ) : (
                  <div className="text-gray-500 text-sm">
                    {user.role === 'employer' ? 'Employers cannot apply' : 'Cannot apply'}
                  </div>
                )}
              </div>
            </div>

            {job.applicationDeadline && !isExpired && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center text-amber-800">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span className="text-sm">
                    Application deadline: {formatDate(job.applicationDeadline)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="px-8 py-6 space-y-8">
            {/* Job Description */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
              <div className="prose max-w-none text-gray-700">
                {job.description.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-3">{paragraph}</p>
                ))}
              </div>
            </div>

            {/* Requirements */}
            {job.requirements && job.requirements.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  {job.requirements.map((requirement, index) => (
                    <li key={index}>{requirement}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Skills */}
            {job.skills && job.skills.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Required Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Benefits */}
            {job.benefits && job.benefits.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Benefits</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  {job.benefits.map((benefit, index) => (
                    <li key={index}>{benefit}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Company Info */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About the Company</h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center mb-3">
                  <Building className="h-6 w-6 text-gray-500 mr-3" />
                  <h3 className="text-lg font-medium text-gray-900">{job.company}</h3>
                </div>
                <p className="text-gray-600">
                  Contact: {job.createdBy.name} ({job.createdBy.email})
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Application Form Modal */}
        {showApplicationForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Apply for {job.title}
                </h3>
                <form onSubmit={handleApply} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Resume URL (optional)
                    </label>
                    <input
                      type="url"
                      value={applicationData.resumeUrl}
                      onChange={(e) => setApplicationData({
                        ...applicationData,
                        resumeUrl: e.target.value
                      })}
                      placeholder="https://your-resume-link.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cover Letter (optional)
                    </label>
                    <textarea
                      value={applicationData.coverLetter}
                      onChange={(e) => setApplicationData({
                        ...applicationData,
                        coverLetter: e.target.value
                      })}
                      rows={6}
                      placeholder="Tell the employer why you're interested in this position..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowApplicationForm(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={applying}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    >
                      {applying ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Submit Application
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDetails;
