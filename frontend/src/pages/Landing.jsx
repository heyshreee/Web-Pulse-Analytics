import React, { useEffect, useMemo, useRef, useState, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowDown,
  ArrowRight,
  BarChart2,
  Check,
  ChevronRight,
  Menu,
  X,
  ShieldCheck,
  Lock,
  KeyRound,
  Users,
  Activity,
  Fingerprint,
  Trash2,
} from 'lucide-react';
import AnimatedNumber from '../components/landing/AnimatedNumber';
import ChartPreview from '../components/landing/ChartPreview';

// Heavy, non-critical visuals are loaded lazily so the hero HTML/LCP is painted
// before the three.js globe and live stream are fetched. Recharts is not used on
// the landing page at all — the decorative chart is a lightweight SVG preview.
const HeroGlobe = lazy(() => import('../components/landing/HeroGlobe'));
const LiveEventStream = lazy(() => import('../components/landing/LiveEventStream'));

gsap.registerPlugin(ScrollTrigger);

const REDUCED_MOTION =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const REPO_URL = 'https://github.com/heyshreee/Web-Pulse-Analytics';

// A fixed set of "live" city nodes so the hero globe always has traffic, even
// without a connected backend. Pure marketing illustration.
const HERO_CITIES = [
  { lat: 40.7128, lng: -74.006, name: 'New York', count: 4218 },
  { lat: 28.6139, lng: 77.209, name: 'New Delhi', count: 2943 },
  { lat: 52.52, lng: 13.405, name: 'Berlin', count: 1201 },
  { lat: 51.5072, lng: -0.1276, name: 'London', count: 984 },
  { lat: 35.6762, lng: 139.6503, name: 'Tokyo', count: 762 },
  { lat: 48.8566, lng: 2.3522, name: 'Paris', count: 689 },
  { lat: 37.7749, lng: -122.4194, name: 'San Francisco', count: 812 },
  { lat: -33.8688, lng: 151.2093, name: 'Sydney', count: 514 },
  { lat: 19.076, lng: 72.8777, name: 'Mumbai', count: 2310 },
  { lat: -23.5505, lng: -46.6333, name: 'São Paulo', count: 1210 },
];

const TOP_LOCATIONS = [
  { label: 'United States', value: '4,218', pct: 33, color: '#8B5CF6' },
  { label: 'India', value: '2,943', pct: 23, color: '#A78BFA' },
  { label: 'Germany', value: '1,201', pct: 9, color: '#48E6A1' },
  { label: 'United Kingdom', value: '984', pct: 7, color: '#8B5CF6' },
  { label: 'Japan', value: '762', pct: 6, color: '#A78BFA' },
];

const FEATURE_SECTIONS = [
  {
    index: '01',
    title: 'Know who\'s visiting.',
    sub: 'Live visitor intelligence',
    body: 'Every active visitor with country, device, and current page — streamed the moment they arrive. No delayed reports, no sampling.',
    visual: 'geo',
  },
  {
    index: '02',
    title: 'See what they do.',
    sub: 'Real-time behavior',
    body: 'Watch visitors move through landing, features, pricing, and checkout. Understand the exact path to conversion.',
    visual: 'flow',
  },
  {
    index: '03',
    title: 'Find where they came from.',
    sub: 'Traffic acquisition',
    body: 'See which channels actually bring visitors — search, direct, social, or referral — and double down on what works.',
    visual: 'acq',
  },
  {
    index: '04',
    title: 'Turn traffic into intelligence.',
    sub: 'From signals to decisions',
    body: 'Visitors become events. Events become patterns. Patterns become insight. Insight becomes confident decisions.',
    visual: 'pipeline',
  },
];

const TRACKING_STEPS = [
  { n: '01', title: 'Create project', desc: 'Add a new project and get a unique tracking ID.' },
  { n: '02', title: 'Add tracking script', desc: 'Paste a single script into your site. No build step needed.' },
  { n: '03', title: 'Watch traffic arrive', desc: 'Events stream to your dashboard in real time.' },
];

const INTEGRATIONS = [
  'JavaScript', 'React', 'Node.js', 'REST API', 'Custom events', 'Page-view tracking',
];

const STATIC_COUNTS = 12842;
const STATIC_VIEWS = 84392;
const STATIC_COUNTRIES = 142;
const STATIC_BOUNCE = 31.8;
const STATIC_SESSION = '04:21';

const TRAFFIC_RANGES = ['24h', '7d', '30d'];

// Deterministic pseudo-live traffic series for the dashboard mockup. Pure
// marketing illustration — no backend involved, so never flickers on re-render.
function makeTrafficData(range) {
  const isHours = range === '24h';
  const count = isHours ? 24 : range === '7d' ? 7 : 30;
  const step = isHours ? 3600000 : 86400000;
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(now - (count - 1 - i) * step);
    const t = i / (count - 1 || 1);
    const wave =
      2600 +
      1500 * Math.sin(t * Math.PI * 2) +
      600 * Math.sin(t * Math.PI * 6 + 1.3) +
      450 * Math.sin(t * Math.PI * 11 + 4);
    return {
      name: isHours
        ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      views: Math.round(wave),
    };
  });
}

