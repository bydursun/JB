import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Building, DollarSign, Clock } from 'lucide-react';

interface JobCardProps {
  job: {
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
  };
}

const JobCard: React.FC<JobCardProps> = ({ job }) => {
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
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Posted today';
    if (diffDays <= 7) return `Posted ${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 border border-gray-100 hover:border-blue-300 transform hover:-translate-y-2 overflow-hidden">
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-transparent to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="flex flex-col h-full relative z-10">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <Link 
              to={`/jobs/${job._id}`}
              className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 group-hover:scale-105 inline-block transform transition-transform"
            >
              {job.title}
            </Link>
            <div className="flex items-center mt-3 text-gray-700">
              <div className="bg-blue-100 p-2 rounded-lg mr-2 group-hover:bg-blue-200 transition-colors">
                <Building className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-base font-semibold">{job.company}</span>
            </div>
          </div>
          <div className="ml-4">
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${
              job.jobType === 'full-time' ? 'bg-green-100 text-green-800' :
              job.jobType === 'part-time' ? 'bg-blue-100 text-blue-800' :
              job.jobType === 'contract' ? 'bg-purple-100 text-purple-800' :
              'bg-orange-100 text-orange-800'
            }`}>
              {formatJobType(job.jobType)}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">
          {job.description}
        </p>

        {/* Job Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-600 text-sm">
            <MapPin className="h-4 w-4 mr-2" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center text-gray-600 text-sm">
            <DollarSign className="h-4 w-4 mr-2" />
            <span>{formatSalary(job.salary)}</span>
          </div>
          <div className="flex items-center text-gray-600 text-sm">
            <Clock className="h-4 w-4 mr-2" />
            <span>{formatExperience(job.experience)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <div className="flex items-center text-gray-500 text-xs">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{formatDate(job.createdAt)}</span>
          </div>
          <Link 
            to={`/jobs/${job._id}`}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default JobCard;