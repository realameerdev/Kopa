import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { KopaLogo } from '../KopaLogo';
import { 
  Shield, 
  Lock, 
  FileText, 
  ArrowLeft, 
  ArrowRight, 
  Mail, 
  Globe, 
  BookOpen, 
  CheckCircle2, 
  AlertTriangle,
  Server,
  Key,
  Database,
  Cpu
} from 'lucide-react';

interface LegalPagesProps {
  type: 'privacy' | 'terms' | 'security';
  onBackToHome: () => void;
  onNavigateTo: (type: 'privacy' | 'terms' | 'security') => void;
}

export const LegalPage: React.FC<LegalPagesProps> = ({ type, onBackToHome, onNavigateTo }) => {
  const { isDark } = useTheme();

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentYear = new Date().getFullYear();

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-200 ${
        isDark ? 'bg-[#07111F] text-[#F8FBFF]' : 'bg-[#F7FAFC] text-[#0F172A]'
      }`}
    >
      {/* Top Navbar */}
      <header
        className={`sticky top-0 z-50 w-full border-b backdrop-blur-xl transition-all duration-200 ${
          isDark
            ? 'bg-[#07111F]/95 border-[#243B56] shadow-[0_4px_24px_rgba(0,0,0,0.4)]'
            : 'bg-[#F7FAFC]/95 border-[#DCE6F0] shadow-[0_4px_20px_rgba(0,0,0,0.05)]'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            <button
              onClick={onBackToHome}
              className="flex items-center group focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:outline-none rounded-lg p-1 transition-transform active:scale-95 shrink-0"
              aria-label="Kopa Home"
            >
              <KopaLogo variant="full" theme={isDark ? 'dark' : 'light'} size="md" />
            </button>

            <button
              onClick={onBackToHome}
              className={`inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold transition-colors duration-150 px-3.5 py-2 rounded-xl border focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:outline-none cursor-pointer ${
                isDark
                  ? 'border-[#243B56] text-[#D5E2F0] hover:text-[#F8FBFF] hover:bg-white/5'
                  : 'border-[#DCE6F0] text-[#0F172A] hover:bg-black/5'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Page Layout */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Sidebar quick links */}
          <aside className="lg:col-span-3 sticky top-24 space-y-4">
            <div
              className={`p-5 rounded-2xl border transition-all ${
                isDark ? 'bg-[#0D1B2E] border-[#243B56]' : 'bg-white border-[#DCE6F0] shadow-xs'
              }`}
            >
              <h3 className={`text-xs font-mono font-semibold uppercase tracking-wider mb-4 ${isDark ? 'text-[#9FB1C5]' : 'text-[#64748B]'}`}>
                Kopa Documents
              </h3>
              
              <nav className="space-y-1" aria-label="Legal document selection">
                <button
                  onClick={() => { onNavigateTo('privacy'); handleScrollToTop(); }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center gap-2.5 text-sm font-medium cursor-pointer ${
                    type === 'privacy'
                      ? 'bg-[#2563EB] text-white dark:bg-[#3B82F6]'
                      : isDark
                      ? 'text-[#D5E2F0] hover:text-white hover:bg-white/5'
                      : 'text-[#475569] hover:text-[#0F172A] hover:bg-black/5'
                  }`}
                >
                  <Lock className="w-4 h-4 shrink-0" />
                  <span>Privacy Policy</span>
                </button>

                <button
                  onClick={() => { onNavigateTo('terms'); handleScrollToTop(); }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center gap-2.5 text-sm font-medium cursor-pointer ${
                    type === 'terms'
                      ? 'bg-[#2563EB] text-white dark:bg-[#3B82F6]'
                      : isDark
                      ? 'text-[#D5E2F0] hover:text-white hover:bg-white/5'
                      : 'text-[#475569] hover:text-[#0F172A] hover:bg-black/5'
                  }`}
                >
                  <FileText className="w-4 h-4 shrink-0" />
                  <span>Terms of Service</span>
                </button>

                <button
                  onClick={() => { onNavigateTo('security'); handleScrollToTop(); }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center gap-2.5 text-sm font-medium cursor-pointer ${
                    type === 'security'
                      ? 'bg-[#2563EB] text-white dark:bg-[#3B82F6]'
                      : isDark
                      ? 'text-[#D5E2F0] hover:text-white hover:bg-white/5'
                      : 'text-[#475569] hover:text-[#0F172A] hover:bg-black/5'
                  }`}
                >
                  <Shield className="w-4 h-4 shrink-0" />
                  <span>Security Whitepaper</span>
                </button>
              </nav>
            </div>

            {/* Quick Contact Widget */}
            <div
              className={`p-5 rounded-2xl border transition-all ${
                isDark ? 'bg-[#0D1B2E] border-[#243B56] text-[#D5E2F0]' : 'bg-[#EAF2FF] border-[#DCE6F0] text-[#0F3B82]'
              }`}
            >
              <div className="flex items-center gap-2 mb-2 font-heading font-semibold text-sm">
                <Mail className="w-4 h-4" />
                <span>Contact Legal & Security</span>
              </div>
              <p className="text-xs leading-relaxed mb-3 opacity-90">
                Have specific concerns regarding privacy compliance, acceptable usage, or security vulnerabilities?
              </p>
              <a
                href="mailto:support@kopa.so"
                className={`text-xs font-mono font-bold hover:underline ${isDark ? 'text-[#60A5FA]' : 'text-[#2563EB]'}`}
              >
                support@kopa.so
              </a>
            </div>
          </aside>

          {/* Right Column: Main Rich Content Area */}
          <article
            className={`lg:col-span-9 p-6 sm:p-10 rounded-3xl border transition-all ${
              isDark ? 'bg-[#0D1B2E] border-[#243B56]' : 'bg-white border-[#DCE6F0] shadow-sm'
            }`}
          >
            {/* Header Stamp */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-6 mb-8 gap-4 border-inherit">
              <div>
                <div className={`text-[10px] font-mono uppercase tracking-widest ${isDark ? 'text-[#60A5FA]' : 'text-[#2563EB]'}`}>
                  Kopa Public Repository
                </div>
                <h1 className="text-2xl sm:text-4xl font-heading font-semibold mt-1 tracking-tight">
                  {type === 'privacy' && 'Privacy Policy'}
                  {type === 'terms' && 'Terms of Service'}
                  {type === 'security' && 'Security Whitepaper'}
                </h1>
              </div>
              <div className="text-left sm:text-right shrink-0">
                <span className={`text-[11px] font-mono px-2.5 py-1 rounded-full font-semibold border ${
                  isDark ? 'bg-[#102B4D] border-[#243B56] text-[#60A5FA]' : 'bg-[#EAF2FF] border-[#DCE6F0] text-[#0F3B82]'
                }`}>
                  Last Updated: September 27, 2026
                </span>
              </div>
            </div>

            {/* Document Content Renderers */}
            <div className="prose dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed space-y-8 font-sans">
              
              {/* PRIVACY POLICY CONTENT */}
              {type === 'privacy' && (
                <>
                  <section className="space-y-4">
                    <p className={isDark ? 'text-[#D5E2F0]' : 'text-[#475569]'}>
                      At Kopa (referred to as "Kopa," "we," "us," or "our"), your trust and commercial confidentiality are the foundations of our product. This Privacy Policy details how we collect, process, isolate, and safeguard your data when you interact with Kopa, our conversational business operating assistant, and our authenticated dashboard ledger.
                    </p>
                  </section>

                  <section className="space-y-4 pt-4 border-t border-inherit">
                    <h2 className="text-xl font-heading font-semibold flex items-center gap-2">
                      <Database className="w-5 h-5 text-[#2563EB] dark:text-[#60A5FA]" />
                      <span>1. Commercial Data Collection</span>
                    </h2>
                    <p className={isDark ? 'text-[#D5E2F0]' : 'text-[#475569]'}>
                      To run your business ledger by simply talking to it, Kopa must receive and index data points regarding your active trade transactions. We compile the following information:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-sm">
                      <li>
                        <strong>Natural Language Inputs:</strong> Voice notes and text query messages sent directly to "Ask Kopa" conversational interfaces (such as our in-app chatbot and future WhatsApp endpoints).
                      </li>
                      <li>
                        <strong>Business Profile Records:</strong> Company name, category/industry, hub country, default currency symbol, and optional business details configured during the initial onboarding questionnaire or edited within Settings.
                      </li>
                      <li>
                        <strong>Commercial Ledger Data:</strong> Information you explicitly approve or add, including customer records, sales transactions, product inventory counts, unit cost boundaries (COGS), operating expenses, and payment status updates.
                      </li>
                      <li>
                        <strong>Core Account Identity:</strong> Email address, unique identifier (UID), and display names securely registered through Firebase Authentication.
                      </li>
                    </ul>
                  </section>

                  <section className="space-y-4 pt-6 border-t border-inherit">
                    <h2 className="text-xl font-heading font-semibold flex items-center gap-2">
                      <Cpu className="w-5 h-5 text-[#2563EB] dark:text-[#60A5FA]" />
                      <span>2. AI Parsing & Gemini Processing Boundary</span>
                    </h2>
                    <p className={isDark ? 'text-[#D5E2F0]' : 'text-[#475569]'}>
                      Kopa integrates with the advanced Gemini 3.8 Flash model via our secure Express-powered backend connector gateway to convert plain-language sentences into structured double-entry ledger commands.
                    </p>
                    <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#102B4D]/30 border-[#243B56]' : 'bg-amber-50/70 border-amber-200'}`}>
                      <div className="flex items-start gap-2.5 text-xs sm:text-sm">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block font-semibold">Strict Zero-Training AI Boundaries:</strong>
                          Kopa transmits plain-language prompts strictly on a single-turn, query-only lifecycle. Raw customer databases, bank credentials, and confidential personal identification are *never* transmitted, and none of your business data is utilized to train public artificial intelligence models.
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-4 pt-6 border-t border-inherit">
                    <h2 className="text-xl font-heading font-semibold flex items-center gap-2">
                      <Server className="w-5 h-5 text-[#2563EB] dark:text-[#60A5FA]" />
                      <span>3. Cloud Storage & Firebase Architecture</span>
                    </h2>
                    <p className={isDark ? 'text-[#D5E2F0]' : 'text-[#475569]'}>
                      All commercial ledgers and business profiles are persistently hosted in Google Cloud Firebase Firestore databases. Your unique UID, generated by Firebase Authentication upon sign-up, is tied to every record, restricting visibility and preventing cross-merchant exposure. See our Security Whitepaper for details on how Firestore Security Rules prevent unauthorized data access.
                    </p>
                  </section>

                  <section className="space-y-4 pt-6 border-t border-inherit">
                    <h2 className="text-xl font-heading font-semibold flex items-center gap-2">
                      <Key className="w-5 h-5 text-[#2563EB] dark:text-[#60A5FA]" />
                      <span>4. Third-Party App Connectors (OAuth & API Keys)</span>
                    </h2>
                    <p className={isDark ? 'text-[#D5E2F0]' : 'text-[#475569]'}>
                      Kopa allows you to synchronize transactions from Shopify, Stripe, Meta, Slack, or QuickBooks. 
                    </p>
                    <p className={isDark ? 'text-[#D5E2F0]' : 'text-[#475569]'}>
                      API credentials and OAuth access tokens are handled *exclusively on our server-side store* and are never transmitted to or cached within client-side local browsers. The frontend only displays masked status tags (e.g. <code>••••5523</code>) to protect your access.
                    </p>
                  </section>

                  <section className="space-y-4 pt-6 border-t border-inherit">
                    <h2 className="text-xl font-heading font-semibold flex items-center gap-2">
                      <Globe className="w-5 h-5 text-[#2563EB] dark:text-[#60A5FA]" />
                      <span>5. Cookies & Browsing Settings</span>
                    </h2>
                    <p className={isDark ? 'text-[#D5E2F0]' : 'text-[#475569]'}>
                      We do not utilize telemetry trackers or third-party ad networks. We limit local storage and cookies strictly to standard technical settings:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li>Persistent authorization state managed directly by Firebase SDKs.</li>
                      <li>Local selection of Light Mode vs Dark Mode visual themes.</li>
                      <li>Selected translation languages for conversational interfaces.</li>
                    </ul>
                  </section>

                  <section className="space-y-4 pt-6 border-t border-inherit">
                    <h2 className="text-xl font-heading font-semibold flex items-center gap-2">
                      <Lock className="w-5 h-5 text-[#2563EB] dark:text-[#60A5FA]" />
                      <span>6. Data Control and Deletion Rights</span>
                    </h2>
                    <p className={isDark ? 'text-[#D5E2F0]' : 'text-[#475569]'}>
                      You retain full control over your trade data. If you decide to close your business ledger with Kopa, you can request full erasure. Upon confirmation, Kopa wipes all corresponding business setup documents, recent activity logs, and product directories permanently from Google Cloud Firestore.
                    </p>
                  </section>
                </>
              )}

              {/* TERMS OF SERVICE CONTENT */}
              {type === 'terms' && (
                <>
                  <section className="space-y-4">
                    <p className={isDark ? 'text-[#D5E2F0]' : 'text-[#475569]'}>
                      Welcome to Kopa. By registering an account, integrating your messaging apps, or opening our ledger workspace, you (referred to as the "User," "Merchant," or "Business Owner") agree to comply with and be bound by these Terms of Service. Please read them thoroughly before proceeding.
                    </p>
                  </section>

                  <section className="space-y-4 pt-4 border-t border-inherit">
                    <h2 className="text-xl font-heading font-semibold flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-[#2563EB] dark:text-[#60A5FA]" />
                      <span>1. Purpose of Service</span>
                    </h2>
                    <p className={isDark ? 'text-[#D5E2F0]' : 'text-[#475569]'}>
                      Kopa is a software-as-a-service commercial operating platform developed to simplify bookkeeping and build commercial credibility for African businesses. Kopa provides plain-language transaction parsers, ledger databases, and portability tools (such as the Kopa Business Passport).
                    </p>
                    <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#102B4D]/30 border-[#243B56]' : 'bg-[#EAF2FF] border-[#DCE6F0]'}`}>
                      <div className="flex items-start gap-2.5 text-xs sm:text-sm">
                        <AlertTriangle className="w-5 h-5 text-[#2563EB] dark:text-[#60A5FA] shrink-0 mt-0.5" />
                        <div>
                          <strong className="block font-semibold">Important Financial Disclaimer:</strong>
                          Kopa is a data management tool. Kopa does not provide certified financial audits, legal tax declarations, CPA statements, or banking facilities. Merchants are entirely responsible for their accurate ledger filings and tax declarations in their respective jurisdictions.
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-4 pt-6 border-t border-inherit">
                    <h2 className="text-xl font-heading font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-[#2563EB] dark:text-[#60A5FA]" />
                      <span>2. Acceptable Use and Merchant Conduct</span>
                    </h2>
                    <p className={isDark ? 'text-[#D5E2F0]' : 'text-[#475569]'}>
                      Merchants must use Kopa strictly for authorized business tracking. You agree not to:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-sm">
                      <li>Log fraudulent transactions, artificially inflate revenue data, or invent fake customer profiles to obtain falsified Kopa Business Passports.</li>
                      <li>Submit any toxic, abusive, or automated malware payloads through the conversational "Ask Kopa" prompt inputs.</li>
                      <li>Attempt to breach the data tenant boundary to inspect the database indices of other registered Kopa merchants.</li>
                    </ul>
                  </section>

                  <section className="space-y-4 pt-6 border-t border-inherit">
                    <h2 className="text-xl font-heading font-semibold flex items-center gap-2">
                      <Cpu className="w-5 h-5 text-[#2563EB] dark:text-[#60A5FA]" />
                      <span>3. AI Verification and Draft Confirmations</span>
                    </h2>
                    <p className={isDark ? 'text-[#D5E2F0]' : 'text-[#475569]'}>
                      Kopa uses generative and deterministic algorithms to parse commands. To safeguard financial integrity, Kopa operates on a **"Draft and Approve"** standard. The system drafts a structured confirmation card based on your input, but **no transaction is officially written to the database until the owner explicitly clicks "Record" or "Approve"**.
                    </p>
                    <p className={isDark ? 'text-[#D5E2F0]' : 'text-[#475569]'}>
                      We are not liable for computational errors in cost calculations or transaction records if you approved a draft card containing inaccurate metrics.
                    </p>
                  </section>

                  <section className="space-y-4 pt-6 border-t border-inherit">
                    <h2 className="text-xl font-heading font-semibold flex items-center gap-2">
                      <Server className="w-5 h-5 text-[#2563EB] dark:text-[#60A5FA]" />
                      <span>4. Service Availability, Backups & Integrations</span>
                    </h2>
                    <p className={isDark ? 'text-[#D5E2F0]' : 'text-[#475569]'}>
                      While Kopa relies on Google Cloud Firebase's robust server infrastructure (providing near-instantaneous uptime), we do not guarantee uninterrupted availability. We are not liable for connectivity issues affecting external third-party API providers like Shopify, QuickBooks, Slack, or Stripe.
                    </p>
                  </section>

                  <section className="space-y-4 pt-6 border-t border-inherit">
                    <h2 className="text-xl font-heading font-semibold flex items-center gap-2">
                      <Lock className="w-5 h-5 text-[#2563EB] dark:text-[#60A5FA]" />
                      <span>5. Termination and Ledger Portability</span>
                    </h2>
                    <p className={isDark ? 'text-[#D5E2F0]' : 'text-[#475569]'}>
                      We reserve the right to suspend accounts engaged in systematic commercial fraud or security attacks. You may download your ledger records anytime or request complete deletion of your workspace data.
                    </p>
                  </section>

                  <section className="space-y-4 pt-6 border-t border-inherit">
                    <h2 className="text-xl font-heading font-semibold flex items-center gap-2">
                      <Globe className="w-5 h-5 text-[#2563EB] dark:text-[#60A5FA]" />
                      <span>6. Governing Jurisdiction</span>
                    </h2>
                    <p className={isDark ? 'text-[#D5E2F0]' : 'text-[#475569]'}>
                      These Terms of Service are governed by and construed in accordance with the laws of the Federal Republic of Nigeria, without giving effect to any principles of conflicts of law.
                    </p>
                  </section>
                </>
              )}

              {/* SECURITY WHITEPAPER CONTENT */}
              {type === 'security' && (
                <>
                  <section className="space-y-4">
                    <p className={isDark ? 'text-[#D5E2F0]' : 'text-[#475569]'}>
                      Kopa processes natural-language bookkeeping requests into formal commercial ledger structures. This Security Whitepaper outlines the mechanisms, access control guidelines, and backend architecture we deploy to protect your records from tampering and unauthorized disclosure.
                    </p>
                  </section>

                  <section className="space-y-6 pt-4 border-t border-inherit">
                    <h2 className="text-xl font-heading font-semibold flex items-center gap-2">
                      <Server className="w-5 h-5 text-[#2563EB] dark:text-[#60A5FA]" />
                      <span>1. Secure Hybrid Architecture</span>
                    </h2>
                    <p className={isDark ? 'text-[#D5E2F0]' : 'text-[#475569]'}>
                      Kopa is built on a high-availability, sandboxed cloud stack consisting of two distinct protection zones:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#102B4D]/30 border-[#243B56]' : 'bg-white border-[#DCE6F0]'}`}>
                        <span className="font-heading font-semibold block text-xs uppercase tracking-wider mb-1 text-[#2563EB] dark:text-[#60A5FA]">
                          Zone A: Client SDKs
                        </span>
                        <p className="text-xs leading-relaxed">
                          Standard data displays and live subscription listeners interface directly with secure Google Cloud Firebase endpoints, avoiding complex middle-hops.
                        </p>
                      </div>
                      <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#102B4D]/30 border-[#243B56]' : 'bg-white border-[#DCE6F0]'}`}>
                        <span className="font-heading font-semibold block text-xs uppercase tracking-wider mb-1 text-[#2563EB] dark:text-[#60A5FA]">
                          Zone B: Server Gateway
                        </span>
                        <p className="text-xs leading-relaxed">
                          Intelligent operations (Gemini AI queries, OAuth token storage, Slack webhooks) execute on an isolated Express.js backend behind HTTPS/TLS channels.
                        </p>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-4 pt-6 border-t border-inherit">
                    <h2 className="text-xl font-heading font-semibold flex items-center gap-2">
                      <Key className="w-5 h-5 text-[#2563EB] dark:text-[#60A5FA]" />
                      <span>2. Cryptographic Authentication & Token Lifecycle</span>
                    </h2>
                    <p className={isDark ? 'text-[#D5E2F0]' : 'text-[#475569]'}>
                      User identity is verified through Firebase Authentication. Upon log-in, Firebase issues a cryptographically signed identity token. This token automatically refreshes and contains claims validating the business owner's unique ID. High-risk actions (such as setting up connectors or reading sensitive logs) require valid tokens passed over secure HTTP authorization headers.
                    </p>
                  </section>

                  <section className="space-y-4 pt-6 border-t border-inherit">
                    <h2 className="text-xl font-heading font-semibold flex items-center gap-2">
                      <Lock className="w-5 h-5 text-[#2563EB] dark:text-[#60A5FA]" />
                      <span>3. Firestore Security Rules and Tenant Isolation</span>
                    </h2>
                    <p className={isDark ? 'text-[#D5E2F0]' : 'text-[#475569]'}>
                      We enforce rigorous data separation. Our Firestore database is governed by server-enforced security rules. Every transaction, product, and expense document is indexed by the business owner's verified UID.
                    </p>
                    <div className={`p-4 rounded-xl border font-mono text-xs ${isDark ? 'bg-[#07111F] border-[#243B56] text-[#60A5FA]' : 'bg-[#F7FAFC] border-[#DCE6F0] text-[#0F3B82]'}`}>
                      {`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /businesses/{businessId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.ownerId;
    }
    match /transactions/{txId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.ownerId;
    }
  }
}`}
                    </div>
                  </section>

                  <section className="space-y-4 pt-6 border-t border-inherit">
                    <h2 className="text-xl font-heading font-semibold flex items-center gap-2">
                      <Shield className="w-5 h-5 text-[#2563EB] dark:text-[#60A5FA]" />
                      <span>4. Server-Side Token & Secrets Storage</span>
                    </h2>
                    <p className={isDark ? 'text-[#D5E2F0]' : 'text-[#475569]'}>
                      A core vulnerability in many merchant portals is exposing 3P connection keys to client browsers. Kopa permanently isolates these tokens. Slack webhook secrets, Meta app configurations, and QuickBooks refresh tokens are kept strictly on our server memory registry and processed via secure backend-to-backend calls.
                    </p>
                  </section>

                  <section className="space-y-4 pt-6 border-t border-inherit">
                    <h2 className="text-xl font-heading font-semibold flex items-center gap-2">
                      <Cpu className="w-5 h-5 text-[#2563EB] dark:text-[#60A5FA]" />
                      <span>5. AI Isolation and Safety Safeguards</span>
                    </h2>
                    <p className={isDark ? 'text-[#D5E2F0]' : 'text-[#475569]'}>
                      Our Gemini AI API configuration restricts parsing actions strictly to context translation. Prompt configurations utilize comprehensive negative boundaries to prevent jailbreaking or data retrieval scripts. Prompt queries are entirely transient and do not persist in generative caches.
                    </p>
                  </section>

                  <section className="space-y-4 pt-6 border-t border-inherit">
                    <h2 className="text-xl font-heading font-semibold flex items-center gap-2">
                      <Globe className="w-5 h-5 text-[#2563EB] dark:text-[#60A5FA]" />
                      <span>6. Continuous Protection Practices</span>
                    </h2>
                    <p className={isDark ? 'text-[#D5E2F0]' : 'text-[#475569]'}>
                      We employ continuous monitoring:
                    </p>
                    <ul className="list-disc pl-5 space-y-1.5 text-sm">
                      <li>Strict HTTPS configuration enforcing TLS 1.3 across all client-server endpoints.</li>
                      <li>Secure CORS origin filters restricting backend API calls strictly to registered Kopa domains.</li>
                      <li>Comprehensive lint and type-checking tests run upon every deployment pipeline step.</li>
                    </ul>
                  </section>
                </>
              )}

            </div>

            {/* Document Footer Navigation */}
            <div className={`mt-12 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4 border-inherit text-xs font-sans ${
              isDark ? 'text-[#9FB1C5]' : 'text-[#64748B]'
            }`}>
              <div className="flex items-center gap-2">
                <span>© {currentYear} Kopa Technologies Ltd.</span>
                <span>·</span>
                <span>All documents cryptographically verified</span>
              </div>
              <button
                onClick={handleScrollToTop}
                className={`font-semibold hover:underline cursor-pointer ${isDark ? 'text-[#60A5FA]' : 'text-[#2563EB]'}`}
              >
                Back to Top ↑
              </button>
            </div>
          </article>

        </div>
      </main>
    </div>
  );
};
