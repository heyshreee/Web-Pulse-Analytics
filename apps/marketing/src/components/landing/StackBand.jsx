import Reveal from '../marketing/Reveal';

const CHIPS = [
  'JavaScript',
  'React',
  'REST API',
  'Custom events',
  'Page views',
];

/**
 * Honest replacement for the previous customer-logo strip: it describes what
 * the tracker actually supports today instead of implying integrations that do
 * not exist.
 */
export default function StackBand() {
  return (
    <section className="border-y border-white/[0.06] bg-white/[0.012]">
      <div className="mkt-container py-10">
        <Reveal className="flex flex-col items-center gap-6 lg:flex-row lg:justify-between">
          <p className="max-w-lg text-center text-sm text-slate-400 lg:text-left">
            <span className="font-semibold text-slate-200">Your stack. Your data. One small tracker.</span>{' '}
            Add WebPulse to your existing site and start sending page views and custom events —
            no heavy analytics SDK, no build step.
          </p>
          <ul className="flex flex-wrap items-center justify-center gap-2">
            {CHIPS.map((chip) => (
              <li key={chip} className="mkt-chip !text-[11px]">
                {chip}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
