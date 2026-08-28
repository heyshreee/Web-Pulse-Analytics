import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
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
import CountUp from '../components/landing/CountUp';
import HeroGlobe from '../components/landing/HeroGlobe';
import LiveEventStream from '../components/landing/LiveEventStream';

gsap.registerPlugin(ScrollTrigger);

const REDUCED_MOTION =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

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
  { label: 'United States', value: '4,218', pct: 33, color: '#35D7FF' },
  { label: 'India', value: '2,943', pct: 23, color: '#8B7CFF' },
  { label: 'Germany', value: '1,201', pct: 9, color: '#48E6A1' },
  { label: 'United Kingdom', value: '984', pct: 7, color: '#35D7FF' },
  { label: 'Japan', value: '762', pct: 6, color: '#8B7CFF' },
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
  'Next.js', 'React', 'WordPress', 'Shopify', 'Webflow',
  'Google Tag Manager', 'Node.js', 'Python', 'Cloudflare', 'Vercel',
];

const STATIC_COUNTS = 12842;
const STATIC_VIEWS = 84392;
const STATIC_BOUNCE = 31.8;
const STATIC_SESSION = '04:21';

export default function Landing() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sceneDone, setSceneDone] = useState(false);

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

  return (
    <div
      ref={pageRef}
      className="min-h-screen bg-[#07090D] text-pulse-text font-sans relative overflow-x-clip"
    >
      {/* Layered observatory background */}
      <div className="pointer-events-none fixed inset-0 z-0 obs-grid opacity-70" />
      <div className="pointer-events-none fixed inset-0 z-0" style={{
        background:
          'radial-gradient(60% 45% at 50% 0%, rgba(53,215,255,0.10) 0%, rgba(53,215,255,0) 60%), radial-gradient(45% 40% at 15% 45%, rgba(139,124,255,0.07) 0%, rgba(139,124,255,0) 60%), radial-gradient(45% 40% at 85% 70%, rgba(53,215,255,0.06) 0%, rgba(53,215,255,0) 60%)',
      }} />

      {/* ============ NAVBAR ============ */}
      <header className="fixed top-0 left-0 right-0 z-[60]">
        <div className="glass-obs backdrop-blur-xl border-b border-white/[0.06]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5 group">
              <span className="relative flex h-9 w-9 items-center justify-center rounded-xl overflow-hidden"
                style={{ background: 'linear-gradient(135deg,#35D7FF,#8B7CFF)' }}>
                <BarChart2 className="h-5 w-5 text-[#07111c]" />
              </span>
              <span className="text-lg font-bold tracking-tight text-pulse-text font-display">
                WebPulse
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((l) => (
                <Link key={l.label} to={l.to}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-pulse-text2 hover:text-pulse-text hover:bg-white/[0.04] transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <Link to="/login" className="hidden md:inline-flex text-sm font-medium text-pulse-text2 hover:text-pulse-text transition-colors">
                Log in
              </Link>
              <Link to="/register" className="btn-signal btn-md hidden sm:inline-flex">
                Start Tracking
              </Link>
              <button className="md:hidden p-2 rounded-lg text-pulse-text2 hover:bg-white/[0.05] transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}>
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden bg-[#0B0F14]/95 backdrop-blur-xl border-b border-white/[0.06] px-4 py-4 space-y-1">
            {navLinks.map((l) => (
              <Link key={l.label} to={l.to} className="block px-3 py-2 rounded-lg text-pulse-text2 hover:bg-white/[0.05] hover:text-pulse-text font-medium">
                {l.label}
              </Link>
            ))}
            <div className="pt-3 mt-2 border-t border-white/[0.06] flex flex-col gap-2">
              <Link to="/login" className="block px-3 py-2 text-center text-pulse-text2 font-medium">Log in</Link>
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
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pulse-live opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-pulse-live" />
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-pulse-green">
                    Live Data · Real-time telemetry
                  </span>
                </div>

                <h1 className="hero-line text-5xl sm:text-6xl xl:text-7xl font-extrabold tracking-tight leading-[1.02] font-display">
                  <span className="text-pulse-text">Your website</span>
                  <br />
                  <span className="text-pulse-text">is talking.</span>
                  <br />
                  <span className="text-glow-cyan bg-gradient-to-r from-pulse-cyan via-white to-pulse-violet bg-clip-text text-transparent">
                    WebPulse listens.
                  </span>
                </h1>

                <p className="hero-line mt-6 text-lg sm:text-xl text-pulse-text2 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  Real-time web analytics that shows who is visiting, what they're doing, where they came from, and what matters next.
                </p>

                <div className="hero-fade mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                  <Link to="/register" className="btn-signal btn-lg w-full sm:w-auto">
                    Start Tracking <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link to="/features" className="btn-ghost-dark btn-lg w-full sm:w-auto">
                    Explore Demo
                  </Link>
                </div>

                <p className="hero-fade mt-4 text-xs text-pulse-muted">
                  No credit card required · Setup in minutes
                </p>
              </div>

              {/* Right: globe */}
              <div ref={globeWrapRef} className="relative order-first lg:order-last">
                <div className="relative mx-auto w-full max-w-[560px] aspect-square">
                  {sceneDone && (
                    <HeroGlobe ref={globeRef} cities={HERO_CITIES} className="absolute inset-0" />
                  )}
                  {/* HUD overlay */}
                  <div ref={heroMetricRef} className="absolute left-3 top-6 z-10 glass-obs rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pulse-live opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-pulse-live" />
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-pulse-green">LIVE DATA</span>
                    </div>
                    <div className="metric-num text-3xl font-bold text-pulse-text font-display">
                      {REDUCED_MOTION ? STATIC_COUNTS.toLocaleString() : (
                        <CountUp end={STATIC_COUNTS} duration={2.4} />
                      )}
                    </div>
                    <div className="text-[11px] text-pulse-text2">ACTIVE USERS</div>
                    <div className="text-[11px] font-semibold text-pulse-green mt-1">▲ +18.4% vs last 24h</div>
                  </div>

                  <div className="absolute bottom-4 right-3 z-10 glass-obs rounded-2xl px-4 py-3 w-[150px]">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-pulse-muted mb-2">Top regions</div>
                    {TOP_LOCATIONS.slice(0, 4).map((l) => (
                      <div key={l.label} className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-pulse-text2">{l.label}</span>
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
            <div className="glass-obs rounded-full px-5 py-2.5 flex items-center gap-2 text-sm text-pulse-text2">
              <Activity className="h-4 w-4 text-pulse-cyan" />
              Every visitor leaves a signal.
              <ArrowDown className="h-4 w-4 text-pulse-violet animate-bounce" />
            </div>
          </div>

          {/* Analytics panels revealed while scrolling */}
          <div ref={panelsRef} className="absolute inset-0 z-10 opacity-0 pointer-events-none" />
        </section>

        {/* ============ TRUST / CUSTOMERS ============ */}
        <section className="relative z-10 border-y border-white/[0.06] bg-white/[0.015] py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center" data-reveal>
            <p className="text-xs font-medium text-pulse-muted uppercase tracking-[0.22em] mb-8">
              Connect WebPulse to your stack
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-5 text-lg font-bold tracking-tight opacity-80">
              <span className="text-pulse-text2">Next.js</span>
              <span className="text-pulse-text2">React</span>
              <span className="text-pulse-text2">WordPress</span>
              <span className="text-pulse-text2">Shopify</span>
              <span className="text-pulse-text2">Vercel</span>
              <span className="text-pulse-text2">Cloudflare</span>
              <span className="text-pulse-text2">Node.js</span>
            </div>
          </div>
        </section>

        {/* ============ PRODUCT SHOWCASE ============ */}
        <section className="relative z-10 py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16" data-reveal>
            <p className="eyebrow-obs mb-4">The dashboard</p>
            <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight font-display text-pulse-text">
              Everything happening on your site.
              <br />
              <span className="bg-gradient-to-r from-pulse-cyan to-pulse-violet bg-clip-text text-transparent">In one view.</span>
            </h2>
          </div>

          {/* Dashboard mockup */}
          <div data-reveal className="relative max-w-6xl mx-auto">
            <div className="absolute -inset-2 rounded-3xl opacity-40 blur-2xl"
              style={{ background: 'radial-gradient(60% 60% at 50% 0%, rgba(53,215,255,0.25), transparent 70%)' }} />
            <div className="relative rounded-2xl border border-white/[0.08] bg-[#0B0F14]/90 overflow-hidden shadow-2xl">
              {/* Window header */}
              <div className="h-11 border-b border-white/[0.06] flex items-center px-4 gap-2 bg-white/[0.02]">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-pulse-error/60" />
                  <span className="w-3 h-3 rounded-full bg-pulse-warning/60" />
                  <span className="w-3 h-3 rounded-full bg-pulse-live/60" />
                </div>
                <div className="ml-4 text-[10px] text-pulse-muted uppercase tracking-[0.22em] font-medium">
                  WebPulse Analytics · Panel
                </div>
                <div className="ml-auto flex items-center gap-2 text-[10px] text-pulse-green font-semibold uppercase tracking-widest">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pulse-live opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-pulse-live" />
                  </span>
                  Live
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-px bg-white/[0.04]">
                {/* KPI column */}
                <div className="bg-[#0B0F14] p-6 space-y-5">
                  <KpiCard label="ACTIVE USERS" value={STATIC_COUNTS} format={true} accent="#35D7FF" />
                  <KpiCard label="PAGEVIEWS" value={STATIC_VIEWS} format={true} accent="#8B7CFF" />
                  <KpiCard label="BOUNCE RATE" value={`${STATIC_BOUNCE}%`} accent="#48E6A1" />
                  <KpiCard label="AVG SESSION" value={STATIC_SESSION} accent="#FFB84D" />

                  {/* Live activity */}
                  <div className="border-t border-white/[0.06] pt-5">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-pulse-muted mb-3">Live activity</div>
                    <LiveEventStream maxItems={4} />
                  </div>
                </div>

                {/* Chart column */}
                <div className="bg-[#0B0F14] p-6 lg:col-span-2 space-y-5">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-pulse-muted">Traffic</div>
                  <TrafficWave />
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
              <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight font-display text-pulse-text">
                The internet doesn't wait.
                <br />
                <span className="bg-gradient-to-r from-pulse-cyan to-pulse-violet bg-clip-text text-transparent">
                  Neither should your analytics.
                </span>
              </h2>
              <p className="mt-6 text-lg text-pulse-text2 leading-relaxed max-w-lg">
                See every visitor event the second it happens — page views, checkouts, clicks, and signups from around the world.
              </p>
              <div className="mt-8 flex items-center gap-3 text-pulse-green font-semibold metric-num">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pulse-live opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-pulse-live" />
                </span>
                <span className="text-2xl">12,842</span>
                <span className="text-sm text-pulse-text2 font-normal">watching live now</span>
              </div>
            </div>
            <div data-reveal>
              <div className="rounded-2xl border border-white/[0.08] bg-[#0B0F14]/90 p-5 min-h-[320px] glass-obs">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pulse-live opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-pulse-live" />
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-pulse-green">Live now</span>
                  </div>
                  <span className="metric-num text-xs text-pulse-muted">12,842</span>
                </div>
                <LiveEventStream maxItems={7} />
              </div>
            </div>
          </div>
        </section>

        {/* ============ TRACKING SETUP ============ */}
        <section className="relative z-10 py-28 border-y border-white/[0.06] bg-white/[0.015]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16" data-reveal>
              <p className="eyebrow-obs mb-4">Setup</p>
              <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight font-display text-pulse-text">
                From zero to live analytics
                <br />
                <span className="bg-gradient-to-r from-pulse-cyan to-pulse-violet bg-clip-text text-transparent">in minutes.</span>
              </h2>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8" data-reveal>
                {TRACKING_STEPS.map((s) => (
                  <div key={s.n} className="flex gap-5">
                    <div className="text-3xl font-extrabold font-display text-pulse-cyan/70 metric-num">{s.n}</div>
                    <div>
                      <h3 className="text-lg font-bold text-pulse-text mb-1">{s.title}</h3>
                      <p className="text-pulse-text2">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="relative" data-reveal>
                <div className="rounded-2xl border border-white/[0.08] bg-[#0A0E14] overflow-hidden">
                  <div className="h-10 border-b border-white/[0.06] flex items-center px-4 gap-2">
                    <div className="flex gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-pulse-error/60" />
                      <span className="w-2.5 h-2.5 rounded-full bg-pulse-warning/60" />
                      <span className="w-2.5 h-2.5 rounded-full bg-pulse-live/60" />
                    </div>
                    <span className="ml-3 text-[10px] text-pulse-muted uppercase tracking-widest">index.html</span>
                  </div>
                  <pre className="p-5 sm:p-6 font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto text-slate-200">
{`<script
  src="https://cdn.webpulse.app/script.js"
  data-tracking-id="wp_live_xxxxxxxxx"
  data-auto="true"
></script>`}
                  </pre>
                </div>

                <div className="mt-4 glass-obs rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pulse-live opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-pulse-live" />
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-pulse-green">WebPulse connected</span>
                  </div>
                  <div className="text-xs text-pulse-text2 mb-2">Receiving events...</div>
                  <ul className="space-y-2">
                    {['Page view', 'Session', 'Device', 'Location', 'Referrer'].map((e) => (
                      <li key={e} className="flex items-center gap-2 text-sm text-pulse-text2">
                        <Check className="h-4 w-4 text-pulse-green" /> {e}
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
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight font-display text-pulse-text">
              Connect WebPulse to <span className="bg-gradient-to-r from-pulse-cyan to-pulse-violet bg-clip-text text-transparent">your stack.</span>
            </h2>
          </div>
          <div data-reveal className="flex flex-wrap items-center justify-center gap-4 max-w-4xl mx-auto">
            {INTEGRATIONS.map((name, i) => (
              <div key={name}
                className="glass-obs rounded-full px-5 py-2.5 text-sm font-semibold text-pulse-text2 hover:text-pulse-text hover:border-pulse-cyan/40 transition-colors"
                style={{ transitionDelay: `${i * 20}ms` }}>
                {name}
              </div>
            ))}
          </div>
        </section>

        {/* ============ SECURITY ============ */}
        <section className="relative z-10 py-28 border-y border-white/[0.06] bg-white/[0.015]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14" data-reveal>
              <p className="eyebrow-obs mb-4">Security & privacy</p>
              <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight font-display text-pulse-text">
                Analytics without <span className="bg-gradient-to-r from-pulse-cyan to-pulse-violet bg-clip-text text-transparent">compromising trust.</span>
              </h2>
              <p className="mt-5 text-pulse-text2 max-w-2xl mx-auto text-lg">
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
                <div key={c.t} className="glass-obs rounded-2xl p-6 transition-colors hover:border-white/[0.14]">
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{ background: 'rgba(53,215,255,0.08)', color: '#35D7FF' }}>
                    {c.icon}
                  </div>
                  <h3 className="text-base font-bold text-pulse-text mb-2">{c.t}</h3>
                  <p className="text-sm text-pulse-text2 leading-relaxed">{c.d}</p>
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
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight font-display text-pulse-text">
              Real people. <span className="bg-gradient-to-r from-pulse-cyan to-pulse-violet bg-clip-text text-transparent">Real signals.</span>
            </h2>
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            {[
              { q: 'We stopped guessing what our visitors were doing. The live feed changed how we ship.', n: 'Priya Sharma', r: 'Product Lead · Northwind' },
              { q: 'Setup took five minutes. Watching traffic arrive live is genuinely addictive.', n: 'Daniel Kim', r: 'Founder · Bellwether' },
              { q: 'The cleanest way I\'ve seen to turn raw analytics into a feeling of momentum.', n: 'Amara Osei', r: 'Growth · Fathom Labs' },
            ].map((t) => (
              <div key={t.n} data-reveal className="glass-obs rounded-2xl p-7 flex flex-col">
                <div className="text-pulse-cyan text-4xl leading-none mb-4">"</div>
                <p className="text-lg text-pulse-text leading-relaxed flex-1">{t.q}</p>
                <div className="mt-6 flex items-center gap-3 pt-5 border-t border-white/[0.06]">
                  <div className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold text-[#07111c]"
                    style={{ background: 'linear-gradient(135deg,#35D7FF,#8B7CFF)' }}>
                    {t.n.split(' ').map(w => w[0]).join('')}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-pulse-text">{t.n}</div>
                    <div className="text-xs text-pulse-muted">{t.r}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ============ FINAL CTA ============ */}
        <section className="relative z-10 py-32 text-center overflow-hidden">
          <div className="pointer-events-none absolute inset-0 opacity-50"
            style={{ background: 'radial-gradient(50% 60% at 50% 50%, rgba(53,215,255,0.12), transparent 70%)' }} />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8" data-reveal>
            <h2 className="text-5xl sm:text-7xl font-extrabold tracking-tight font-display leading-[1.02]">
              <span className="text-pulse-text">Stop guessing.</span>
              <br />
              <span className="text-glow-cyan bg-gradient-to-r from-pulse-cyan to-pulse-violet bg-clip-text text-transparent">
                Start seeing.
              </span>
            </h2>
            <p className="mt-6 text-lg sm:text-xl text-pulse-text2 max-w-xl mx-auto">
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
      <footer className="relative z-10 border-t border-white/[0.06] py-14 bg-[#07090D]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-5 gap-10 mb-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <span className="relative flex h-8 w-8 items-center justify-center rounded-lg overflow-hidden"
                  style={{ background: 'linear-gradient(135deg,#35D7FF,#8B7CFF)' }}>
                  <BarChart2 className="h-4.5 w-4.5 text-[#07111c]" />
                </span>
                <span className="text-lg font-bold tracking-tight text-pulse-text font-display">WebPulse</span>
              </div>
              <p className="text-pulse-text2 text-sm max-w-xs leading-relaxed">
                Analytics for the modern web.
              </p>
            </div>
            {[
              { t: 'Product', l: [['/features', 'Features'], ['/pricing', 'Pricing'], ['/integrations', 'Integrations'], ['/api', 'API']] },
              { t: 'Developers', l: [['/docs', 'Documentation'], ['/api', 'API'], ['/api-keys', 'SDK']] },
              { t: 'Company', l: [['/blog', 'Blog'], ['/community', 'Community'], ['/help', 'Contact']] },
              { t: 'Legal', l: [['/privacy', 'Privacy'], ['/terms', 'Terms'], ['/security', 'Security']] },
            ].map((col) => (
              <div key={col.t}>
                <h4 className="text-sm font-semibold text-pulse-text mb-4">{col.t}</h4>
                <ul className="space-y-3">
                  {col.l.map(([to, label]) => (
                    <li key={label}><Link to={to} className="text-sm text-pulse-text2 hover:text-pulse-text transition-colors">{label}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-6 border-t border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-pulse-muted">© 2026 WebPulse Analytics. All rights reserved.</p>
            <div className="flex items-center gap-2 text-xs text-pulse-muted">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pulse-live opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-pulse-live" />
              </span>
              Systems operational
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

function KpiCard({ label, value, accent, format }) {
  return (
    <div className="glass-obs rounded-xl p-4">
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-pulse-muted mb-1">{label}</div>
      <div className="metric-num text-2xl font-bold" style={{ color: accent }}>
        {format ? <CountUp end={value} duration={2} /> : value}
      </div>
    </div>
  );
}

function TrafficWave() {
  const pts = 'M0,120 C40,110 60,80 100,85 C140,90 160,55 200,60 C240,65 260,95 300,90 C340,85 360,45 400,50 C440,55 460,80 500,70';
  return (
    <div className="glass-obs rounded-xl p-4">
      <svg viewBox="0 0 500 140" className="w-full h-auto">
        <defs>
          <linearGradient id="twFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#35D7FF" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#35D7FF" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="twStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8B7CFF" />
            <stop offset="100%" stopColor="#35D7FF" />
          </linearGradient>
        </defs>
        <path d={`${pts} L500,140 L0,140 Z`} fill="url(#twFill)" />
        <path d={pts} fill="none" stroke="url(#twStroke)" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function AcquisitionBars() {
  const rows = [
    { l: 'Google', v: 42, c: '#35D7FF' },
    { l: 'Direct', v: 26, c: '#8B7CFF' },
    { l: 'LinkedIn', v: 14, c: '#48E6A1' },
    { l: 'YouTube', v: 9, c: '#FFB84D' },
  ];
  return (
    <div className="glass-obs rounded-xl p-4">
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-pulse-muted mb-4">Traffic sources</div>
      <div className="space-y-3">
        {rows.map((r, i) => (
          <div key={r.l}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-pulse-text2">{r.l}</span>
              <span className="metric-num font-semibold" style={{ color: r.c }}>{r.v}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden" style={{ transform: `translateX(${(i % 2) * 3}px)` }}>
              <div
                className="h-full rounded-full"
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
    { l: 'United States', v: '4,218', pct: 33, c: '#35D7FF' },
    { l: 'India', v: '2,943', pct: 23, c: '#8B7CFF' },
    { l: 'Germany', v: '1,201', pct: 9, c: '#48E6A1' },
    { l: 'UK', v: '984', pct: 7, c: '#35D7FF' },
  ];
  return (
    <div className="glass-obs rounded-xl p-4">
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-pulse-muted mb-4">Live by region</div>
      <div className="space-y-2.5">
        {locs.map((r) => (
          <div key={r.l} className="flex items-center gap-2 text-xs">
            <span className="w-24 text-pulse-text2 truncate">{r.l}</span>
            <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden flex gap-px">
              {Array.from({ length: Math.max(1, Math.round(r.pct / 8)) }).map((_, i) => (
                <span key={i} className="flex-1 rounded-sm" style={{ background: r.c, opacity: 0.5 + (i / 10) }} />
              ))}
            </div>
            <span className="metric-num font-semibold w-10 text-right" style={{ color: r.c }}>{r.v}</span>
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
          <span className="text-pulse-cyan/60 font-display font-extrabold text-sm metric-num">{f.index}</span>
          <span className="h-px w-10 bg-pulse-cyan/30" />
          <span className="text-xs uppercase tracking-[0.2em] text-pulse-muted">{f.sub}</span>
        </div>
        <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display text-pulse-text mb-5">
          {f.title}
        </h3>
        <p className="text-pulse-text2 text-lg leading-relaxed max-w-lg">{f.body}</p>
        <Link to="/features" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-pulse-cyan hover:text-pulse-cyan/80 transition-colors">
          Learn more <ChevronRight className="h-4 w-4" />
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
    <div className="glass-obs rounded-2xl p-6">
      <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-pulse-muted mb-4">Active visitors by country</div>
      <div className="space-y-4">
        {TOP_LOCATIONS.map((r) => (
          <div key={r.label}>
            <div className="flex items-center justify-between text-sm mb-1.5">
              <span className="text-pulse-text">{r.label}</span>
              <span className="metric-num font-semibold text-pulse-text">{r.value}</span>
            </div>
            <div className="h-2.5 rounded-full bg-white/[0.06] overflow-hidden">
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
    <div className="glass-obs rounded-2xl p-6">
      <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-pulse-muted mb-5">Visitor flow</div>
      <div className="relative pl-4">
        {levels.map((l, i) => (
          <div key={l} className="relative pb-8 last:pb-0">
            {i < levels.length - 1 && (
              <span className="absolute left-[13px] top-6 bottom-0 w-px bg-white/[0.12]" />
            )}
            <span className="absolute left-0 top-1 flex h-3.5 w-3.5 items-center justify-center">
              <span className="absolute h-2 w-2 rounded-full bg-pulse-cyan/40 animate-pulse" />
              <span className="relative h-1.5 w-1.5 rounded-full" style={{ background: i === 3 ? '#48E6A1' : '#35D7FF' }} />
            </span>
            <div className="flex items-center justify-between ml-7">
              <span className="text-sm text-pulse-text">{l}</span>
              <span className="metric-num text-xs text-pulse-muted">{70 + i * 8 - i * i * 3}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AcqVisual() {
  const rows = [
    { l: 'Google', v: 42, c: '#35D7FF' },
    { l: 'Direct', v: 26, c: '#8B7CFF' },
    { l: 'LinkedIn', v: 14, c: '#48E6A1' },
    { l: 'YouTube', v: 9, c: '#FFB84D' },
    { l: 'Other', v: 9, c: '#5F6875' },
  ];
  return (
    <div className="glass-obs rounded-2xl p-6">
      <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-pulse-muted mb-5">Where visitors come from</div>
      {rows.map((r) => (
        <div key={r.l} className="flex items-center gap-3 py-2">
          <span className="w-20 text-sm text-pulse-text">{r.l}</span>
          <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${r.v}%`, background: r.c }}
            />
          </div>
          <span className="metric-num text-sm font-semibold w-10 text-right" style={{ color: r.c }}>{r.v}%</span>
        </div>
      ))}
    </div>
  );
}

function PipelineVisual() {
  const steps = ['Visitors', 'Events', 'Patterns', 'Insights', 'Decisions'];
  return (
    <div className="glass-obs rounded-2xl p-6">
      <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-pulse-muted mb-5">Intelligence pipeline</div>
      <div className="flex flex-col items-center gap-1">
        {steps.map((s, i) => (
          <React.Fragment key={s}>
            <div
              className="w-full max-w-[260px] rounded-xl px-4 py-3 text-center text-sm font-semibold"
              style={{
                background: i === steps.length - 1
                  ? 'linear-gradient(135deg,rgba(72,230,161,0.15),rgba(72,230,161,0.05))'
                  : 'rgba(53,215,255,0.07)',
                border: `1px solid ${i === steps.length - 1 ? 'rgba(72,230,161,0.4)' : 'rgba(53,215,255,0.2)'}`,
                color: i === steps.length - 1 ? '#48E6A1' : '#35D7FF',
              }}
            >
              {s}
            </div>
            {i < steps.length - 1 && <ArrowDown className="h-4 w-4 text-pulse-muted my-0.5" />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function PricingSection() {
  const plans = [
    { name: 'Starter', price: '$0', tagline: 'For personal projects', pro: false, features: ['1 project', '1,000 events/mo', 'Basic analytics', '60s refresh'] },
    { name: 'Pro', price: '$12', tagline: 'For growing websites', pro: true, features: ['15 projects', '500k events/mo', 'Live activity logs', '1s refresh', 'Priority support'] },
    { name: 'Business', price: '$39', tagline: 'For serious analytics', pro: false, features: ['Unlimited projects', '5M events/mo', 'Real-time / SLA', 'Team access'] },
  ];
  return (
    <section className="relative z-10 py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-14" data-reveal>
        <p className="eyebrow-obs mb-4">Pricing</p>
        <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight font-display text-pulse-text">
          Simple plans. <span className="bg-gradient-to-r from-pulse-cyan to-pulse-violet bg-clip-text text-transparent">Serious analytics.</span>
        </h2>
      </div>
      <div className="grid md:grid-cols-3 gap-6 items-center">
        {plans.map((p) => (
          <div key={p.name} data-reveal
            className={`relative rounded-2xl p-8 ${p.pro
              ? 'bg-[#0E141B] border border-pulse-cyan/40 md:-translate-y-3'
              : 'glass-obs border border-white/[0.08]'}`}
            style={p.pro ? { boxShadow: '0 0 0 1px rgba(53,215,255,0.3), 0 20px 60px -20px rgba(53,215,255,0.4)' } : {}}>
            {p.pro && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest"
                style={{ background: 'linear-gradient(135deg,#35D7FF,#8B7CFF)', color: '#07111c' }}>
                Most popular
              </div>
            )}
            <h3 className="text-sm font-semibold uppercase tracking-wider text-pulse-text2 mb-2">{p.name}</h3>
            <div className="flex items-baseline gap-1 mb-1">
              <span className={`text-4xl font-extrabold font-display ${p.pro ? 'text-pulse-cyan' : 'text-pulse-text'}`}>{p.price}</span>
              <span className="text-pulse-muted text-sm">/mo</span>
            </div>
            <p className="text-sm text-pulse-muted mb-6">{p.tagline}</p>
            <ul className="space-y-3 mb-8">
              {p.features.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-pulse-text2">
                  <Check className="h-4 w-4 text-pulse-green shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <Link to="/register" className={p.pro ? 'btn-signal btn-md w-full' : 'btn-ghost-dark btn-md w-full'}>
              {p.name === 'Starter' ? 'Get Started' : `Choose ${p.name}`}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
