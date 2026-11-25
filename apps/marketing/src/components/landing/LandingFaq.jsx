import { useState } from 'react';
import { ArrowRight, Minus, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const FAQS = [
  {
    q: 'Does WebPulse set cookies or store data in the visitor browser?',
    a: 'No. The browser script sets zero cookies and writes nothing to localStorage or sessionStorage on tracked websites. Note that our backend currently retains collected visitor IP strings in database records; review our Privacy Policy and Security disclosures for your jurisdiction.',
  },
  {
    q: 'Will the script slow down my website?',
    a: 'No. The served tracker is ~540 bytes gzipped (1.1 KB raw) and can load asynchronously with async or defer without blocking initial page render.',
  },
  {
    q: 'Does it work with React, Next.js, and other SPAs?',
    a: 'Yes. Load the tracker script in your application shell and trigger window.tracker("track", "page_view") inside your router effect whenever client routes change.',
  },
  {
    q: 'What happens if I go over my monthly event limit?',
    a: 'We notify you at 80% of your monthly allowance. At 100%, new tracked events are rejected until your quota resets on the 1st of the next calendar month or you upgrade; we never issue automatic overage bills.',
  },
  {
    q: 'Can I export data or audit the source code?',
    a: 'Yes. Paid plans include CSV activity log exports, read-only share links, and full Analytics API access on Pro and Max, and the source repository is public on GitHub.',
  },
];

export default function LandingFaq() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="py-20 sm:py-24 bg-[#050505]">
      <div className="mkt-container">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 className="mkt-h2">Common questions.</h2>
            <p className="mkt-lead mt-4 max-w-[40ch] text-[#B3B3AF]">
              Plain answers on cookies, collector weight, quotas, exports, and consoles.
            </p>
            <div className="mt-6 flex flex-wrap gap-5">
              <Link to="/help" className="mkt-link">
                Visit help center
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
              <Link to="/security" className="mkt-link">
                Security disclosures
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="space-y-3 lg:col-span-8">
            {FAQS.map((item, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div key={item.q} className="bg-[#0B0B0B] px-6">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                    className="flex w-full items-center justify-between gap-4 py-5 text-left transition-colors hover:text-[#FFFFFF]"
                  >
                    <span className="text-base font-medium text-[#F5F5F4]">
                      {item.q}
                    </span>
                    {isOpen ? (
                      <Minus className="h-4 w-4 shrink-0 text-[#FFFFFF]" aria-hidden="true" />
                    ) : (
                      <Plus className="h-4 w-4 shrink-0 text-[#969690]" aria-hidden="true" />
                    )}
                  </button>
                  {isOpen && (
                    <p className="max-w-[62ch] pb-5 pr-8 text-base leading-relaxed text-[#B3B3AF]">
                      {item.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
