import React, { useState, useEffect } from 'react';
import { jobAPI } from '../services/api';
import JobCard from '../components/JobCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Search, Filter, MapPin, Briefcase, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

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
  createdAt: string;
  createdBy: {
    name: string;
    company: string;
  };
}

interface Filters {
  search: string;
  location: string;
  jobType: string;
  experience: string;
}

const Jobs: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<Filters>({
    search: '',
    location: '',
    jobType: '',
    experience: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalJobs: 0,
    hasNext: false,
    hasPrev: false
  });
  const [showFilters, setShowFilters] = useState(false);

  const fetchJobs = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 12,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value.trim() !== '')
        )
      };

      const response = await jobAPI.getJobs(params);
      setJobs(response.data.data.jobs);
      setPagination(response.data.pagination);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch jobs');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs(1);
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs(1);
  };

  const handlePageChange = (page: number) => {
    fetchJobs(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      location: '',
      jobType: '',
      experience: ''
    });
    setTimeout(() => fetchJobs(1), 0);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Find Your Perfect Job
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover opportunities from top companies and take the next step in your career.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Main Search Bar */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    name="search"
                    placeholder="Search jobs, companies, or keywords..."
                    value={filters.search}
                    onChange={handleFilterChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                >
                  <Filter className="h-5 w-5 mr-2" />
                  Filters
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Search className="h-5 w-5 mr-2" />
                  Search
                </button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="inline h-4 w-4 mr-1" />
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    placeholder="City, Province"
                    value={filters.location}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Briefcase className="inline h-4 w-4 mr-1" />
                    Job Type
                  </label>
                  <select
                    name="jobType"
                    value={filters.jobType}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Types</option>
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="inline h-4 w-4 mr-1" />
                    Experience
                  </label>
                  <select
                    name="experience"
                    value={filters.experience}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Levels</option>
                    <option value="entry">Entry Level</option>
                    <option value="mid">Mid Level</option>
                    <option value="senior">Senior Level</option>
                    <option value="executive">Executive</option>
                  </select>
                </div>
              </div>
            )}

            {(filters.search || filters.location || filters.jobType || filters.experience) && (
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <span className="text-sm text-gray-600">
                  {pagination.totalJobs} jobs found
                </span>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-700 underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
              <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Jobs</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => fetchJobs(pagination.currentPage)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-lg p-8 max-w-md mx-auto">
              <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Jobs Found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search criteria or check back later for new opportunities.
              </p>
              <button
                onClick={clearFilters}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                View All Jobs
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Job Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {jobs.map((job) => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrev}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </button>

                <div className="flex items-center space-x-2">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      const current = pagination.currentPage;
                      return page === 1 || page === pagination.totalPages || (page >= current - 1 && page <= current + 1);
                    })
                    .map((page, index, array) => (
                      <React.Fragment key={page}>
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className="px-2 text-gray-500">...</span>
                        )}
                        <button
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 rounded-lg transition-colors ${
                            page === pagination.currentPage
                              ? 'bg-blue-600 text-white'
                              : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    ))}
                </div>

                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNext}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Jobs;