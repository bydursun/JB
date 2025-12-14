import { Briefcase, CheckCircle2, Sparkles, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const Pricing = () => {
  return (
    <div className="bg-gray-50 min-h-screen page-transition">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <div className="text-center space-y-4">
          <p className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
            <Sparkles className="h-4 w-4 mr-2" />
            Simple plans for seekers and employers
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Choose the plan that fits you</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Whether you&apos;re landing your dream role or hiring great talent, pick a plan that keeps you moving fast.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Job Seeker Plan */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-blue-600 font-semibold">Job seeker</p>
                <h2 className="text-2xl font-bold text-gray-900">Career Accelerator</h2>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
            <div className="flex items-baseline space-x-2 mb-6">
              <span className="text-4xl font-bold text-gray-900">$30</span>
              <span className="text-gray-500 text-sm">per month</span>
            </div>
            <ul className="space-y-3 flex-1">
              {[
                'Real human coach + AI guidance to tailor your search',
                'Resume, portfolio, and LinkedIn review with fast feedback',
                'Mock interviews and salary negotiation prompts',
                'Curated roles matched to your skills and preferences',
                'Weekly progress check-ins to keep you on track',
              ].map((item) => (
                <li key={item} className="flex items-start space-x-3 text-gray-700">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/register"
              className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-white font-semibold hover:bg-blue-700 transition-colors"
            >
              Get your dream job faster
            </Link>
          </div>

          {/* Employer Plan */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-green-600 font-semibold">Employer</p>
                <h2 className="text-2xl font-bold text-gray-900">Hiring Essentials</h2>
              </div>
              <Briefcase className="h-8 w-8 text-green-500" />
            </div>
            <div className="flex items-baseline space-x-2 mb-6">
              <span className="text-4xl font-bold text-gray-900">Free</span>
              <span className="text-gray-500 text-sm">forever</span>
            </div>
            <ul className="space-y-3 flex-1">
              {[
                'Unlimited job posts with hiring incentives to boost visibility',
                'Candidate search with filters for skills, location, and experience',
                'Built-in interview scheduling and reminders',
                'Team collaboration on shortlists and feedback',
                'Smart recommendations powered by AI matching',
              ].map((item) => (
                <li key={item} className="flex items-start space-x-3 text-gray-700">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/register"
              className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-green-600 px-4 py-3 text-white font-semibold hover:bg-green-700 transition-colors"
            >
              Start hiring today
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
