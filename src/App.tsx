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
import { LegalPage } from './components/legal/LegalPages';

function KopaMain() {
  const { isDark } = useTheme();
  const { currentAuthMode, openAuth, isDashboardOpen, openDashboard, closeDashboard } = useAuth();
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname);

  React.useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenWaitlist = () => {
    setWaitlistOpen(true);
  };

  const handleCloseWaitlist = () => {
    setWaitlistOpen(false);
  };

  // Public Legal / Document Pages View Route
  if (currentPath === '/privacy' || currentPath === '/terms' || currentPath === '/security') {
    const type = currentPath.substring(1) as 'privacy' | 'terms' | 'security';
    return (
      <LegalPage
        type={type}
        onBackToHome={() => navigateTo('/')}
        onNavigateTo={(newType) => navigateTo('/' + newType)}
      />
    );
  }

  // Authenticated Business Workspace
  if (isDashboardOpen) {
    return <DashboardShell onBackToLanding={closeDashboard} />;
  }

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-200 overflow-x-hidden ${
        isDark
          ? 'bg-[#07111F] text-[#F8FBFF] selection:bg-[#2563EB]/30 selection:text-white'
          : 'bg-[#F7FAFC] text-[#0F172A] selection:bg-[#2563EB]/20 selection:text-[#0F3B82]'
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
        <Hero
          onOpenWaitlist={() => openAuth('signup')}
          onOpenDashboard={openDashboard}
        />

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
      <Footer onOpenWaitlist={() => openAuth('signup')} onNavigateTo={navigateTo} />

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
