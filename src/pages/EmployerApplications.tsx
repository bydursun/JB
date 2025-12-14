import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { applicationAPI, jobAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Users,
  MapPin,
  Mail,
  Phone,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ArrowLeft,
} from 'lucide-react';

type ApplicationStatus = 'pending' | 'reviewing' | 'shortlisted' | 'rejected' | 'accepted';

interface Application {
  _id: string;
  status: ApplicationStatus;
  notes?: string;
  createdAt: string;
  userId: {
    name: string;
    email: string;
    phone?: string;
    location?: string;
    resumeLink?: string;
    skills?: string[];
  };
  jobId: {
    _id: string;
    title: string;
    company: string;
  };
}

const statusOptions: ApplicationStatus[] = ['pending', 'reviewing', 'shortlisted', 'accepted', 'rejected'];

const statusBadge = {
  pending: 'bg-yellow-100 text-yellow-800',
  reviewing: 'bg-blue-100 text-blue-800',
  shortlisted: 'bg-purple-100 text-purple-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

const statusIcon = {
  pending: <Clock className="h-4 w-4" />,
  reviewing: <ChevronDown className="h-4 w-4" />,
  shortlisted: <CheckCircle className="h-4 w-4" />,
  accepted: <CheckCircle className="h-4 w-4" />,
  rejected: <XCircle className="h-4 w-4" />,
};

const EmployerApplications: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [applications, setApplications] = useState<Application[]>([]);
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | ''>('');
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalApplications: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [stats, setStats] = useState<Record<string, number>>({});
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'employer') {
      navigate('/login');
      return;
    }
    fetchJobs();
  }, [authLoading, user, navigate]);

  const fetchJobs = async () => {
    try {
      const res = await jobAPI.getMyJobs({ limit: 50 });
      const jobList = res.data.data.jobs || [];
      setJobs(jobList);
      if (jobList.length > 0) {
        setSelectedJobId(jobList[0]._id);
        fetchApplications(jobList[0]._id, 1, statusFilter);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to load jobs');
    }
  };

  const fetchApplications = async (jobId: string, page = 1, status: ApplicationStatus | '' = '') => {
    setLoading(true);
    setError('');
    try {
      const res = await applicationAPI.getJobApplications(jobId, {
        page,
        limit: 10,
        status: status || undefined,
      });
      setApplications(res.data.data.applications || []);
      setPagination(res.data.pagination);
      const statMap = (res.data.stats || []).reduce((acc: Record<string, number>, item: any) => {
        acc[item._id] = item.count;
        return acc;
      }, {});
      setStats(statMap);
    } catch (err: any) {
      setApplications([]);
      setError(err?.response?.data?.message || 'Unable to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (applicationId: string, nextStatus: ApplicationStatus) => {
    try {
      await applicationAPI.updateApplicationStatus(applicationId, { status: nextStatus });
      let previousStatus: ApplicationStatus | null = null;

      setApplications((prev) =>
        prev.map((app) => {
          if (app._id === applicationId) {
            previousStatus = app.status;
            return { ...app, status: nextStatus };
          }
          return app;
        })
      );

      setStats((prev) => {
        const updated = { ...prev };
        if (previousStatus) {
          updated[previousStatus] = Math.max((updated[previousStatus] || 1) - 1, 0);
        }
        updated[nextStatus] = (updated[nextStatus] || 0) + 1;
        return updated;
      });
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to update status');
    }
  };

  const handleJobChange = (jobId: string) => {
    setSelectedJobId(jobId);
    fetchApplications(jobId, 1, statusFilter);
  };

  const statusCounts = useMemo(() => {
    return statusOptions.map((status) => ({
      status,
      count: stats[status] || 0,
    }));
  }, [stats]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-gray-500 mb-1 flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4 text-gray-400" />
              <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-blue-600">
                Back
              </button>
            </p>
            <h1 className="text-3xl font-bold text-gray-900">Applications</h1>
            <p className="text-gray-600 mt-1">Review candidates for your job postings.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow p-5 lg:col-span-2">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <label className="text-sm text-gray-600">Select Job</label>
                <div className="relative mt-2">
                  <select
                    value={selectedJobId}
                    onChange={(e) => handleJobChange(e.target.value)}
                    className="w-full appearance-none border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {jobs.map((job) => (
                      <option key={job._id} value={job._id}>
                        {job.title} at {job.company}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="h-4 w-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    const value = e.target.value as ApplicationStatus | '';
                    setStatusFilter(value);
                    if (selectedJobId) {
                      fetchApplications(selectedJobId, 1, value);
                    }
                  }}
                  className="w-48 border border-gray-300 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">All</option>
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Status Overview</h3>
            <div className="grid grid-cols-2 gap-3">
              {statusCounts.map(({ status, count }) => (
                <div key={status} className="p-3 rounded-lg border border-gray-100 bg-gray-50">
                  <p className="text-xs text-gray-500 capitalize">{status}</p>
                  <p className="text-xl font-semibold text-gray-900">{count}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Applicants</h2>
            </div>
            <p className="text-sm text-gray-500">
              {pagination.totalApplications} total
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="py-10 flex justify-center">
              <LoadingSpinner size="lg" />
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-700 font-medium">No applications yet</p>
              <p className="text-sm text-gray-500">Share your job posting to attract candidates.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((application) => (
                <div
                  key={application._id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-200 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="text-lg font-semibold text-gray-900">{application.userId.name}</p>
                        <span
                          className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${statusBadge[application.status]}`}
                        >
                          {statusIcon[application.status]}
                          <span className="capitalize">{application.status}</span>
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-600 mt-1">
                        <span className="flex items-center space-x-1">
                          <Mail className="h-4 w-4" />
                          <span>{application.userId.email}</span>
                        </span>
                        {application.userId.phone && (
                          <span className="flex items-center space-x-1">
                            <Phone className="h-4 w-4" />
                            <span>{application.userId.phone}</span>
                          </span>
                        )}
                        {application.userId.location && (
                          <span className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{application.userId.location}</span>
                          </span>
                        )}
                      </div>
                      <div className="mt-2 text-sm text-gray-700">
                        <span className="font-medium">Applied for:</span>{' '}
                        {application.jobId.title} at {application.jobId.company}
                      </div>
                      {application.userId.skills && application.userId.skills.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {application.userId.skills.slice(0, 6).map((skill) => (
                            <span
                              key={skill}
                              className="px-3 py-1 text-xs rounded-full bg-blue-50 text-blue-700 border border-blue-100"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                      {application.userId.resumeLink && (
                        <a
                          href={application.userId.resumeLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 mt-3"
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          View Resume
                        </a>
                      )}
                    </div>

                    <div className="min-w-[220px]">
                      <label className="text-xs text-gray-500">Update Status</label>
                      <select
                        value={application.status}
                        onChange={(e) => handleStatusChange(application._id, e.target.value as ApplicationStatus)}
                        className="w-full mt-2 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {pagination.totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <button
                disabled={!pagination.hasPrev}
                onClick={() => fetchApplications(selectedJobId, pagination.currentPage - 1, statusFilter)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <p className="text-sm text-gray-600">
                Page {pagination.currentPage} of {pagination.totalPages}
              </p>
              <button
                disabled={!pagination.hasNext}
                onClick={() => fetchApplications(selectedJobId, pagination.currentPage + 1, statusFilter)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployerApplications;
