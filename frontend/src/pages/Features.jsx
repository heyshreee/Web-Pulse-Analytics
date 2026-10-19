import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Activity,
  Gauge,
  Globe,
  LayoutDashboard,
  Bell,
  History,
  FileDown,
  Braces,
  Bug,
} from 'lucide-react';
import MarketingShell from '../components/marketing/MarketingShell';
import SectionHead from '../components/marketing/SectionHead';
import Reveal from '../components/marketing/Reveal';

const hero = {
  icon: Activity,
  eyebrow: 'Real-time monitoring',
  title: "See what's happening as it happens.",
};

const features = [
  {
    icon: Gauge,
    title: 'Performance Analytics',
    headline: 'Understand how your website performs.',
    description:
      'Track performance signals such as page load times, response times, and other application performance metrics so you can identify where your experience needs improvement.',
  },
  {
    icon: Globe,
    title: 'Traffic & Visitor Analytics',
    headline: 'Know where your visitors come from.',
    description:
      'Understand visitor patterns, traffic sources, sessions, unique visitors, and user journeys. See how people reach your application and how they move through it.',
  },
  {
    icon: LayoutDashboard,
    title: 'Custom Dashboards',
    headline: 'Build a view around the metrics that matter.',
    description:
      'Create personalized dashboard views around the metrics you care about — from traffic and active users to performance measurements.',
  },
  {
    icon: Bell,
    title: 'Alerts & Notifications',
    headline: 'Know when something needs attention.',
    description:
      "Configure monitoring and notification workflows for important analytics or performance conditions so you don't have to constantly watch the dashboard.",
  },
  {
    icon: History,
    title: 'Historical Analytics',
    headline: "Don't just see today. Understand the trend.",
    description:
      'Store historical analytics and compare your data over time to identify changes in traffic, performance, and user behavior.',
  },
  {
    icon: FileDown,
    title: 'Reports & Data Export',
    headline: 'Take your analytics with you.',
    description:
      'Generate analytics reports and export your data for further analysis, reporting, or sharing.',
  },
  {
    icon: Braces,
    title: 'REST API',
    headline: 'Connect WebPulse to your own stack.',
    description:
      'Use the WebPulse REST API to integrate analytics data with your existing applications, internal tools, and workflows.',
  },
  {
    icon: Bug,
    title: 'User & Error Tracking',
    headline: 'Understand both users and failures.',
    description:
      'Track unique visitors, sessions, and user journeys while capturing application errors and exceptions that can affect the experience.',
  },
];

export default function Features() {
  return (
    <MarketingShell>
      <section className="mkt-section">
        <div className="mkt-container">
          <SectionHead
            eyebrow="Features"
            title={
              <>
                Real-time <span className="mkt-accent-text">analytics</span> for your entire web
                product
              </>
            }
            description="Understand what your visitors are doing, where your traffic comes from, how your application performs, and what changes over time — from one analytics platform."
          />

          {/* Lead capability panel */}
          <Reveal className="mx-auto mt-16 max-w-4xl">
            <div className="mkt-panel p-7 sm:p-9">
              <div className="md:flex md:items-center md:gap-8">
                <div className="mb-5 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 md:mb-0">
                  <hero.icon className="h-7 w-7 text-violet-300" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <p className="mkt-eyebrow mb-2">{hero.eyebrow}</p>
                  <h3 className="mkt-h3 !text-xl sm:!text-2xl">{hero.title}</h3>
                  <p className="mkt-body mt-2">
                    Monitor website activity and user behavior in real time. Track incoming
                    activity and keep your analytics view close to what's happening on your
                    application.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Feature matrix */}
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <Reveal key={feature.title} delay={(i % 3) * 70}>
                <article className="mkt-card mkt-card-hover h-full p-6">
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10">
                    <feature.icon className="h-5 w-5 text-violet-300" aria-hidden="true" />
                  </div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-300/90">
                    {feature.title}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold tracking-tight text-slate-100">
                    {feature.headline}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">
                    {feature.description}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>

          {/* Closing CTA */}
          <Reveal className="mt-16">
            <div className="mkt-panel relative overflow-hidden px-6 py-12 text-center sm:px-12">
              <div
                aria-hidden="true"
                className="mkt-glow left-1/2 top-[-160px] h-[320px] w-[560px] max-w-[110vw] -translate-x-1/2 bg-violet-600/20"
              />
              <div className="relative">
                <h2 className="mkt-h3 !text-2xl sm:!text-3xl">
                  See what's happening on your website.
                </h2>
                <p className="mkt-body mx-auto mt-3 max-w-xl">
                  Start tracking your first project with WebPulse.
                </p>
                <Link to="/register" className="mkt-btn mkt-btn-primary mkt-btn-lg mt-7">
                  Start tracking
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </MarketingShell>
  );
}
