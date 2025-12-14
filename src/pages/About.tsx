import { Briefcase, HeartHandshake, Sparkles, Users, CheckCircle2, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

const profiles = [
  {
    name: 'Abdullah Dursun',
    title: 'Full-Stack Developer & Employment Consultant',
    description:
      'Abdullah blends engineering rigor with hands-on coaching. He builds interview plans, runs mock technical screens, and turns complex projects into clear personal branding that hiring managers remember.',
    image:
      'https://media.licdn.com/dms/image/v2/D5603AQH9h2F8Z3lpwQ/profile-displayphoto-scale_200_200/B56ZhnQnEmHQAg-/0/1754079065933?e=1766620800&v=beta&t=NbspwE9dl4rIekmwOr8WYVyI9C-bORQ10Ode9Fq1Fb4',
    linkedin: 'https://www.linkedin.com/in/abdullahapodursun/',
    focus: ['Technical interviews', 'Networking systems', 'Personal branding'],
  },
  {
    name: 'Ebru Kara',
    title: 'Employment Consultant | Engineer (AI, Software, Electrical & Electronics)',
    description:
      'Ebru combines AI expertise with employment consulting to craft confident resumes, guide government and enterprise hiring journeys, and give seekers calm, clear steps toward their next role.',
    image:
      'https://media.licdn.com/dms/image/v2/D5603AQGjEZA3wZFP9w/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1715354169613?e=1766620800&v=beta&t=QtbZGujIG4liLNw24KLzWMemCk-UQw3iERR_Xzxrg_8',
    linkedin: 'https://www.linkedin.com/in/ebru-kara-/',
    focus: ['Resume & personal branding', 'AI-powered search', 'Employer outreach'],
  },
];
const About = () => {
  return (
    <div className="bg-gray-50 min-h-screen page-transition">
      {/* Background accents */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/10 blur-3xl" />
        <div className="absolute -right-16  top-32 h-80 w-80 rounded-full bg-gradient-to-br from-purple-500/15 to-blue-500/10 blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12">
        <header className="text-center space-y-5 animate-fade-in-up">
          <p className="inline-flex items-center px-4 py-2 rounded-full bg-white/70 border border-white/60 shadow-premium text-blue-700 text-sm font-semibold backdrop-blur">
            <Sparkles className="h-4 w-4 mr-2 text-blue-600" />
            Built by developers & consultants for faster hiring
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Trusted Career & Hiring Support <br />Powered by People and Technology
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
       We’re two professionals combining tech and career expertise to help you land the right job or the right hire with confidence, care, and one-on-one guidance.
          </p>
          <div className="flex justify-center gap-3">
            <Link
              to="/pricing"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-3 text-white font-semibold shadow-premium hover:shadow-premium-hover transition-all duration-200 btn-animate"
            >
              View pricing
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-full border border-white/70 bg-white/80 px-5 py-3 text-blue-700 font-semibold shadow-sm hover:shadow-md transition-all duration-200 backdrop-blur btn-animate"
            >
              Start today
            </Link>
          </div>
        </header>

        {/* Profile cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
          {profiles.map((profile, idx) => (
            <div
              key={profile.name}
              className="relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur shadow-premium border border-white/60 transition-all duration-200 hover:-translate-y-1 hover:shadow-premium-hover card-hover"
            >
              {/* Gradient top bar */}
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500" />

              <div className="p-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 blur-md" />
                    <img
                      src={profile.image}
                      alt={profile.name}
                      className="relative h-20 w-20 rounded-full object-cover border-2 border-white shadow-md"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm text-blue-600 font-semibold">
                      {idx === 0 ? <Briefcase className="h-4 w-4" /> : <HeartHandshake className="h-4 w-4 text-purple-600" />}
                      {idx === 0 ? 'Full-Stack & Coaching' : 'Consulting & Engineering'}
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">{profile.name}</h2>
                    <p className="text-gray-700">{profile.title}</p>
                  </div>
                </div>

                <p className="text-gray-600 leading-relaxed">{profile.description}</p>

                <div className="flex flex-wrap gap-2">
                  {profile.focus?.map((area) => (
                    <span
                      key={area}
                      className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100"
                    >
                      {area}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>Personalized guidance with premium response times</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>Built-in playbooks for interviews, offers, and onboarding</span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs uppercase tracking-wide text-gray-500">Available for select engagements</div>
                  <a
                    href={profile.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md btn-animate"
                  >
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </a>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Value props */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: <Sparkles className="h-5 w-5 text-purple-600" />,
              title: 'AI + Human precision',
              copy: 'Pairing automation with white-glove consulting to keep every interaction sharp and on-brand.',
            },
            {
              icon: <Users className="h-5 w-5 text-blue-600" />,
              title: 'For seekers & employers',
              copy: 'Resume polish, interview prep, candidate sourcing, and hiring incentives in one platform.',
            },
            {
              icon: <HeartHandshake className="h-5 w-5 text-green-600" />,
              title: 'Outcome obsessed',
              copy: 'Fast feedback loops, clear playbooks, and measurable progress until you land or hire.',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl bg-white/80 border border-white/60 backdrop-blur shadow-premium p-5 flex items-start gap-3 transition-all duration-200 hover:-translate-y-1 hover:shadow-premium-hover card-hover"
            >
              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-50 to-purple-50">
                {item.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.copy}</p>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

export default About;