export default function Landing() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sceneDone, setSceneDone] = useState(false);
  const [countRun, setCountRun] = useState(false);
  const [trafficRange, setTrafficRange] = useState('30d');

  const trafficData = useMemo(() => makeTrafficData(trafficRange), [trafficRange]);

  const pageRef = useRef(null);
  const heroSceneRef = useRef(null);
  const globeWrapRef = useRef(null);
  const globeRef = useRef(null);
  const heroMetricRef = useRef(null);
  const panelsRef = useRef(null);
  const incomingRef = useRef(null);

  const navLinks = [
    { to: '/features', label: 'Product' },
    { to: '/pricing', label: 'Pricing' },
    { to: '/blog', label: 'Blog' },
  ];

  // ---- GSAP orchestration -------------------------------------------------
  useEffect(() => {
    if (REDUCED_MOTION) return;

    const ctx = gsap.context(() => {
      // Hero entrance
      gsap.fromTo('.hero-line', { y: 40, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
        stagger: 0.12, delay: 0.1,
      });
      gsap.fromTo('.hero-fade', { opacity: 0, y: 24 }, {
        opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.5, stagger: 0.1,
      });

      // Globe auto-initial far view
      if (globeRef.current?.hasScene?.()) {
        globeRef.current.setProgress(0);
      }

      // Pinned hero scene: as the user scrolls, the globe zooms in and the
      // data panels fade in, then we hand off to the next section.
      const heroScene = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: heroSceneRef.current,
          start: 'top top',
          end: '+=220%',
          scrub: 0.6,
          pin: heroSceneRef.current,
          anticipatePin: 1,
          onUpdate: (self) => {
            if (globeRef.current?.hasScene?.()) {
              globeRef.current.setProgress(self.progress);
              globeRef.current.setAutoRotate(self.progress > 0.85 ? false : true);
            }
          },
        },
      });

      heroScene
        .to(globeWrapRef.current, { scale: 1.25, duration: 1 }, 0)
        .fromTo(panelsRef.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0.3)
        .fromTo(heroMetricRef.current, { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' }, 0.15)
        .fromTo(incomingRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0.45)
        .to({}, { duration: 0.35 });

      // Generic reveals for every [data-reveal] block
      gsap.utils.toArray('[data-reveal]').forEach((el) => {
        gsap.fromTo(el, { opacity: 0, y: 44 }, {
          opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%' },
        });
      });

      // Feature visual reveal
      gsap.utils.toArray('[data-vect]').forEach((el) => {
        gsap.fromTo(el, { opacity: 0, y: 30 }, {
          opacity: 1, y: 0, duration: 0.9, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 88%' },
        });
      });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  // Lazy-load the globe scene: only mount after the hero is visible.
  useEffect(() => {
    if (REDUCED_MOTION) return;
    const onScroll = () => {
      const rect = globeWrapRef.current?.getBoundingClientRect();
      if (rect && rect.top < window.innerHeight * 0.9) {
        setSceneDone(true);
        window.removeEventListener('scroll', onScroll);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Start the live count-up animation only once the user scrolls.
  useEffect(() => {
    if (REDUCED_MOTION) return;
    const onScroll = () => {
      if (window.scrollY > 5) {
        setCountRun(true);
        window.removeEventListener('scroll', onScroll);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      ref={pageRef}
      className="min-h-screen bg-slate-50 dark:bg-[#070A10] text-slate-900 dark:text-slate-100 font-sans relative overflow-x-clip"
    >
      {/* Layered background */}
      <div className="pointer-events-none fixed inset-0 z-0 obs-grid opacity-70" />

      {/* ============ NAVBAR ============ */}
      <header className="fixed top-0 left-0 right-0 z-[60]">
        <div className="bg-white/85 dark:bg-space-900/75 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/[0.07]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Logo />

            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((l) => (
                <Link key={l.label} to={l.to}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <Link to="/login" className="hidden md:inline-flex text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                Log in
              </Link>
              <Link to="/register" className="btn-signal btn-md hidden sm:inline-flex">
                Start Tracking
              </Link>
              <button
                className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileOpen}>
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden bg-white/95 dark:bg-space-900/95 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/[0.07] px-4 py-4 space-y-1">
            {navLinks.map((l) => (
              <Link key={l.label} to={l.to} className="block px-3 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.05] hover:text-slate-900 dark:hover:text-white font-medium">
                {l.label}
              </Link>
            ))}
            <div className="pt-3 mt-2 border-t border-slate-200 dark:border-white/[0.07] flex flex-col gap-2">
              <Link to="/login" className="block px-3 py-2 text-center text-slate-600 dark:text-slate-300 font-medium">Log in</Link>
              <Link to="/register" className="btn-signal btn-md w-full">Start Tracking</Link>
            </div>
          </div>
        )}
      </header>

      <main className="relative z-10 pt-16">
        {/* ============ HERO SCENE ============ */}
        <section ref={heroSceneRef} className="relative min-h-screen">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid lg:grid-cols-2 gap-10 items-center pt-10">
              {/* Left: copy */}
              <div className="relative z-10 text-center lg:text-left">
                <div className="hero-fade inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-obs mb-6">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
                    Real-time web analytics
                  </span>
                </div>

                <h1 className="hero-line text-5xl sm:text-6xl xl:text-7xl font-extrabold tracking-tight leading-[1.02] font-display">
                  <span className="text-slate-900 dark:text-slate-100">Your website</span>
                  <br />
                  <span className="text-slate-900 dark:text-slate-100">is always talking.</span>
                  <br />
                  <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 dark:from-violet-400 dark:to-fuchsia-300 bg-clip-text text-transparent">
                    WebPulse listens.
                  </span>
                </h1>

                <p className="hero-line mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  See where your visitors come from, understand how they move through your website, and measure what matters — in real time.
                </p>

                <div className="hero-fade mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                  <Link to="/register" className="btn-signal btn-lg w-full sm:w-auto">
                    Start Tracking <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link to="/features" className="btn-ghost-dark btn-lg w-full sm:w-auto">
                    Explore Demo
                  </Link>
                </div>

                <p className="hero-fade mt-4 text-xs text-slate-500 dark:text-slate-400">
                  No credit card required · Setup in minutes
                </p>
              </div>

              {/* Right: globe */}
              <div ref={globeWrapRef} className="relative order-first lg:order-last">
                <div className="relative mx-auto w-full max-w-[560px] aspect-square">
                  {sceneDone && (
                    <Suspense fallback={null}>
                      <HeroGlobe ref={globeRef} cities={HERO_CITIES} className="absolute inset-0" />
                    </Suspense>
                  )}
                  {/* HUD overlay */}
                  <div ref={heroMetricRef} className="absolute left-3 top-6 z-10 glass-obs rounded-2xl px-4 py-3 w-[168px]">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-400">
                        Live
                      </span>
                    </div>
                    <div className="metric-num text-3xl font-bold text-slate-900 dark:text-slate-100 font-display">
                      {REDUCED_MOTION ? STATIC_COUNTS.toLocaleString() : (
                        <AnimatedNumber end={STATIC_COUNTS} duration={2.4} run={countRun} />
                      )}
                    </div>
                    <div className="text-[10px] text-slate-600 dark:text-slate-300 mt-0.5">Active visitors</div>
                    <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-200/70 dark:border-white/[0.08]">
                      <div>
                        <div className="metric-num text-base font-bold text-slate-900 dark:text-slate-100">
                          {REDUCED_MOTION ? STATIC_VIEWS.toLocaleString() : (
                            <AnimatedNumber end={STATIC_VIEWS} duration={2.4} run={countRun} />
                          )}
                        </div>
                        <div className="text-[10px] text-slate-600 dark:text-slate-300">Events today</div>
                      </div>
                      <div>
                        <div className="metric-num text-base font-bold text-slate-900 dark:text-slate-100">
                          {REDUCED_MOTION ? STATIC_COUNTRIES : (
                            <AnimatedNumber end={STATIC_COUNTRIES} duration={2.4} run={countRun} />
                          )}
                        </div>
                        <div className="text-[10px] text-slate-600 dark:text-slate-300">Countries</div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute bottom-4 right-3 z-10 glass-obs rounded-2xl px-4 py-3 w-[150px]">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 mb-2">Top regions</div>
                    {TOP_LOCATIONS.slice(0, 4).map((l) => (
                      <div key={l.label} className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-slate-600 dark:text-slate-300">{l.label}</span>
                        <span className="metric-num font-semibold" style={{ color: l.color }}>{l.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Announced panel that appears mid-scroll */}
          <div ref={incomingRef} className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10 opacity-0 hidden md:block">
            <div className="glass-obs rounded-full px-5 py-2.5 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <Activity className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              Every visitor leaves a signal.
              <ArrowDown className="h-4 w-4 text-violet-600 dark:text-violet-400 animate-bounce" />
            </div>
          </div>

          {/* Analytics panels revealed while scrolling */}
          <div ref={panelsRef} className="absolute inset-0 z-10 opacity-0 pointer-events-none" />
        </section>

        {/* ============ TRUST / CUSTOMERS ============ */}
        <section className="relative z-10 border-y border-slate-200 dark:border-white/[0.06] bg-slate-100/60 dark:bg-white/[0.015] py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center" data-reveal>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-[0.22em] mb-8">
              Connect WebPulse to your stack
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-5 text-lg font-bold tracking-tight opacity-80">
              <span className="text-slate-600 dark:text-slate-300">Next.js</span>
              <span className="text-slate-600 dark:text-slate-300">React</span>
              <span className="text-slate-600 dark:text-slate-300">WordPress</span>
              <span className="text-slate-600 dark:text-slate-300">Shopify</span>
              <span className="text-slate-600 dark:text-slate-300">Vercel</span>
              <span className="text-slate-600 dark:text-slate-300">Cloudflare</span>
              <span className="text-slate-600 dark:text-slate-300">Node.js</span>
            </div>
          </div>
        </section>

        {/* ============ PRODUCT SHOWCASE ============ */}
        <section className="relative z-10 py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16" data-reveal>
            <p className="eyebrow-obs mb-4">The dashboard</p>
            <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight font-display text-slate-900 dark:text-slate-100">
              Everything happening on your site.
              <br />
              <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 dark:from-violet-400 dark:to-fuchsia-300 bg-clip-text text-transparent">In one view.</span>
            </h2>
          </div>

          {/* Dashboard mockup */}
          <div data-reveal className="relative max-w-6xl mx-auto">
            <div className="relative rounded-2xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-space-800/40 overflow-hidden shadow-2xl dark:shadow-black/40">
              {/* Window header */}
              <div className="h-11 border-b border-slate-200 dark:border-white/[0.07] flex items-center px-4 gap-2 bg-slate-50 dark:bg-white/[0.02]">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-400" />
                  <span className="w-3 h-3 rounded-full bg-amber-400" />
                  <span className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <div className="ml-4 text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-[0.22em] font-medium">
                  WebPulse · Panel
                </div>
                <div className="ml-auto flex items-center gap-2 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-widest">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                  </span>
                  Live
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-px bg-slate-200 dark:bg-white/[0.06]">
                {/* KPI column */}
                <div className="bg-white dark:bg-space-800 p-6 space-y-5">
                  <KpiCard label="ACTIVE USERS" value={STATIC_COUNTS} format={true} accent="#8B5CF6" />
                  <KpiCard label="PAGEVIEWS" value={STATIC_VIEWS} format={true} accent="#A78BFA" />
                  <KpiCard label="BOUNCE RATE" value={STATIC_BOUNCE} format={true} decimals={1} suffix="%" accent="#48E6A1" />
                  <KpiCard label="AVG SESSION" value={STATIC_SESSION} accent="#F59E0B" />

                  {/* Live activity */}
                  <div className="border-t border-slate-200 dark:border-white/[0.08] pt-5">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-3">Live activity</div>
                    <Suspense fallback={null}>
                      <LiveEventStream maxItems={4} />
                    </Suspense>
                  </div>
                </div>

                {/* Chart column */}
                <div className="bg-white dark:bg-space-800 p-6 lg:col-span-2 space-y-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Traffic</div>
                    <div className="flex items-center gap-1 rounded-full border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.03] p-0.5">
                      {TRAFFIC_RANGES.map((range) => (
                        <button
                          key={range}
                          onClick={() => setTrafficRange(range)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide transition-all duration-300 ${
                            trafficRange === range
                              ? 'bg-violet-600 text-white shadow-sm shadow-violet-500/30'
                              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                          }`}
                        >
                          {range}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="h-[300px]">
                    <ChartPreview data={trafficData} dark />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-5 pt-2">
                    <AcquisitionBars />
                    <GeoList />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ FEATURE STORYTELLING ============ */}
        <section className="relative z-10 py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-28">
            {FEATURE_SECTIONS.map((f, i) => (
              <FeatureRow key={f.index} f={f} flip={i % 2 === 1} />
            ))}
          </div>
        </section>

        {/* ============ LIVE EVENT STREAM ============ */}
        <section className="relative z-10 py-28">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
            <div data-reveal>
              <p className="eyebrow-obs mb-4">The live feed</p>
              <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight font-display text-slate-900 dark:text-slate-100">
                The internet doesn't wait.
                <br />
                <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 dark:from-violet-400 dark:to-fuchsia-300 bg-clip-text text-transparent">
                  Neither should your analytics.
                </span>
              </h2>
              <p className="mt-6 text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg">
                See every visitor event the second it happens — page views, checkouts, clicks, and signups from around the world.
              </p>
              <div className="mt-8 flex items-center gap-3 text-emerald-600 dark:text-emerald-400 font-semibold metric-num">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <span className="text-2xl">12,842</span>
                <span className="text-sm text-slate-500 dark:text-slate-400 font-normal">watching live now</span>
              </div>
            </div>
            <div data-reveal>
              <div className="rounded-2xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-space-900/80 p-5 min-h-[320px]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">Live now</span>
                  </div>
                  <span className="metric-num text-xs text-slate-500 dark:text-slate-400">12,842</span>
                </div>
                <Suspense fallback={null}>
                  <LiveEventStream maxItems={7} />
                </Suspense>
              </div>
            </div>
          </div>
        </section>

        {/* ============ TRACKING SETUP ============ */}
        <section className="relative z-10 py-28 border-y border-slate-200 dark:border-white/[0.06] bg-slate-100/60 dark:bg-white/[0.015]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16" data-reveal>
              <p className="eyebrow-obs mb-4">Setup</p>
              <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight font-display text-slate-900 dark:text-slate-100">
                From zero to live analytics
                <br />
                <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 dark:from-violet-400 dark:to-fuchsia-300 bg-clip-text text-transparent">in minutes.</span>
              </h2>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8" data-reveal>
                {TRACKING_STEPS.map((s) => (
                  <div key={s.n} className="flex gap-5">
                    <div className="text-3xl font-extrabold font-display text-violet-600/70 dark:text-violet-400/70 metric-num">{s.n}</div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">{s.title}</h3>
                      <p className="text-slate-600 dark:text-slate-300">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="relative" data-reveal>
                <div className="rounded-2xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-space-900 overflow-hidden">
                  <div className="h-10 border-b border-slate-200 dark:border-white/[0.07] flex items-center px-4 gap-2 bg-slate-50 dark:bg-space-950">
                    <div className="flex gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    </div>
                    <span className="ml-3 text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest">index.html</span>
                  </div>
                  <pre className="p-5 sm:p-6 font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto text-slate-800 dark:text-slate-200">
{`<script
  src="https://cdn.webpulse.app/script.js"
  data-tracking-id="wp_live_xxxxxxxxx"
  data-auto="true"
></script>`}
                  </pre>
                </div>

                <div className="mt-4 rounded-2xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-space-900 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">WebPulse connected</span>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300 mb-2">Receiving events...</div>
                  <ul className="space-y-2">
                    {['Page view', 'Session', 'Device', 'Location', 'Referrer'].map((e) => (
                      <li key={e} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <Check className="h-4 w-4 text-emerald-500" /> {e}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ INTEGRATIONS ============ */}
        <section className="relative z-10 py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14" data-reveal>
            <p className="eyebrow-obs mb-4">Integrations</p>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight font-display text-slate-900 dark:text-slate-100">
              Connect WebPulse to <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 dark:from-violet-400 dark:to-fuchsia-300 bg-clip-text text-transparent">your stack.</span>
            </h2>
          </div>
          <div data-reveal className="flex flex-wrap items-center justify-center gap-4 max-w-4xl mx-auto">
            {INTEGRATIONS.map((name, i) => (
              <div key={name}
                className="glass-obs rounded-full px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 hover:border-violet-500/40 transition-colors"
                style={{ transitionDelay: `${i * 20}ms` }}>
                {name}
              </div>
            ))}
          </div>
        </section>

        {/* ============ SECURITY ============ */}
        <section className="relative z-10 py-28 border-y border-slate-200 dark:border-white/[0.06] bg-slate-100/60 dark:bg-white/[0.015]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14" data-reveal>
              <p className="eyebrow-obs mb-4">Security & privacy</p>
              <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight font-display text-slate-900 dark:text-slate-100">
                Analytics without <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 dark:from-violet-400 dark:to-fuchsia-300 bg-clip-text text-transparent">compromising trust.</span>
              </h2>
              <p className="mt-5 text-slate-600 dark:text-slate-300 max-w-2xl mx-auto text-lg">
                Tracking data is sensitive. We treat every signal like it belongs to you — because it does.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5" data-reveal>
              {[
                { icon: <Lock className="h-5 w-5" />, t: 'Encrypted data', d: 'All data encrypted in transit and at rest with industry-standard protocols.' },
                { icon: <KeyRound className="h-5 w-5" />, t: 'Secure API tokens', d: 'Scoped tokens with fine-grained permissions and automatic rotation.' },
                { icon: <Fingerprint className="h-5 w-5" />, t: 'Tracking ID isolation', d: 'Each project is fully isolated with its own tracking ID and data stream.' },
                { icon: <Users className="h-5 w-5" />, t: 'Access controls', d: 'Role-based access for every member of your team.' },
                { icon: <ShieldCheck className="h-5 w-5" />, t: 'Privacy controls', d: 'Compliance-first settings to respect your visitors and regulations.' },
                { icon: <Trash2 className="h-5 w-5" />, t: 'Data retention', d: 'Configurable retention windows so you keep only what you need.' },
              ].map((c) => (
                <div key={c.t} className="glass-obs rounded-2xl p-6 transition-colors hover:border-violet-500/40">
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
                    {c.icon}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">{c.t}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{c.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ PRICING ============ */}
        <PricingSection />

        {/* ============ TESTIMONIALS ============ */}
        <section className="relative z-10 py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14" data-reveal>
            <p className="eyebrow-obs mb-4">Loved by teams</p>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight font-display text-slate-900 dark:text-slate-100">
              Real people. <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 dark:from-violet-400 dark:to-fuchsia-300 bg-clip-text text-transparent">Real signals.</span>
            </h2>
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            {[
              { q: 'We stopped guessing what our visitors were doing. The live feed changed how we ship.', n: 'Priya Sharma', r: 'Product Lead · Northwind' },
              { q: 'Setup took five minutes. Watching traffic arrive live is genuinely addictive.', n: 'Daniel Kim', r: 'Founder · Bellwether' },
              { q: 'The cleanest way I\'ve seen to turn raw analytics into a feeling of momentum.', n: 'Amara Osei', r: 'Growth · Fathom Labs' },
            ].map((t) => (
              <div key={t.n} data-reveal className="glass-obs rounded-2xl p-7 flex flex-col">
                <div className="text-violet-500 dark:text-violet-400 text-4xl leading-none mb-4 font-serif">"</div>
                <p className="text-lg text-slate-800 dark:text-slate-100 leading-relaxed flex-1">{t.q}</p>
                <div className="mt-6 flex items-center gap-3 pt-5 border-t border-slate-200 dark:border-white/[0.08]">
                  <div className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={{ background: 'linear-gradient(135deg,#7C6CE0,#8B5CF6)' }}>
                    {t.n.split(' ').map(w => w[0]).join('')}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t.n}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{t.r}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ============ FINAL CTA ============ */}
        <section className="relative z-10 py-32 text-center">
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8" data-reveal>
            <h2 className="text-5xl sm:text-7xl font-extrabold tracking-tight font-display leading-[1.02]">
              <span className="text-slate-900 dark:text-slate-100">Stop guessing.</span>
              <br />
              <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 dark:from-violet-400 dark:to-fuchsia-300 bg-clip-text text-transparent">
                Start seeing.
              </span>
            </h2>
            <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
              Start tracking your website and see what's happening in real time.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/register" className="btn-signal btn-lg">
                Start Tracking <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ============ FOOTER ============ */}
      <footer className="relative z-10 border-t border-slate-200 dark:border-white/[0.07] bg-white dark:bg-[#070A10]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 lg:py-20" data-reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-x-8 gap-y-12">
            {/* Left: brand + positioning */}
            <div className="lg:col-span-4 max-w-sm">
              <Logo />
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-relaxed">
                Real-time analytics for the modern web.
              </p>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                WebPulse is a real-time visitor intelligence platform that turns every
                pageview, event, and signal into insight — streamed live to your dashboard.
              </p>
            </div>

            {/* Explore */}
            <nav aria-label="Explore" className="lg:col-span-2">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 dark:text-slate-400">
                Explore
              </h2>
              <ul className="space-y-2.5">
                {[
                  ['/', 'Home'],
                  ['/features', 'Features'],
                  ['/pricing', 'Pricing'],
                  ['/integrations', 'Integrations'],
                  ['/api', 'API'],
                  ['/docs', 'Developers'],
                  ['/docs', 'Documentation'],
                  ['/api-keys', 'SDK'],
                  ['/blog', 'Blog'],
                  ['/help', 'Help Center'],
                ].map(([to, label]) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className="inline-block text-sm text-slate-600 dark:text-slate-400 transition-all duration-200 hover:text-slate-900 dark:hover:text-white hover:translate-x-0.5"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Product */}
            <nav aria-label="Product" className="lg:col-span-2">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 dark:text-slate-400">
                Product
              </h2>
              <ul className="space-y-2.5">
                {[
                  ['/features', 'Live Analytics'],
                  ['/features', 'Visitor Intelligence'],
                  ['/features', 'Traffic Analytics'],
                  ['/features', 'Event Tracking'],
                  ['/features', 'Insights'],
                  ['/api', 'API'],
                ].map(([to, label]) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className="inline-block text-sm text-slate-600 dark:text-slate-400 transition-all duration-200 hover:text-slate-900 dark:hover:text-white hover:translate-x-0.5"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Connect */}
            <nav aria-label="Connect" className="lg:col-span-2">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 dark:text-slate-400">
                Connect
              </h2>
              <ul className="space-y-2.5">
                <li>
                  <a href={REPO_URL} target="_blank" rel="noopener noreferrer"
                    className="inline-block text-sm text-slate-600 dark:text-slate-400 transition-all duration-200 hover:text-slate-900 dark:hover:text-white hover:translate-x-0.5">
                    GitHub
                  </a>
                </li>
                <li>
                  <a href={`${REPO_URL}/issues`} target="_blank" rel="noopener noreferrer"
                    className="inline-block text-sm text-slate-600 dark:text-slate-400 transition-all duration-200 hover:text-slate-900 dark:hover:text-white hover:translate-x-0.5">
                    Report an issue
                  </a>
                </li>
                <li>
                  <Link to="/community" className="inline-block text-sm text-slate-600 dark:text-slate-400 transition-all duration-200 hover:text-slate-900 dark:hover:text-white hover:translate-x-0.5">
                    Community
                  </Link>
                </li>
                <li>
                  <Link to="/help" className="inline-block text-sm text-slate-600 dark:text-slate-400 transition-all duration-200 hover:text-slate-900 dark:hover:text-white hover:translate-x-0.5">
                    Contact
                  </Link>
                </li>
              </ul>
            </nav>

            <div className="lg:col-span-2">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 dark:text-slate-400">
                Contribute
              </h2>
              <p className="mb-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                WebPulse is built in the open. Report issues, suggest features, and follow the project on GitHub.
              </p>
              <a
                href={REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary btn-md w-full inline-flex items-center justify-center gap-1.5"
              >
                Open GitHub <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            {/* Bottom bar */}
            <div className="lg:col-span-12">
              <div className="pt-8 border-t border-slate-200 dark:border-white/[0.08]">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    © 2026 WebPulse
                  </p>
                  <div className="flex items-center gap-5">
                    <nav aria-label="Legal" className="flex items-center gap-5">
                      <Link to="/privacy" className="text-xs text-slate-600 dark:text-slate-400 transition-colors hover:text-slate-900 dark:hover:text-white">Privacy</Link>
                      <Link to="/terms" className="text-xs text-slate-600 dark:text-slate-400 transition-colors hover:text-slate-900 dark:hover:text-white">Terms</Link>
                      <Link to="/security" className="text-xs text-slate-600 dark:text-slate-400 transition-colors hover:text-slate-900 dark:hover:text-white">Security</Link>
                    </nav>
                    <span className="hidden sm:inline text-xs text-slate-400 dark:text-slate-600">·</span>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Built with intention.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Section sub-components
--------------------------------------------------------------------------- */

function KpiCard({ label, value, accent, format, decimals = 0, suffix = '' }) {
  return (
    <div className="group cursor-pointer rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.03] p-4 transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/40 dark:hover:border-violet-400/30 hover:bg-white dark:hover:bg-white/[0.05] hover:shadow-lg hover:shadow-violet-500/[0.08]">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 mb-1">{label}</div>
        <span
          className="h-1.5 w-1.5 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: accent }}
        />
      </div>
      <div
        className="metric-num text-2xl font-bold transition-transform duration-300 group-hover:translate-x-0.5"
        style={{ color: accent }}
      >
        {format ? (
          <AnimatedNumber end={value} decimals={decimals} suffix={suffix} />
        ) : (
          value
        )}
      </div>
    </div>
  );
}

function AcquisitionBars() {
  const rows = [
    { l: 'Google', v: 42, c: '#8B5CF6' },
    { l: 'Direct', v: 26, c: '#A78BFA' },
    { l: 'LinkedIn', v: 14, c: '#48E6A1' },
    { l: 'YouTube', v: 9, c: '#F59E0B' },
  ];
  return (
    <div className="rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.03] p-4">
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 mb-4">Traffic sources</div>
      <div className="space-y-3">
        {rows.map((r, i) => (
          <div
            key={r.l}
            className="group cursor-pointer rounded-lg -mx-1.5 px-1.5 py-1 transition-colors duration-300 hover:bg-slate-100/80 dark:hover:bg-white/[0.03]"
          >
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-600 dark:text-slate-300 transition-colors group-hover:text-slate-900 dark:group-hover:text-slate-100">{r.l}</span>
              <span className="metric-num font-semibold transition-transform duration-300 group-hover:scale-110 origin-right" style={{ color: r.c }}>
                <AnimatedNumber end={r.v} suffix="%" />
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-200 dark:bg-white/[0.08] overflow-hidden" style={{ transform: `translateX(${(i % 2) * 3}px)` }}>
              <div
                className="h-full rounded-full transition-all duration-500 ease-out group-hover:brightness-125 group-hover:shadow-[0_0_10px] group-hover:shadow-violet-500/40"
                style={{ width: `${r.v * 2.2}%`, background: `linear-gradient(90deg, ${r.c}, ${r.c}88)` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GeoList() {
  const locs = [
    { l: 'United States', v: '4,218', pct: 33, c: '#8B5CF6' },
    { l: 'India', v: '2,943', pct: 23, c: '#A78BFA' },
    { l: 'Germany', v: '1,201', pct: 9, c: '#48E6A1' },
    { l: 'UK', v: '984', pct: 7, c: '#8B5CF6' },
  ];
  return (
    <div className="rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.03] p-4">
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 mb-4">Live by region</div>
      <div className="space-y-2.5">
        {locs.map((r) => (
          <div
            key={r.l}
            className="group cursor-pointer flex items-center gap-2 text-xs rounded-lg -mx-1.5 px-1.5 py-1 transition-colors duration-300 hover:bg-slate-100/80 dark:hover:bg-white/[0.03]"
          >
            <span className="w-24 text-slate-600 dark:text-slate-300 truncate transition-colors group-hover:text-slate-900 dark:group-hover:text-slate-100">{r.l}</span>
            <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-white/[0.08] overflow-hidden flex gap-px">
              {Array.from({ length: Math.max(1, Math.round(r.pct / 8)) }).map((_, i) => (
                <span
                  key={i}
                  className="flex-1 rounded-sm transition-transform duration-300 group-hover:scale-y-125"
                  style={{ background: r.c, opacity: 0.5 + (i / 10) }}
                />
              ))}
            </div>
            <span
              className="metric-num font-semibold w-10 text-right transition-transform duration-300 group-hover:scale-110 origin-right"
              style={{ color: r.c }}
            >
              <AnimatedNumber end={parseInt(r.v.replace(/,/g, ''), 10)} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeatureRow({ f, flip }) {
  return (
    <div className="grid lg:grid-cols-2 gap-12 items-center">
      <div className={flip ? 'lg:order-2' : ''} data-reveal>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-violet-600 dark:text-violet-400/70 font-display font-extrabold text-sm metric-num">{f.index}</span>
          <span className="h-px w-10 bg-violet-500/40 dark:bg-violet-400/30" />
          <span className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{f.sub}</span>
        </div>
        <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display text-slate-900 dark:text-slate-100 mb-5">
          {f.title}
        </h3>
        <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed max-w-lg">{f.body}</p>
        <Link to="/features" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-500 dark:hover:text-violet-300 transition-colors">
          Explore {f.sub.toLowerCase()}<ChevronRight className="h-4 w-4" />
        </Link>
      </div>
      <div className={flip ? 'lg:order-1' : ''} data-vect>
        <FeatureVisual f={f} />
      </div>
    </div>
  );
}

function FeatureVisual({ f }) {
  switch (f.visual) {
    case 'geo':
      return <GeoVisual />;
    case 'flow':
      return <FlowVisual />;
    case 'acq':
      return <AcqVisual />;
    default:
      return <PipelineVisual />;
  }
}

function GeoVisual() {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-space-900/60 p-6">
      <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-4">Active visitors by country</div>
      <div className="space-y-4">
        {TOP_LOCATIONS.map((r) => (
          <div key={r.label}>
            <div className="flex items-center justify-between text-sm mb-1.5">
              <span className="text-slate-800 dark:text-slate-100">{r.label}</span>
              <span className="metric-num font-semibold text-slate-800 dark:text-slate-100">
                <AnimatedNumber end={parseInt(r.value.replace(/,/g, ''), 10)} />
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-200 dark:bg-white/[0.08] overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${r.pct * 2.4}%`, background: `linear-gradient(90deg, ${r.color}, ${r.color}55)` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FlowVisual() {
  const levels = ['Landing page', 'Features', 'Pricing', 'Checkout'];
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-space-900/60 p-6">
      <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-5">Visitor flow</div>
      <div className="relative pl-4">
        {levels.map((l, i) => (
          <div key={l} className="relative pb-8 last:pb-0">
            {i < levels.length - 1 && (
              <span className="absolute left-[13px] top-6 bottom-0 w-px bg-slate-300 dark:bg-white/[0.12]" />
            )}
            <span className="absolute left-0 top-1 flex h-3.5 w-3.5 items-center justify-center">
              <span className="absolute h-2 w-2 rounded-full bg-violet-500/40 dark:bg-violet-400/40 animate-pulse" />
              <span className="relative h-1.5 w-1.5 rounded-full" style={{ background: i === 3 ? '#48E6A1' : '#8B5CF6' }} />
            </span>
            <div className="flex items-center justify-between ml-7">
              <span className="text-sm text-slate-800 dark:text-slate-100">{l}</span>
              <span className="metric-num text-xs text-slate-500 dark:text-slate-400">{70 + i * 8 - i * i * 3}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AcqVisual() {
  const rows = [
    { l: 'Google', v: 42, c: '#8B5CF6' },
    { l: 'Direct', v: 26, c: '#A78BFA' },
    { l: 'LinkedIn', v: 14, c: '#48E6A1' },
    { l: 'YouTube', v: 9, c: '#F59E0B' },
    { l: 'Other', v: 9, c: '#94A3B8' },
  ];
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-space-900/60 p-6">
      <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-5">Where visitors come from</div>
      {rows.map((r) => (
        <div key={r.l} className="flex items-center gap-3 py-2">
          <span className="w-20 text-sm text-slate-800 dark:text-slate-100">{r.l}</span>
          <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-white/[0.08] overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${r.v}%`, background: r.c }}
            />
          </div>
          <span className="metric-num text-sm font-semibold w-10 text-right" style={{ color: r.c }}>
            <AnimatedNumber end={r.v} suffix="%" />
          </span>
        </div>
      ))}
    </div>
  );
}

function PipelineVisual() {
  const steps = ['Visitors', 'Events', 'Patterns', 'Insights', 'Decisions'];
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-space-900/60 p-6">
      <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-5">Intelligence pipeline</div>
      <div className="flex flex-col items-center gap-1">
        {steps.map((s, i) => (
          <React.Fragment key={s}>
            <div
              className="w-full max-w-[260px] rounded-xl px-4 py-3 text-center text-sm font-semibold"
              style={{
                background: i === steps.length - 1
                  ? 'rgba(72,230,161,0.12)'
                  : 'rgba(139,92,246,0.08)',
                border: `1px solid ${i === steps.length - 1 ? 'rgba(72,230,161,0.4)' : 'rgba(139,92,246,0.2)'}`,
                color: i === steps.length - 1 ? '#48E6A1' : '#8B5CF6',
              }}
            >
              {s}
            </div>
            {i < steps.length - 1 && <ArrowDown className="h-4 w-4 text-slate-400 dark:text-slate-500 my-0.5" />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function PricingSection() {
  const plans = [
    { name: 'Free', price: '₹0', tagline: 'For personal projects and experimentation', pro: false, features: ['1 project', 'Real-time monitoring', 'Traffic analytics', 'Visitor tracking', 'Performance analytics', 'Custom dashboard'] },
    { name: 'Basic', price: '₹299', tagline: 'For developers and small websites', pro: false, features: ['Multiple projects', 'Extended analytics usage', 'Advanced dashboard views', 'Alerts & notifications', 'Performance monitoring', 'Report export'] },
    { name: 'Pro', price: '₹999', tagline: 'For growing products and high-traffic websites', pro: true, features: ['Higher analytics limits', 'Advanced monitoring', 'Detailed visitor analytics', 'Advanced reporting', 'Priority support'] },
    { name: 'Business', price: '₹2,999', tagline: 'For teams that need more control', pro: false, features: ['Higher usage limits', 'Team collaboration', 'Advanced access controls', 'Custom integrations', 'Dedicated support'] },
  ];
  return (
    <section className="relative z-10 py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-14" data-reveal>
        <p className="eyebrow-obs mb-4">Pricing</p>
        <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight font-display text-slate-900 dark:text-slate-100">
          Simple pricing. <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 dark:from-violet-400 dark:to-fuchsia-300 bg-clip-text text-transparent">Start free.</span>
        </h2>
        <p className="mt-4 text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          Explore WebPulse with the core analytics tools you need to understand your website. Upgrade as the platform grows.
        </p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
        {plans.map((p) => (
          <div key={p.name} data-reveal
            className={`relative rounded-2xl p-8 ${p.pro
              ? 'bg-white dark:bg-space-800 border-2 border-violet-500 lg:-translate-y-3 shadow-lift'
              : 'glass-obs border border-slate-200 dark:border-white/[0.1]'}`}>
            {p.pro && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest bg-gradient-to-r from-[#7C6CE0] to-[#8B5CF6] text-white">
                Most popular
              </div>
            )}
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">{p.name}</h3>
            <div className="flex items-baseline gap-1 mb-1">
              <span className={`text-4xl font-extrabold font-display ${p.pro ? 'text-violet-600 dark:text-violet-400' : 'text-slate-900 dark:text-slate-100'}`}>{p.price}</span>
              <span className="text-slate-500 dark:text-slate-400 text-sm">/ month</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{p.tagline}</p>
            <ul className="space-y-3 mb-8">
              {p.features.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <Link to="/register" className={p.pro ? 'btn-signal btn-md w-full' : 'btn-ghost-dark btn-md w-full'}>
              {p.name === 'Free' ? 'Start free' : p.name === 'Business' ? 'Contact Sales' : `Choose ${p.name}`}
            </Link>
          </div>
        ))}
      </div>
      <div className="text-center mt-12" data-reveal>
        <Link to="/pricing" className="inline-flex items-center gap-2 text-sm font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-500 dark:hover:text-violet-300 transition-colors">
          See full pricing & comparison <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
