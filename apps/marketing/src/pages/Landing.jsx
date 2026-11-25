import MarketingShell from '../components/marketing/MarketingShell';
import Hero from '../components/landing/Hero';
import ProductPreview from '../components/landing/ProductPreview';
import PlatformFeatures from '../components/landing/PlatformFeatures';
import Capabilities from '../components/landing/Capabilities';
import Architecture from '../components/landing/Architecture';
import DeveloperIntegration from '../components/landing/DeveloperIntegration';
import UseCases from '../components/landing/UseCases';
import PricingTeaser from '../components/landing/PricingTeaser';
import LandingFaq from '../components/landing/LandingFaq';
import FinalCta from '../components/landing/FinalCta';

export default function Landing() {
  return (
    <MarketingShell tone="hero" grid>
      <Hero />
      <ProductPreview />
      <PlatformFeatures />
      <Capabilities />
      <Architecture />
      <DeveloperIntegration />
      <UseCases />
      <PricingTeaser />
      <LandingFaq />
      <FinalCta />
    </MarketingShell>
  );
}
