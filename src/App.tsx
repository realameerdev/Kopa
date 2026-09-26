import React, { useState } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SilkTransition } from './components/SilkTransition';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ProblemSection } from './components/ProblemSection';
import { HowItWorks } from './components/HowItWorks';
import { ProductShowcase } from './components/ProductShowcase';
import { BusinessPassport } from './components/BusinessPassport';
import { FinalCTA } from './components/FinalCTA';
import { ConnectedTools } from './components/ConnectedTools';
import { FAQSection } from './components/FAQSection';
import { Footer } from './components/Footer';
import { WaitlistModal } from './components/WaitlistModal';
import { AuthSection } from './components/auth/AuthSection';
import { DashboardShell } from './components/dashboard/DashboardShell';

function KopaMain() {
  const { isDark } = useTheme();
  const { currentAuthMode, openAuth, isDashboardOpen, openDashboard, closeDashboard } = useAuth();
  const [waitlistOpen, setWaitlistOpen] = useState(false);

  const handleOpenWaitlist = () => {
    setWaitlistOpen(true);
  };

  const handleCloseWaitlist = () => {
    setWaitlistOpen(false);
  };

  // Authenticated Business Workspace
  if (isDashboardOpen) {
    return <DashboardShell onBackToLanding={closeDashboard} />;
  }

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-200 overflow-x-hidden ${
        isDark
          ? 'bg-[#08110F] text-white selection:bg-[#B8F36B]/30 selection:text-white'
          : 'bg-[#F7F6F0] text-[#111916] selection:bg-[#B8F36B]/40 selection:text-[#08110F]'
      }`}
    >
      {/* Silk Wave Transition Animation Layer */}
      <SilkTransition />

      {/* Top Bar Navigation */}
      <Navbar
        onOpenWaitlist={handleOpenWaitlist}
        onOpenAuth={(mode) => openAuth(mode)}
        onOpenDashboard={openDashboard}
      />

      {/* Main Sections */}
      <main className="flex-1">
        {/* Section 1: Hero */}
        <Hero onOpenWaitlist={() => openAuth('signup')} />

        {/* Section 2: Problem & Convergence */}
        <ProblemSection />

        {/* Section 3: How It Works */}
        <HowItWorks />

        {/* Section 4: Product Showcase (Dashboard & Conversational Assistant) */}
        <ProductShowcase />

        {/* Section 5: Business Passport */}
        <BusinessPassport />

        {/* Section 6: Final CTA */}
        <FinalCTA onOpenWaitlist={() => openAuth('signup')} />

        {/* Continuously Floating Ecosystem of 10 Connector Logos */}
        <ConnectedTools />

        {/* FAQ Section: Security, Privacy & Integrations */}
        <FAQSection onOpenWaitlist={handleOpenWaitlist} />
      </main>

      {/* Quiet Footer */}
      <Footer onOpenWaitlist={() => openAuth('signup')} />

      {/* Early Access Modal */}
      <WaitlistModal isOpen={waitlistOpen} onClose={handleCloseWaitlist} />

      {/* Dedicated Kopa Authentication & Business Onboarding Experience */}
      {currentAuthMode && <AuthSection />}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <KopaMain />
      </AuthProvider>
    </ThemeProvider>
  );
}
