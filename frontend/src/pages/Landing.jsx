import MarketingShell from '../components/marketing/MarketingShell';
import Hero from '../components/landing/Hero';
import StackBand from '../components/landing/StackBand';
import Capabilities from '../components/landing/Capabilities';
import LiveMap from '../components/landing/LiveMap';
import Setup from '../components/landing/Setup';
import Trust from '../components/landing/Trust';
import PricingTeaser from '../components/landing/PricingTeaser';
import FinalCta from '../components/landing/FinalCta';

export default function Landing() {
  return (
    <MarketingShell tone="hero">
      <Hero />
      <StackBand />
      <Capabilities />
      <LiveMap />
      <Setup />
      <Trust />
      <PricingTeaser />
      <FinalCta />
    </MarketingShell>
  );
}
