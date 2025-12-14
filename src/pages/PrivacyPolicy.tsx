import { Link } from 'react-router-dom';
import { Shield, Mail, CheckCircle2 } from 'lucide-react';

const sections = [
  {
    title: 'Data we collect',
    content:
      'We collect information you provide directly, like your name, email, profile details, resumes, job preferences, and login credentials. We also receive device and usage data to keep your account secure.',
  },
  {
    title: 'How we use your data',
    content:
      'To create and manage your account, personalize job recommendations, send notifications you opt into, and improve the product through analytics. We never sell your data.',
  },
  {
    title: 'Who we share it with',
    content:
      'Only trusted service providers that help us run the platform (hosting, analytics, communication). They must follow strict confidentiality and security requirements.',
  },
  {
    title: 'Your rights',
    content:
      'You can access, edit, or delete your information and update preferences at any time. Contact us if you need help or want to export your data.',
  },
  {
    title: 'Security and retention',
    content:
      'We use encryption in transit, role-based access, and regular reviews to protect your data. We keep data only as long as needed for the purposes above or to meet legal obligations.',
  },
];

const PrivacyPolicy = () => {
  return (
    <div className="bg-gray-50 min-h-screen page-transition">
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10">
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-blue-500/15 to-purple-500/10 blur-3xl" />
          <div className="absolute -right-24 top-10 h-64 w-64 rounded-full bg-gradient-to-br from-purple-500/15 to-blue-500/10 blur-3xl" />
        </div>

        <header className="space-y-3 text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/80 border border-white/60 shadow-sm backdrop-blur">
            <Shield className="h-4 w-4 text-blue-600 mr-2" />
            <span className="text-sm font-semibold text-blue-700">Privacy-first by design</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Privacy Policy</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We protect your data so you can focus on your next role or next hire. This summary is written in plain English for clarity.
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
            <p className="text-sm uppercase tracking-wide text-white/80">Need something changed?</p>
            <p className="text-lg font-semibold">Email us at support@jobportal.com</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-5 w-5" />
            <span>We respond quickly and honor your requests</span>
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

export default PrivacyPolicy;
