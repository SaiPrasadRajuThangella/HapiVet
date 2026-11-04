import ScrollTone from '../components/ScrollTone';
import Hero from '../sections/Hero';
import Agents from '../sections/Agents';
import Features from '../sections/Features';
import Achievements from '../sections/Achievements';
import Platform from '../sections/Platform';
import { Compare, DemoCTA, FeatureRequests, Integrations, Onboarding, Trust, Why } from '../sections/More';

export default function Home() {
  return (
    <>
      <ScrollTone />
      <Hero />
      <Trust />
      <Agents />
      <Features />
      <Platform />
      <Achievements />
      <Why />
      <Integrations />
      <Compare />
      <Onboarding />
      <FeatureRequests />
      <DemoCTA />
    </>
  );
}
