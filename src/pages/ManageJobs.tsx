import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { jobAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { Briefcase, Plus, Pencil, Trash2, MapPin, Clock, DollarSign, Building } from 'lucide-react';

type JobFormState = {
  title: string;
  company: string;
  location: string;
  jobType: string;
  experience: string;
  salaryMin: string;
  salaryMax: string;
  description: string;
  requirements: string;
  skills: string;
};

const defaultForm: JobFormState = {
  title: '',
  company: '',
  location: '',
  jobType: 'full-time',
  experience: 'entry',
  salaryMin: '',
  salaryMax: '',
  description: '',
  requirements: '',
  skills: ''
};

const ManageJobs: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [form, setForm] = useState<JobFormState>(defaultForm);

  const isEditing = useMemo(() => Boolean(editingJobId), [editingJobId]);

  const resetForm = () => {
    setForm({
      ...defaultForm,
      company: user?.company || ''
    });
    setEditingJobId(null);
  };

  const fetchJobs = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await jobAPI.getMyJobs({ limit: 20 });
      setJobs(response.data.data.jobs || []);
      setError('');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load your jobs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    resetForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
    if (message) setMessage('');
  };

  const buildJobPayload = () => {
    const salary: Record<string, number> = {};
    if (form.salaryMin) salary.min = Number(form.salaryMin);
    if (form.salaryMax) salary.max = Number(form.salaryMax);

    return {
      title: form.title,
      company: form.company || user?.company,
      location: form.location,
      jobType: form.jobType,
      experience: form.experience,
      description: form.description,
      salary: Object.keys(salary).length ? salary : undefined,
      requirements: form.requirements
        ? form.requirements.split(',').map((item) => item.trim()).filter(Boolean)
        : [],
      skills: form.skills
        ? form.skills.split(',').map((item) => item.trim()).filter(Boolean)
        : []
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const payload = buildJobPayload();
      if (isEditing && editingJobId) {
        await jobAPI.updateJob(editingJobId, payload);
        setMessage('Job updated successfully.');
      } else {
        await jobAPI.createJob(payload);
        setMessage('Job created successfully.');
      }
      resetForm();
      fetchJobs();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not save job. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (job: any) => {
    setEditingJobId(job._id);
    setForm({
      title: job.title || '',
      company: job.company || user?.company || '',
      location: job.location || '',
      jobType: job.jobType || 'full-time',
      experience: job.experience || 'entry',
      salaryMin: job.salary?.min ? String(job.salary.min) : '',
      salaryMax: job.salary?.max ? String(job.salary.max) : '',
      description: job.description || '',
      requirements: job.requirements?.join(', ') || '',
      skills: job.skills?.join(', ') || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Delete this job? All related applications will also be removed.');
    if (!confirmed) return;
    try {
      await jobAPI.deleteJob(id);
      setMessage('Job deleted.');
      fetchJobs();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to delete job.');
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold">Employer Workspace</p>
            <h1 className="text-3xl font-bold text-gray-900 mt-1">Manage Your Job Posts</h1>
            <p className="text-gray-600 mt-2">Create, edit, or retire openings to keep candidates up to date.</p>
          </div>
          <div className="hidden md:block">
            <Link
              to="/dashboard"
              className="inline-flex items-center px-4 py-2 rounded-lg bg-white text-gray-700 border border-gray-200 shadow-sm hover:bg-gray-50"
            >
              <Briefcase className="h-4 w-4 mr-2" />
              Back to dashboard
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow border border-gray-100">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500 font-semibold">{isEditing ? 'Update Job' : 'Post a Job'}</p>
                  <h2 className="text-xl font-semibold text-gray-900">{isEditing ? 'Edit job details' : 'Create a new opening'}</h2>
                </div>
              </div>
              {isEditing && (
                <button
                  onClick={resetForm}
                  className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  Cancel edit
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {error && (
                <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-3 text-sm">
                  {error}
                </div>
              )}
              {message && (
                <div className="bg-green-50 text-green-700 border border-green-200 rounded-lg p-3 text-sm">
                  {message}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job title</label>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Frontend Engineer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  <input
                    name="company"
                    value={form.company}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                    placeholder="Company name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                    placeholder="City, Province"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Job type</label>
                    <select
                      name="jobType"
                      value={form.jobType}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="contract">Contract</option>
                      <option value="internship">Internship</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                    <select
                      name="experience"
                      value={form.experience}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="entry">Entry</option>
                      <option value="mid">Mid</option>
                      <option value="senior">Senior</option>
                      <option value="executive">Executive</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Salary min (optional)</label>
                    <input
                      type="number"
                      name="salaryMin"
                      value={form.salaryMin}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                      placeholder="70000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Salary max (optional)</label>
                    <input
                      type="number"
                      name="salaryMax"
                      value={form.salaryMax}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                      placeholder="90000"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                  placeholder="Share responsibilities, impact, and what success looks like."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Requirements (comma separated)</label>
                  <input
                    name="requirements"
                    value={form.requirements}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                    placeholder="JavaScript, 2+ years experience"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma separated)</label>
                  <input
                    name="skills"
                    value={form.skills}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                    placeholder="React, Node, MongoDB"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium shadow hover:bg-blue-700 disabled:opacity-60"
                >
                  {saving ? <LoadingSpinner size="sm" /> : <Plus className="h-4 w-4 mr-2" />}
                  {isEditing ? 'Save changes' : 'Publish job'}
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-2xl shadow border border-gray-100">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center space-x-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase text-gray-500 font-semibold">Active roles</p>
                <h2 className="text-xl font-semibold text-gray-900">Your postings</h2>
              </div>
            </div>
            <div className="divide-y divide-gray-100 max-h-[75vh] overflow-y-auto">
              {loading ? (
                <div className="p-6 flex justify-center">
                  <LoadingSpinner size="md" />
                </div>
              ) : jobs.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <p className="font-medium">No jobs yet</p>
                  <p className="text-sm text-gray-400 mt-1">Publish your first role to start receiving applications.</p>
                </div>
              ) : (
                jobs.map((job) => (
                  <div key={job._id} className="p-5 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                        <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                          <Building className="h-4 w-4 text-gray-400" />
                          {job.company}
                        </p>
                        <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-600">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                            <MapPin className="h-4 w-4" />
                            {job.location}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-100">
                            <Clock className="h-4 w-4" />
                            {job.jobType.replace('-', ' ')}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                            <DollarSign className="h-4 w-4" />
                            {job.salary?.min ? `$${job.salary.min.toLocaleString()}` : 'Salary open'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Posted {new Date(job.createdAt).toLocaleDateString()} • {job.applicationCount || 0} applications
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(job)}
                          className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:text-blue-700 hover:border-blue-200"
                          aria-label="Edit job"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(job._id)}
                          className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:text-red-700 hover:border-red-200"
                          aria-label="Delete job"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageJobs;
