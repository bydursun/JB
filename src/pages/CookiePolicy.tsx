import { Link } from 'react-router-dom';
import { Cookie, BarChart3, SlidersHorizontal } from 'lucide-react';

const sections = [
  {
    title: 'Types of cookies we use',
    content:
      'Session cookies to keep you logged in securely, preference cookies to remember settings, and analytics cookies to understand how people use the site.',
  },
  {
    title: 'Why we use cookies',
    content:
      'To save your login state, keep the experience personalized, measure traffic, and improve performance and reliability.',
  },
  {
    title: 'Third-party cookies',
    content:
      'Trusted partners like analytics providers (e.g., Google Analytics) may set cookies to measure usage and detect issues. We do not allow advertising cookies.',
  },
  {
    title: 'How to opt out or manage cookies',
    content:
      'You can adjust your browser settings to block or delete cookies. Some features may not work without cookies, but you will always be able to access essential pages.',
  },
];

const CookiePolicy = () => {
  return (
    <div className="bg-gray-50 min-h-screen page-transition">
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10">
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute -left-16 -top-20 h-60 w-60 rounded-full bg-gradient-to-br from-blue-500/15 to-purple-500/10 blur-3xl" />
          <div className="absolute right-0 top-14 h-60 w-60 rounded-full bg-gradient-to-br from-purple-500/15 to-blue-500/10 blur-3xl" />
        </div>

        <header className="space-y-3 text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/80 border border-white/60 shadow-sm backdrop-blur">
            <Cookie className="h-4 w-4 text-blue-600 mr-2" />
            <span className="text-sm font-semibold text-blue-700">Balanced privacy and performance</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Cookie Policy</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Learn how we use cookies to keep your experience secure, personal, and reliable.
          </p>
        </header>

        <div className="space-y-6">
          {sections.map((section) => (
            <div
              key={section.title}
              className="rounded-2xl bg-white/90 backdrop-blur border border-white/70 shadow-premium p-6 card-hover"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{section.title}</h2>
              <p className="text-gray-700 leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 shadow-premium">
          <div className="space-y-1">
            <p className="text-sm uppercase tracking-wide text-white/80">Need adjustments?</p>
            <p className="text-lg font-semibold">We respect your choices and privacy</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <SlidersHorizontal className="h-5 w-5" />
            <span>Control cookies in your browser settings</span>
          </div>
        </div>

        <div className="flex justify-center">
          <Link
            to="/"
            className="text-blue-700 font-semibold hover:text-blue-800 transition-colors underline decoration-2 decoration-blue-200 underline-offset-4 link-underline"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;
