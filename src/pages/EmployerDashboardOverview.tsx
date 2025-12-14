import React, { useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Briefcase, Users, TrendingUp, FileText, ArrowLeft, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { jobAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

type JobSummary = {
  _id: string;
  title: string;
  company: string;
  createdAt: string;
  applicationCount?: number;
};

const EmployerDashboardOverview: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!user || user.role !== 'employer') return;
      try {
        const res = await jobAPI.getMyJobs({ limit: 10 });
        setJobs(res.data?.data?.jobs || []);
        setError('');
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Unable to load overview.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const stats = useMemo(() => {
    const totalJobs = jobs.length;
    const totalApplications = jobs.reduce((sum, job) => sum + (job.applicationCount || 0), 0);
    const avgApplications = totalJobs ? Math.round(totalApplications / totalJobs) : 0;
    return { totalJobs, totalApplications, avgApplications };
  }, [jobs]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (user.role !== 'employer') {
    return <Navigate to="/dashboard" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1 flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4 text-gray-400" />
              <Link to="/dashboard" className="text-gray-600 hover:text-blue-600">
                Back to dashboard
              </Link>
            </p>
            <h1 className="text-3xl font-bold text-gray-900">Employer Overview</h1>
            <p className="text-gray-600 mt-1">High-level view of your postings and engagement.</p>
          </div>
          <Link
            to="/employer/jobs"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white shadow hover:bg-blue-700 transition-colors"
          >
            <Briefcase className="h-4 w-4 mr-2" />
            Manage jobs
          </Link>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard label="Active jobs" value={stats.totalJobs} icon={<Briefcase className="h-8 w-8 text-blue-500" />} />
          <StatCard
            label="Total applications"
            value={stats.totalApplications}
            icon={<Users className="h-8 w-8 text-green-500" />}
          />
          <StatCard
            label="Avg. applications per job"
            value={stats.avgApplications}
            icon={<TrendingUp className="h-8 w-8 text-purple-500" />}
          />
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-medium text-gray-900">Recent postings</h2>
            </div>
            <Link to="/employer/jobs" className="text-sm text-blue-600 hover:text-blue-700">
              View all
            </Link>
          </div>
          <div className="p-6">
            {!jobs.length ? (
              <div className="text-center py-8">
                <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No job postings yet</p>
                <p className="text-sm text-gray-400">Create a role to start attracting candidates.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <div key={job._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{job.title}</h3>
                        <p className="text-sm text-gray-600">{job.company}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Posted {new Date(job.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-700 font-semibold">
                          {job.applicationCount || 0} applications
                        </p>
                        <Link to={`/jobs/${job._id}`} className="text-sm text-blue-600 hover:text-blue-700 inline-flex items-center mt-1">
                          <Clock className="h-4 w-4 mr-1" />
                          View details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerDashboardOverview;

const StatCard = ({ label, value, icon }: { label: string; value: number | string; icon: React.ReactNode }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center">
      {icon}
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-600">{label}</p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);
