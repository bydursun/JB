import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { applicationAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { Briefcase, Clock, AlertCircle, Eye } from 'lucide-react';

type Application = {
  _id: string;
  status: string;
  createdAt: string;
  jobId: {
    _id: string;
    title: string;
    company: string;
    location: string;
    jobType: string;
    salary?: { min?: number; max?: number };
    createdAt: string;
  };
};

const statusStyles: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  reviewing: 'bg-blue-100 text-blue-800',
  shortlisted: 'bg-green-100 text-green-800',
  accepted: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-rose-100 text-rose-800'
};

const MyApplications: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await applicationAPI.getMyApplications({
        limit: 20,
        status: statusFilter || undefined
      });
      setApplications(response.data.data.applications || []);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleWithdraw = async (id: string) => {
    const confirmed = window.confirm('Withdraw this application?');
    if (!confirmed) return;
    setWithdrawingId(id);
    try {
      await applicationAPI.deleteApplication(id);
      setApplications((prev) => prev.filter((app) => app._id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to withdraw application.');
    } finally {
      setWithdrawingId(null);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold">Job seeker</p>
            <h1 className="text-3xl font-bold text-gray-900 mt-1">My Applications</h1>
            <p className="text-gray-600 mt-2">Track statuses, revisit job details, or withdraw if needed.</p>
          </div>
          <Link
            to="/jobs"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-white text-gray-700 border border-gray-200 shadow-sm hover:bg-gray-50"
          >
            <Briefcase className="h-4 w-4 mr-2" />
            Browse jobs
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow border border-gray-100 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              Showing {applications.length} application{applications.length !== 1 && 's'}
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="reviewing">Reviewing</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="py-10 flex justify-center">
              <LoadingSpinner size="md" />
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-4">
              {error}
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-700 font-medium">No applications yet</p>
              <p className="text-sm text-gray-500 mt-1">Apply to roles and you will see them tracked here.</p>
              <Link
                to="/jobs"
                className="mt-4 inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Browse jobs
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((application) => {
                const statusBadge = statusStyles[application.status] || 'bg-gray-100 text-gray-800';
                return (
                  <div
                    key={application._id}
                    className="border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div>
                        <Link
                          to={`/jobs/${application.jobId?._id}`}
                          className="text-lg font-semibold text-gray-900 hover:text-blue-700 flex items-center gap-2"
                        >
                          {application.jobId?.title || 'Job unavailable'}
                          <Eye className="h-4 w-4 text-blue-500" />
                        </Link>
                        <p className="text-sm text-gray-600">{application.jobId?.company}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Applied {new Date(application.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadge}`}>
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </span>
                        <button
                          onClick={() => handleWithdraw(application._id)}
                          disabled={withdrawingId === application._id}
                          className="inline-flex items-center px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                        >
                          {withdrawingId === application._id ? 'Withdrawing...' : 'Withdraw'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyApplications;
