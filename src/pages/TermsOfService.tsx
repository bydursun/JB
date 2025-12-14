import { Link } from 'react-router-dom';
import { Scale, ShieldCheck, AlertTriangle } from 'lucide-react';

const sections = [
  {
    title: 'User responsibilities',
    content:
      'Use truthful, professional profiles, respect other users, and avoid spam or abusive behavior. You are responsible for the content you submit.',
  },
  {
    title: 'Our responsibilities',
    content:
      'We work to keep the platform available, moderated, and reliable. Some downtime or maintenance may occur, and we will aim to communicate major disruptions.',
  },
  {
    title: 'Account security',
    content:
      'Keep your login credentials confidential. Notify us immediately if you suspect unauthorized access so we can help secure your account.',
  },
  {
    title: 'Suspension and termination',
    content:
      'We may suspend or terminate accounts that violate these terms, applicable laws, or put the community at risk.',
  },
  {
    title: 'Changes to these terms',
    content:
      'We may update these terms and will post changes here. Continued use of the platform means you accept the updated terms.',
  },
];

const TermsOfService = () => {
  return (
    <div className="bg-gray-50 min-h-screen page-transition">
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10">
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute -left-16 -top-16 h-60 w-60 rounded-full bg-gradient-to-br from-blue-500/15 to-purple-500/10 blur-3xl" />
          <div className="absolute right-0 top-10 h-56 w-56 rounded-full bg-gradient-to-br from-purple-500/15 to-blue-500/10 blur-3xl" />
        </div>

        <header className="space-y-3 text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/80 border border-white/60 shadow-sm backdrop-blur">
            <Scale className="h-4 w-4 text-blue-600 mr-2" />
            <span className="text-sm font-semibold text-blue-700">Clear expectations for everyone</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Terms of Service</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Please review these terms before using the platform. They help keep JobPortal safe, professional, and reliable.
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
            <p className="text-sm uppercase tracking-wide text-white/80">Questions about these terms?</p>
            <p className="text-lg font-semibold">Contact support@jobportal.com</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <ShieldCheck className="h-5 w-5" />
            <span>We aim for transparent, fair enforcement</span>
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

export default TermsOfService;
