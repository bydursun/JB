import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Jobs = lazy(() => import('./pages/Jobs'));
const JobDetails = lazy(() => import('./pages/JobDetails'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const ManageJobs = lazy(() => import('./pages/ManageJobs'));
const MyApplications = lazy(() => import('./pages/MyApplications'));
const EmployerApplications = lazy(() => import('./pages/EmployerApplications'));
const Pricing = lazy(() => import('./pages/Pricing'));
const About = lazy(() => import('./pages/About'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const CookiePolicy = lazy(() => import('./pages/CookiePolicy'));
const EmployerDashboardOverview = lazy(() => import('./pages/EmployerDashboardOverview'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Chatbot = lazy(() => import('./components/Chatbot'));

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Navbar />
          <Suspense
            fallback={
              <div className="flex-grow flex items-center justify-center">
                <LoadingSpinner />
              </div>
            }
          >
            <main className="flex-grow page-transition">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/jobs" element={<Jobs />} />
                <Route path="/jobs/:id" element={<JobDetails />} />
                <Route path="/about" element={<About />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard/overview"
                  element={
                    <ProtectedRoute requiredRole="employer">
                      <EmployerDashboardOverview />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/employer/jobs"
                  element={
                    <ProtectedRoute requiredRole="employer">
                      <ManageJobs />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/applications"
                  element={
                    <ProtectedRoute requiredRole="jobseeker">
                      <MyApplications />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/applications/manage"
                  element={
                    <ProtectedRoute requiredRole="employer">
                      <EmployerApplications />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/cookies" element={<CookiePolicy />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
            <Chatbot />
          </Suspense>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
