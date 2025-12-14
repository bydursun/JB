import React, { useState } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, Eye, EyeOff, Mail, Lock, Clipboard, ShieldCheck, CheckCircle2 } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<string>('');

  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(formData.email, formData.password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(label);
      setTimeout(() => setCopied(''), 2000);
    }).catch(() => {
      // Silently fail; could add error feedback if needed
    });
  };

  if (user) {
    return <Navigate to={from} replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 page-transition">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center">
            <LogIn className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Secure access to your dashboard with bank-level encryption.
          </p>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              to="/register"
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              create a new account
            </Link>
          </p>
          <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-gray-600">
            <ShieldCheck className="h-4 w-4 text-blue-600" />
            <span aria-live="polite">Secure login - Your data stays private</span>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4" role="alert" aria-live="assertive">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div className="space-y-4">
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
                  autoComplete="email"
                  required
                  className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 input-focus"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  aria-invalid={!!error}
                  aria-describedby="login-email-help"
                />
                
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="appearance-none relative block w-full pl-10 pr-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 input-focus"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  aria-invalid={!!error}
                  aria-describedby="login-password-help"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-lg p-3 grid grid-cols-2 gap-3 text-xs text-gray-600">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
              <span>Trusted by teams</span>
            </div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              <span>Privacy-first platform</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
              <span>Fast support</span>
            </div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              <span>Compliance-ready</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                to="/forgot-password"
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors underline"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors btn-animate"
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign in
                </>
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                Sign up here
              </Link>
            </p>
          </div>
        </form>

        {/* Demo credentials with copy buttons */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 mb-3 flex items-center justify-between">
            <span>Demo Credentials</span>
            {copied && (
              <span className="text-[10px] font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                {copied} copied
              </span>
            )}
          </h3>
          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <p className="font-semibold text-blue-800">Job Seeker</p>
              <div className="flex items-center justify-between bg-white rounded border border-blue-100 px-2 py-1">
                <span className="truncate">Email: <strong>jobseeker@demo.com</strong></span>
                <button
                  type="button"
                  onClick={() => handleCopy('jobseeker@demo.com', 'Job Seeker Email')}
                  className="ml-2 inline-flex items-center text-blue-600 hover:text-blue-800"
                  aria-label="Copy job seeker email"
                >
                  <Clipboard className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center justify-between bg-white rounded border border-blue-100 px-2 py-1">
                <span>Password: <strong>password123</strong></span>
                <button
                  type="button"
                  onClick={() => handleCopy('password123', 'Password')}
                  className="ml-2 inline-flex items-center text-blue-600 hover:text-blue-800"
                  aria-label="Copy demo password"
                >
                  <Clipboard className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="space-y-1 pt-2 border-t border-blue-100">
              <p className="font-semibold text-blue-800">Employer</p>
              <div className="flex items-center justify-between bg-white rounded border border-blue-100 px-2 py-1">
                <span className="truncate">Email: <strong>employer@demo.com</strong></span>
                <button
                  type="button"
                  onClick={() => handleCopy('employer@demo.com', 'Employer Email')}
                  className="ml-2 inline-flex items-center text-blue-600 hover:text-blue-800"
                  aria-label="Copy employer email"
                >
                  <Clipboard className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center justify-between bg-white rounded border border-blue-100 px-2 py-1">
                <span>Password: <strong>password123</strong></span>
                <button
                  type="button"
                  onClick={() => handleCopy('password123', 'Password')}
                  className="ml-2 inline-flex items-center text-blue-600 hover:text-blue-800"
                  aria-label="Copy demo password"
                >
                  <Clipboard className="h-4 w-4" />
                </button>
              </div>
            </div>
            <p className="text-[10px] text-blue-600 pt-1">Both accounts share the same demo password.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
