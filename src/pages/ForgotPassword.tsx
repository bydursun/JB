import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ShieldCheck, ArrowLeft } from 'lucide-react';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setMessage('If an account exists for this email, we just sent a password reset link.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 page-transition">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center">
            <Mail className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter the email associated with your account and we’ll send reset instructions.
          </p>
          <div className="mt-3 flex items-center justify-center space-x-2 text-sm text-gray-600">
            <ShieldCheck className="h-4 w-4 text-blue-600" />
            <span>Secure reset • We never share your email</span>
          </div>
        </div>

        <form className="mt-8 space-y-6 bg-white border border-gray-200 rounded-lg p-6 shadow-sm" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 input-focus"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (message) setMessage('');
                }}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors btn-animate"
            >
              Send reset link
            </button>
          </div>

          {submitted && (
            <p className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-md px-3 py-2">
              {message}
            </p>
          )}
        </form>

        <div className="text-center">
          <Link
            to="/login"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
