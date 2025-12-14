import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { applicationAPI, jobAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { Plus, Briefcase, FileText, Users, TrendingUp, Eye, CreditCard as Edit, CheckCircle, Clock } from 'lucide-react';

type DashboardStats = {
  totalJobs: number;
  totalApplications: number;
  pendingApplications: number;
  acceptedApplications: number;
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalJobs: 0,
    totalApplications: 0,
    pendingApplications: 0,
    acceptedApplications: 0,
  });
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        if (user.role === 'employer') {
          const res = await jobAPI.getMyJobs({ limit: 5 });
          const jobs = res.data?.data?.jobs || [];
          setRecentJobs(jobs);
          setStats((prev) => ({
            ...prev,
            totalJobs: res.data?.pagination?.totalJobs ?? jobs.length,
            totalApplications: jobs.reduce((sum: number, j: any) => sum + (j.applicationCount || 0), 0),
            pendingApplications: 0,
            acceptedApplications: 0,
          }));
        } else {
          const res = await applicationAPI.getMyApplications({ limit: 5 });
          const applications = res.data?.data?.applications || [];
          setRecentApplications(applications);
          const pending = applications.filter((a: any) => a.status === 'pending').length;
          const accepted = applications.filter((a: any) => a.status === 'accepted').length;
          setStats({
            totalJobs: 0,
            totalApplications: res.data?.pagination?.totalApplications ?? applications.length,
            pendingApplications: pending,
            acceptedApplications: accepted,
          });
        }
        setError('');
      } catch (err: any) {
        console.error('Dashboard load error', err?.response?.data || err);
        setError('Unable to load dashboard data. Please refresh or re-login.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const totalEmployerApplications = useMemo(() => {
    if (user?.role !== 'employer') return 0;
    return stats.totalApplications;
  }, [stats.totalApplications, user?.role]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" id="overview">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.name}!</h1>
          <p className="text-gray-600 mt-2">
            {user.role === 'employer'
              ? 'Manage your job postings and track applications'
              : 'Track your applications and discover new opportunities'}
          </p>
          {error && (
            <div className="mt-3 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
              {error}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {user.role === 'employer' ? (
            <>
              <StatCard label="Total Jobs" value={stats.totalJobs} icon={<Briefcase className="h-8 w-8 text-blue-500" />} />
              <StatCard label="Applications" value={totalEmployerApplications} icon={<Users className="h-8 w-8 text-green-500" />} />
              <StatCard label="Active Jobs" value={stats.totalJobs} icon={<TrendingUp className="h-8 w-8 text-purple-500" />} />
              <StatCard label="Views" value="-" icon={<FileText className="h-8 w-8 text-orange-500" />} />
            </>
          ) : (
            <>
              <StatCard label="Applications" value={stats.totalApplications} icon={<FileText className="h-8 w-8 text-blue-500" />} />
              <StatCard label="Pending" value={stats.pendingApplications} icon={<Clock className="h-8 w-8 text-yellow-500" />} />
              <StatCard label="Accepted" value={stats.acceptedApplications} icon={<CheckCircle className="h-8 w-8 text-green-500" />} />
              <StatCard
                label="Success Rate"
                value={
                  stats.totalApplications
                    ? `${Math.round((stats.acceptedApplications / stats.totalApplications) * 100)}%`
                    : '0%'
                }
                icon={<TrendingUp className="h-8 w-8 text-purple-500" />}
              />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  {user.role === 'employer' ? 'Recent Job Postings' : 'Recent Applications'}
                </h2>
              </div>
              <div className="p-6">
                {user.role === 'employer' ? (
                  <EmployerRecentJobs jobs={recentJobs} />
                ) : (
                  <SeekerRecentApplications applications={recentApplications} />
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <QuickActions role={user.role} />
            <ProfileStatus role={user.role} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

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

const EmployerRecentJobs = ({ jobs }: { jobs: any[] }) => {
  if (!jobs.length) {
    return (
      <div className="text-center py-8">
        <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No job postings yet</p>
        <Link to="/employer/jobs" className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Post Your First Job
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <div key={job._id} className="border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{job.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{job.company}</p>
              <p className="text-xs text-gray-500 mt-2">
                Posted {new Date(job.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex space-x-2">
              <Link to={`/jobs/${job._id}`} className="p-2 text-gray-400 hover:text-blue-600 transition-colors" title="View job">
                <Eye className="h-4 w-4" />
              </Link>
              <Link to="/employer/jobs" className="p-2 text-gray-400 hover:text-green-600 transition-colors" title="Edit job">
                <Edit className="h-4 w-4" />
              </Link>
              <Link to="/applications/manage" className="p-2 text-gray-400 hover:text-purple-600 transition-colors" title="View applications">
                <Users className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const SeekerRecentApplications = ({ applications }: { applications: any[] }) => {
  if (!applications.length) {
    return (
      <div className="text-center py-8">
        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No applications yet</p>
        <Link
          to="/jobs"
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-block"
        >
          Browse Jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {applications.map((application) => (
        <div key={application._id} className="border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">
                {application.jobId?.title || 'Job Title'}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {application.jobId?.company || 'Company'}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Applied {new Date(application.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center">
              <StatusBadge status={application.status} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const variants: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    reviewing: 'bg-blue-100 text-blue-800',
    shortlisted: 'bg-green-100 text-green-800',
    accepted: 'bg-green-100 text-green-900',
    rejected: 'bg-red-100 text-red-800',
  };
  const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Pending';
  const className = variants[status] || 'bg-gray-100 text-gray-800';
  return <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${className}`}>{label}</span>;
};

const QuickActions = ({ role }: { role: 'employer' | 'jobseeker' }) => (
  <div className="bg-white rounded-lg shadow">
    <div className="px-6 py-4 border-b border-gray-200">
      <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
    </div>
    <div className="p-6 space-y-4">
      {role === 'employer' ? (
        <>
          <Link to="/employer/jobs" className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
            <Plus className="h-4 w-4 mr-2" />
            Post or edit jobs
          </Link>
          <Link to="/applications/manage" className="w-full border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center">
            <Users className="h-4 w-4 mr-2" />
            View applications
          </Link>
          <Link to="/dashboard/overview" className="w-full border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            Dashboard overview
          </Link>
        </>
      ) : (
        <>
          <Link
            to="/jobs"
            className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <Briefcase className="h-4 w-4 mr-2" />
            Browse Jobs
          </Link>
          <Link
            to="/profile"
            className="w-full border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
          >
            <FileText className="h-4 w-4 mr-2" />
            Update Resume
          </Link>
          <Link
            to="/applications"
            className="w-full border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            View applications
          </Link>
        </>
      )}
    </div>
  </div>
);

const ProfileStatus = ({ role }: { role: 'employer' | 'jobseeker' }) => (
  <div className="bg-white rounded-lg shadow">
    <div className="px-6 py-4 border-b border-gray-200">
      <h2 className="text-lg font-medium text-gray-900">Profile Status</h2>
    </div>
    <div className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Profile Completion</span>
          <span className="text-sm font-medium text-gray-900">75%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
        </div>
        <div className="text-xs text-gray-500 space-y-1">
          <p className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-green-500" /> Basic information</p>
          <p className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-green-500" /> Contact details</p>
          {role === 'jobseeker' ? (
            <>
              <p className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-green-500" /> Resume / portfolio</p>
              <p className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-green-500" /> Skills & experience</p>
            </>
          ) : (
            <>
              <p className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-green-500" /> Company information</p>
              <p className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-green-500" /> Company description</p>
            </>
          )}
        </div>
        <Link
          to="/profile"
          className="block text-center bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm"
        >
          Complete Profile
        </Link>
      </div>
    </div>
  </div>
);
