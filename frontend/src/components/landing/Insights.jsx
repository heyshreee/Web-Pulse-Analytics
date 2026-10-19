import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import SectionHead from '../marketing/SectionHead';
import Reveal from '../marketing/Reveal';
import Illustration from '../marketing/Illustration';

/**
 * The metrics the dashboard derives from the stored events. Every point below
 * maps to something the product actually returns today (period comparison,
 * bounce rate, session duration, custom event counts, project filters) — the
 * illustration is labelled as sample data in its caption.
 */
const POINTS = [
  {
    title: 'Totals that come with a baseline',
    body: 'Visitors, page views, sessions and bounce rate are shown beside the same number from the previous period.',
  },
  {
    title: 'Bounce rate and session time',
    body: 'See how many sessions ended on the first page, and how long the rest lasted on average.',
  },
  {
    title: 'Custom events, counted',
    body: 'Clicks, signups, purchases — send your own events, then read how often each one fired and which sessions produced it.',
  },
  {
    title: 'One project at a time',
    body: 'The time range and project filters apply to every panel, so a single view always describes one website.',
  },
];

export default function Insights() {
  return (
    <section className="mkt-section" id="insights">
      <div className="mkt-container">
        <SectionHead
          eyebrow="Insights"
          title={
            <>
              Numbers only help once
              <br className="hidden sm:block" /> they have context.
            </>
          }
          description="WebPulse keeps the raw events and puts the derived numbers next to them, so you can tell whether something changed — or simply is what it always was."
        />

        <div className="mt-16 grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
          <Reveal>
            <ul className="space-y-7">
              {POINTS.map((p, i) => (
                <li key={p.title} className="flex gap-5">
                  <span className="metric-num mt-0.5 font-display text-sm font-bold text-violet-400">
                    {`0${i + 1}`}
                  </span>
                  <div>
                    <h3 className="mkt-h4">{p.title}</h3>
                    <p className="mkt-body mt-1.5 max-w-md">{p.body}</p>
                  </div>
                </li>
              ))}
            </ul>

            <Link to="/docs/api/analytics" className="mkt-btn mkt-btn-secondary mkt-btn-md mt-9">
              Metrics reference
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Reveal>

          <Reveal delay={80}>
            <Illustration
              name="insights-viz"
              alt="Four dashboard panels: visitors compared with the previous period, bounce rate, average session duration, and counts for the click, signup and purchase events"
              caption="Illustrative sample data — the dashboard shows these panels with your own events."
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
