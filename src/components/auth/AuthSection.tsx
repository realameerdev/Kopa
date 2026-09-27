import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  CheckCircle2,
  ArrowRight,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Building,
  AlertCircle,
  Loader2,
  Globe,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';
import { KopaLogo } from '../KopaLogo';
import { ThemeToggle } from '../ThemeToggle';
import { useTheme } from '../../context/ThemeContext';
import { useAuth, AuthMode } from '../../context/AuthContext';
import { BusinessSetupQuestionnaire } from './BusinessSetupQuestionnaire';

export const AuthSection: React.FC = () => {
  const { isDark } = useTheme();
  const {
    currentAuthMode,
    openAuth,
    closeAuth,
    openDashboard,
    pendingUser,
    resetEmail,
    setResetEmail,
    completeSignup,
    completeOnboarding,
    loginUser,
    signInWithGoogle,
    resetPassword,
    currentUser,
    isLoading,
    authError,
    unauthorizedDomain,
    firebaseProjectId,
    clearDomainError,
  } = useAuth();

  // Sign up form state
  const [signUpData, setSignUpData] = useState({
    fullName: '',
    businessName: '',
    email: '',
    password: '',
  });
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [signupErrors, setSignupErrors] = useState<Record<string, string>>({});

  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginErrors, setLoginErrors] = useState<Record<string, string>>({});
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Forgot password form state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotError, setForgotError] = useState('');

  // Password reset code state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetErrors, setResetErrors] = useState<Record<string, string>>({});

  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState(false);

  if (!currentAuthMode) return null;

  // Validation helpers
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Google sign in click handler
  const handleGoogleAuth = async () => {
    setSignupErrors({});
    setLoginErrors({});
    await signInWithGoogle();
  };

  const handleCopyDomain = () => {
    if (unauthorizedDomain) {
      navigator.clipboard.writeText(unauthorizedDomain);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2500);
    }
  };

  // Sign up submit
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!signUpData.fullName.trim()) errors.fullName = 'Full name is required';
    if (!signUpData.businessName.trim()) errors.businessName = 'Business name is required';
    if (!signUpData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!validateEmail(signUpData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!signUpData.password) {
      errors.password = 'Password is required';
    } else if (signUpData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(errors).length > 0) {
      setSignupErrors(errors);
      return;
    }

    setSignupErrors({});
    await completeSignup({
      fullName: signUpData.fullName.trim(),
      businessName: signUpData.businessName.trim(),
      email: signUpData.email.trim(),
      password: signUpData.password,
    });
  };

  // Login submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!loginData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!validateEmail(loginData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!loginData.password) {
      errors.password = 'Password is required';
    }

    if (Object.keys(errors).length > 0) {
      setLoginErrors(errors);
      return;
    }

    setLoginErrors({});
    const success = await loginUser(loginData.email.trim(), loginData.password);
    if (success) {
      setLoginSuccess(true);
    }
  };

  // Forgot password submit
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setForgotError('Please enter your email address');
      return;
    }
    if (!validateEmail(forgotEmail.trim())) {
      setForgotError('Please enter a valid email address');
      return;
    }

    setForgotError('');
    const res = await resetPassword(forgotEmail.trim());
    if (res.success) {
      setResetEmail(forgotEmail.trim());
      setForgotMessage(res.message);
      setForgotSubmitted(true);
    }
  };

  // Password reset submit
  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!newPassword) {
      errors.newPassword = 'New password is required';
    } else if (newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
    }
    if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) {
      setResetErrors(errors);
      return;
    }

    setResetErrors({});
    setResetSuccess(true);
  };

  // Reusable Google "G" Icon
  const GoogleIcon = () => (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );

  return (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto min-h-screen flex flex-col transition-colors duration-200 ${
        isDark ? 'bg-[#08110F] text-white' : 'bg-[#F7F6F0] text-[#111916]'
      }`}
    >
      {/* Background ambient gradient glow */}
      <div
        className={`fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[360px] rounded-full blur-[140px] pointer-events-none ${
          isDark ? 'bg-[#B8F36B]/5' : 'bg-[#B8F36B]/12'
        }`}
      />

      {/* Top Navigation Bar */}
      <header
        className={`sticky top-0 z-10 w-full border-b backdrop-blur-xl transition-colors ${
          isDark ? 'bg-[#08110F]/85 border-[#1A2E27]' : 'bg-[#F7F6F0]/85 border-[#DEE3DE]'
        }`}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button
            type="button"
            onClick={closeAuth}
            className={`inline-flex items-center gap-2 text-xs sm:text-sm font-medium transition-colors cursor-pointer px-2.5 py-1.5 rounded-lg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#B8F36B] ${
              isDark ? 'text-slate-300 hover:text-white' : 'text-[#69746F] hover:text-[#111916]'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to home</span>
          </button>

          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              closeAuth();
            }}
            className="flex items-center"
            aria-label="Kopa Home"
          >
            <KopaLogo variant="full" theme={isDark ? 'dark' : 'light'} size="sm" />
          </a>

          <ThemeToggle size="sm" />
        </div>
      </header>

      {/* Main Authentication Flow Container */}
      <main className="flex-1 flex items-center justify-center p-3 sm:p-6 lg:p-8">
        <div
          className={`w-full my-auto transition-all duration-300 ${
            currentAuthMode === 'onboarding' ? 'max-w-2xl' : 'max-w-md'
          }`}
        >
          <AnimatePresence mode="wait">
            {/* 1. SIGN UP VIEW */}
            {currentAuthMode === 'signup' && (
              <motion.div
                key="signup"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className={`rounded-2xl border p-6 sm:p-8 shadow-xl ${
                  isDark
                    ? 'bg-[#10251E]/50 border-[#1A2E27] shadow-black/40'
                    : 'bg-white border-[#DEE3DE] shadow-black/5'
                }`}
              >
                <div className="mb-6 text-left">
                  <h1
                    className={`text-2xl sm:text-[26px] font-heading font-medium tracking-tight mb-2 ${
                      isDark ? 'text-white' : 'text-[#111916]'
                    }`}
                  >
                    Create your account
                  </h1>
                  <p className="text-sm font-normal text-[#69746F] dark:text-slate-400">
                    Start running your business by simply talking to it.
                  </p>
                </div>

                {/* Unauthorized Domain Helper Card */}
                {unauthorizedDomain && (
                  <div className="mb-5 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs">
                    <div className="flex items-center justify-between gap-2 font-semibold text-amber-500 dark:text-amber-400 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <Globe className="w-4 h-4 shrink-0" />
                        <span>Firebase Authentication Setup Required</span>
                      </div>
                      <button
                        type="button"
                        onClick={clearDomainError}
                        className="text-slate-400 hover:text-white text-[11px] font-medium cursor-pointer"
                      >
                        ✕ Dismiss
                      </button>
                    </div>
                    <p className="text-[#69746F] dark:text-slate-300 leading-relaxed mb-2.5">
                      To allow Google Sign-In on this applet URL, add this exact hostname in Firebase:
                    </p>
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-black/10 dark:bg-black/40 border border-amber-500/20 mb-3 font-mono text-[11px]">
                      <span className="truncate flex-1 select-all">{unauthorizedDomain}</span>
                      <button
                        type="button"
                        onClick={handleCopyDomain}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500 text-black font-semibold rounded-lg text-[10px] hover:bg-amber-400 transition-colors shrink-0 cursor-pointer"
                      >
                        {copiedDomain ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedDomain ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <div className="space-y-1 text-[11.5px] text-[#69746F] dark:text-slate-400 mb-3">
                      <p>
                        1. Open{' '}
                        <a
                          href={`https://console.firebase.google.com/project/${firebaseProjectId}/authentication/settings`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#B8F36B] hover:underline font-semibold inline-flex items-center gap-0.5"
                        >
                          Firebase Authentication Settings <ExternalLink className="w-3 h-3" />
                        </a>
                      </p>
                      <p>2. Scroll down to <strong>Authorized domains</strong> &gt; Click <strong>Add domain</strong> &gt; Paste hostname.</p>
                      <p>
                        3. Also verify that <strong>Google</strong> is enabled under{' '}
                        <a
                          href={`https://console.firebase.google.com/project/${firebaseProjectId}/authentication/providers`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#B8F36B] hover:underline font-semibold inline-flex items-center gap-0.5"
                        >
                          Sign-in method <ExternalLink className="w-3 h-3" />
                        </a>
                      </p>
                    </div>
                    <div className="pt-2 border-t border-amber-500/20 text-[11px] text-[#69746F] dark:text-slate-400">
                      💡 <em>Tip: You can always create an account or sign in directly with Email & Password below.</em>
                    </div>
                  </div>
                )}

                {authError && !unauthorizedDomain && (
                  <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-500 dark:text-red-400 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{authError}</span>
                  </div>
                )}

                {/* Google Sign In Option */}
                <div className="mb-5">
                  <button
                    type="button"
                    onClick={handleGoogleAuth}
                    disabled={isLoading}
                    className={`w-full min-h-[44px] flex items-center justify-center gap-3 py-2.5 px-4 text-xs sm:text-sm font-medium rounded-xl border transition-all cursor-pointer ${
                      isDark
                        ? 'bg-[#08110F] hover:bg-[#152e25] border-[#1C382E] text-white hover:border-[#B8F36B]/40'
                        : 'bg-white hover:bg-slate-50 border-[#DEE3DE] text-[#111916] hover:border-black/30'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#B8F36B]" />
                    ) : (
                      <GoogleIcon />
                    )}
                    <span>Continue with Google</span>
                  </button>

                  <div className="relative my-5">
                    <div className="absolute inset-0 flex items-center">
                      <div
                        className={`w-full border-t ${
                          isDark ? 'border-[#1A2E27]' : 'border-[#DEE3DE]'
                        }`}
                      />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span
                        className={`px-2.5 ${
                          isDark
                            ? 'bg-[#10251E] text-slate-400'
                            : 'bg-white text-[#69746F]'
                        }`}
                      >
                        or continue with email
                      </span>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSignUpSubmit} noValidate className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label
                      htmlFor="signup-fullname"
                      className="block text-xs font-medium mb-1.5 text-[#111916] dark:text-slate-200"
                    >
                      Full name
                    </label>
                    <div className="relative">
                      <input
                        id="signup-fullname"
                        type="text"
                        autoComplete="name"
                        value={signUpData.fullName}
                        onChange={(e) => {
                          setSignUpData({ ...signUpData, fullName: e.target.value });
                          if (signupErrors.fullName) setSignupErrors({ ...signupErrors, fullName: '' });
                        }}
                        placeholder="Amina Bello"
                        className={`w-full px-3.5 py-2.5 rounded-xl text-sm transition-colors outline-none border ${
                          signupErrors.fullName
                            ? 'border-red-500/80 focus:ring-1 focus:ring-red-500'
                            : isDark
                            ? 'bg-[#08110F] border-[#1C382E] text-white placeholder-slate-500 focus:border-[#B8F36B] focus:ring-1 focus:ring-[#B8F36B]'
                            : 'bg-[#F7F6F0]/70 border-[#DEE3DE] text-[#111916] placeholder-slate-400 focus:border-[#10251E] focus:ring-1 focus:ring-[#10251E]'
                        }`}
                      />
                    </div>
                    {signupErrors.fullName && (
                      <p className="text-xs text-red-500 mt-1">{signupErrors.fullName}</p>
                    )}
                  </div>

                  {/* Business Name */}
                  <div>
                    <label
                      htmlFor="signup-bizname"
                      className="block text-xs font-medium mb-1.5 text-[#111916] dark:text-slate-200"
                    >
                      Business name
                    </label>
                    <div className="relative">
                      <input
                        id="signup-bizname"
                        type="text"
                        autoComplete="organization"
                        value={signUpData.businessName}
                        onChange={(e) => {
                          setSignUpData({ ...signUpData, businessName: e.target.value });
                          if (signupErrors.businessName) setSignupErrors({ ...signupErrors, businessName: '' });
                        }}
                        placeholder="Amina Fashion & Fabrics"
                        className={`w-full px-3.5 py-2.5 rounded-xl text-sm transition-colors outline-none border ${
                          signupErrors.businessName
                            ? 'border-red-500/80 focus:ring-1 focus:ring-red-500'
                            : isDark
                            ? 'bg-[#08110F] border-[#1C382E] text-white placeholder-slate-500 focus:border-[#B8F36B] focus:ring-1 focus:ring-[#B8F36B]'
                            : 'bg-[#F7F6F0]/70 border-[#DEE3DE] text-[#111916] placeholder-slate-400 focus:border-[#10251E] focus:ring-1 focus:ring-[#10251E]'
                        }`}
                      />
                    </div>
                    {signupErrors.businessName && (
                      <p className="text-xs text-red-500 mt-1">{signupErrors.businessName}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="signup-email"
                      className="block text-xs font-medium mb-1.5 text-[#111916] dark:text-slate-200"
                    >
                      Email address
                    </label>
                    <div className="relative">
                      <input
                        id="signup-email"
                        type="email"
                        autoComplete="email"
                        value={signUpData.email}
                        onChange={(e) => {
                          setSignUpData({ ...signUpData, email: e.target.value });
                          if (signupErrors.email) setSignupErrors({ ...signupErrors, email: '' });
                        }}
                        placeholder="amina@fashion.ng"
                        className={`w-full px-3.5 py-2.5 rounded-xl text-sm transition-colors outline-none border ${
                          signupErrors.email
                            ? 'border-red-500/80 focus:ring-1 focus:ring-red-500'
                            : isDark
                            ? 'bg-[#08110F] border-[#1C382E] text-white placeholder-slate-500 focus:border-[#B8F36B] focus:ring-1 focus:ring-[#B8F36B]'
                            : 'bg-[#F7F6F0]/70 border-[#DEE3DE] text-[#111916] placeholder-slate-400 focus:border-[#10251E] focus:ring-1 focus:ring-[#10251E]'
                        }`}
                      />
                    </div>
                    {signupErrors.email && (
                      <p className="text-xs text-red-500 mt-1">{signupErrors.email}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label
                      htmlFor="signup-password"
                      className="block text-xs font-medium mb-1.5 text-[#111916] dark:text-slate-200"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="signup-password"
                        type={showSignupPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        value={signUpData.password}
                        onChange={(e) => {
                          setSignUpData({ ...signUpData, password: e.target.value });
                          if (signupErrors.password) setSignupErrors({ ...signupErrors, password: '' });
                        }}
                        placeholder="At least 6 characters"
                        className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl text-sm transition-colors outline-none border ${
                          signupErrors.password
                            ? 'border-red-500/80 focus:ring-1 focus:ring-red-500'
                            : isDark
                            ? 'bg-[#08110F] border-[#1C382E] text-white placeholder-slate-500 focus:border-[#B8F36B] focus:ring-1 focus:ring-[#B8F36B]'
                            : 'bg-[#F7F6F0]/70 border-[#DEE3DE] text-[#111916] placeholder-slate-400 focus:border-[#10251E] focus:ring-1 focus:ring-[#10251E]'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer p-0.5"
                        aria-label={showSignupPassword ? 'Hide password' : 'Show password'}
                      >
                        {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {signupErrors.password && (
                      <p className="text-xs text-red-500 mt-1">{signupErrors.password}</p>
                    )}
                  </div>

                  {/* Submit CTA */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full min-h-[44px] flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold text-[#08110F] bg-[#B8F36B] hover:bg-[#A5E852] active:bg-[#97D844] rounded-xl transition-all shadow-sm shadow-[#B8F36B]/20 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8F36B] disabled:opacity-60"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-[#08110F]" />
                      ) : (
                        <>
                          <span>Create account</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Footer link to Log in */}
                <div className="mt-6 pt-5 border-t border-[#DEE3DE] dark:border-[#1A2E27] text-center">
                  <p className="text-xs text-[#69746F] dark:text-slate-400">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => openAuth('login')}
                      className="font-medium text-[#111916] dark:text-[#B8F36B] hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#B8F36B] rounded px-1"
                    >
                      Log in
                    </button>
                  </p>
                </div>
              </motion.div>
            )}

            {/* 2. BUSINESS ONBOARDING FLOW (Post Signup) */}
            {currentAuthMode === 'onboarding' && (
              <motion.div
                key="onboarding"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="w-full max-w-xl mx-auto px-2 sm:px-0"
              >
                {!onboardingCompleted ? (
                  <BusinessSetupQuestionnaire
                    businessName={pendingUser?.businessName || currentUser?.businessName || 'Your Business'}
                    defaultCategory="Retail & General Merchant"
                    defaultCountry="Nigeria"
                    defaultCurrency="NGN"
                    isLoading={isLoading}
                    onComplete={async (data) => {
                      await completeOnboarding(data);
                      setOnboardingCompleted(true);
                    }}
                  />
                ) : (
                  <div
                    className={`rounded-2xl border p-6 sm:p-8 shadow-xl text-center py-8 ${
                      isDark
                        ? 'bg-[#10251E]/90 border-[#1A2E27] shadow-black/40'
                        : 'bg-white border-[#DEE3DE] shadow-black/5'
                    }`}
                  >
                    <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center bg-[#B8F36B]/20 text-[#B8F36B]">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <h1
                      className={`text-2xl sm:text-3xl font-heading font-semibold tracking-tight mb-2 ${
                        isDark ? 'text-white' : 'text-[#111916]'
                      }`}
                    >
                      Congratulations, you are in.
                    </h1>
                    <p className="text-sm text-[#69746F] dark:text-slate-400 mb-6">
                      Your business profile and personalized intelligence ledger have been successfully initialized.
                    </p>

                    {/* Summary Identity Card */}
                    <div
                      className={`p-4 rounded-xl border text-left mb-6 text-xs space-y-2.5 ${
                        isDark ? 'bg-[#08110F] border-[#1C382E]' : 'bg-[#F7F6F0] border-[#DEE3DE]'
                      }`}
                    >
                      <div className="flex justify-between items-center py-0.5">
                        <span className="text-[#69746F] dark:text-slate-400">Business</span>
                        <span className="font-semibold">{currentUser?.businessName}</span>
                      </div>
                      <div className="flex justify-between items-center py-0.5">
                        <span className="text-[#69746F] dark:text-slate-400">Category</span>
                        <span className="font-medium">{currentUser?.businessCategory}</span>
                      </div>
                      <div className="flex justify-between items-center py-0.5">
                        <span className="text-[#69746F] dark:text-slate-400">Country</span>
                        <span className="font-medium">{currentUser?.country}</span>
                      </div>
                      <div className="flex justify-between items-center py-0.5">
                        <span className="text-[#69746F] dark:text-slate-400">Currency</span>
                        <span className="font-mono text-[#B8F36B] dark:text-[#B8F36B] bg-[#10251E] px-2 py-0.5 rounded">
                          {currentUser?.currency} ({currentUser?.currencySymbol || '₦'})
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={openDashboard}
                      className="w-full min-h-[46px] flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold text-[#08110F] bg-[#B8F36B] hover:bg-[#A5E852] rounded-xl transition-all shadow-sm shadow-[#B8F36B]/25 cursor-pointer"
                    >
                      <span>Enter Kopa Workspace</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* 3. LOG IN VIEW */}
            {currentAuthMode === 'login' && (
              <motion.div
                key="login"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className={`rounded-2xl border p-6 sm:p-8 shadow-xl ${
                  isDark
                    ? 'bg-[#10251E]/50 border-[#1A2E27] shadow-black/40'
                    : 'bg-white border-[#DEE3DE] shadow-black/5'
                }`}
              >
                {!loginSuccess ? (
                  <>
                    <div className="mb-6 text-left">
                      <h1
                        className={`text-2xl sm:text-[26px] font-heading font-medium tracking-tight mb-2 ${
                          isDark ? 'text-white' : 'text-[#111916]'
                        }`}
                      >
                        Welcome back
                      </h1>
                      <p className="text-sm font-normal text-[#69746F] dark:text-slate-400">
                        Sign in to access your business activity and intelligence.
                      </p>
                    </div>

                    {/* Unauthorized Domain Helper Card */}
                    {unauthorizedDomain && (
                      <div className="mb-5 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs">
                        <div className="flex items-center justify-between gap-2 font-semibold text-amber-500 dark:text-amber-400 mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <Globe className="w-4 h-4 shrink-0" />
                            <span>Firebase Authentication Setup Required</span>
                          </div>
                          <button
                            type="button"
                            onClick={clearDomainError}
                            className="text-slate-400 hover:text-white text-[11px] font-medium cursor-pointer"
                          >
                            ✕ Dismiss
                          </button>
                        </div>
                        <p className="text-[#69746F] dark:text-slate-300 leading-relaxed mb-2.5">
                          To allow Google Sign-In on this applet URL, add this exact hostname in Firebase:
                        </p>
                        <div className="flex items-center gap-2 p-2 rounded-xl bg-black/10 dark:bg-black/40 border border-amber-500/20 mb-3 font-mono text-[11px]">
                          <span className="truncate flex-1 select-all">{unauthorizedDomain}</span>
                          <button
                            type="button"
                            onClick={handleCopyDomain}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500 text-black font-semibold rounded-lg text-[10px] hover:bg-amber-400 transition-colors shrink-0 cursor-pointer"
                          >
                            {copiedDomain ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedDomain ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <div className="space-y-1 text-[11.5px] text-[#69746F] dark:text-slate-400 mb-3">
                          <p>
                            1. Open{' '}
                            <a
                              href={`https://console.firebase.google.com/project/${firebaseProjectId}/authentication/settings`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#B8F36B] hover:underline font-semibold inline-flex items-center gap-0.5"
                            >
                              Firebase Authentication Settings <ExternalLink className="w-3 h-3" />
                            </a>
                          </p>
                          <p>2. Scroll down to <strong>Authorized domains</strong> &gt; Click <strong>Add domain</strong> &gt; Paste hostname.</p>
                          <p>
                            3. Also verify that <strong>Google</strong> is enabled under{' '}
                            <a
                              href={`https://console.firebase.google.com/project/${firebaseProjectId}/authentication/providers`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#B8F36B] hover:underline font-semibold inline-flex items-center gap-0.5"
                            >
                              Sign-in method <ExternalLink className="w-3 h-3" />
                            </a>
                          </p>
                        </div>
                        <div className="pt-2 border-t border-amber-500/20 text-[11px] text-[#69746F] dark:text-slate-400">
                          💡 <em>Tip: You can always sign in directly with Email & Password below.</em>
                        </div>
                      </div>
                    )}

                    {authError && !unauthorizedDomain && (
                      <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-500 dark:text-red-400 text-xs flex items-start gap-2.5">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{authError}</span>
                      </div>
                    )}

                    {/* Google Sign In Option */}
                    <div className="mb-5">
                      <button
                        type="button"
                        onClick={handleGoogleAuth}
                        disabled={isLoading}
                        className={`w-full min-h-[44px] flex items-center justify-center gap-3 py-2.5 px-4 text-xs sm:text-sm font-medium rounded-xl border transition-all cursor-pointer ${
                          isDark
                            ? 'bg-[#08110F] hover:bg-[#152e25] border-[#1C382E] text-white hover:border-[#B8F36B]/40'
                            : 'bg-white hover:bg-slate-50 border-[#DEE3DE] text-[#111916] hover:border-black/30'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin text-[#B8F36B]" />
                        ) : (
                          <GoogleIcon />
                        )}
                        <span>Continue with Google</span>
                      </button>

                      <div className="relative my-5">
                        <div className="absolute inset-0 flex items-center">
                          <div
                            className={`w-full border-t ${
                              isDark ? 'border-[#1A2E27]' : 'border-[#DEE3DE]'
                            }`}
                          />
                        </div>
                        <div className="relative flex justify-center text-xs">
                          <span
                            className={`px-2.5 ${
                              isDark
                                ? 'bg-[#10251E] text-slate-400'
                                : 'bg-white text-[#69746F]'
                            }`}
                          >
                            or sign in with email
                          </span>
                        </div>
                      </div>
                    </div>

                    <form onSubmit={handleLoginSubmit} noValidate className="space-y-4">
                      {/* Email */}
                      <div>
                        <label
                          htmlFor="login-email"
                          className="block text-xs font-medium mb-1.5 text-[#111916] dark:text-slate-200"
                        >
                          Email address
                        </label>
                        <div className="relative">
                          <input
                            id="login-email"
                            type="email"
                            autoComplete="email"
                            value={loginData.email}
                            onChange={(e) => {
                              setLoginData({ ...loginData, email: e.target.value });
                              if (loginErrors.email) setLoginErrors({ ...loginErrors, email: '' });
                            }}
                            placeholder="amina@fashion.ng"
                            className={`w-full px-3.5 py-2.5 rounded-xl text-sm transition-colors outline-none border ${
                              loginErrors.email
                                ? 'border-red-500/80 focus:ring-1 focus:ring-red-500'
                                : isDark
                                ? 'bg-[#08110F] border-[#1C382E] text-white placeholder-slate-500 focus:border-[#B8F36B] focus:ring-1 focus:ring-[#B8F36B]'
                                : 'bg-[#F7F6F0]/70 border-[#DEE3DE] text-[#111916] placeholder-slate-400 focus:border-[#10251E] focus:ring-1 focus:ring-[#10251E]'
                            }`}
                          />
                        </div>
                        {loginErrors.email && (
                          <p className="text-xs text-red-500 mt-1">{loginErrors.email}</p>
                        )}
                      </div>

                      {/* Password */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label
                            htmlFor="login-password"
                            className="block text-xs font-medium text-[#111916] dark:text-slate-200"
                          >
                            Password
                          </label>
                          <button
                            type="button"
                            onClick={() => openAuth('forgot-password')}
                            className="text-xs text-[#69746F] dark:text-slate-400 hover:text-[#111916] dark:hover:text-[#B8F36B] hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#B8F36B] rounded px-1"
                          >
                            Forgot password?
                          </button>
                        </div>
                        <div className="relative">
                          <input
                            id="login-password"
                            type={showLoginPassword ? 'text' : 'password'}
                            autoComplete="current-password"
                            value={loginData.password}
                            onChange={(e) => {
                              setLoginData({ ...loginData, password: e.target.value });
                              if (loginErrors.password) setLoginErrors({ ...loginErrors, password: '' });
                            }}
                            placeholder="••••••••"
                            className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl text-sm transition-colors outline-none border ${
                              loginErrors.password
                                ? 'border-red-500/80 focus:ring-1 focus:ring-red-500'
                                : isDark
                                ? 'bg-[#08110F] border-[#1C382E] text-white placeholder-slate-500 focus:border-[#B8F36B] focus:ring-1 focus:ring-[#B8F36B]'
                                : 'bg-[#F7F6F0]/70 border-[#DEE3DE] text-[#111916] placeholder-slate-400 focus:border-[#10251E] focus:ring-1 focus:ring-[#10251E]'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowLoginPassword(!showLoginPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer p-0.5"
                            aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                          >
                            {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {loginErrors.password && (
                          <p className="text-xs text-red-500 mt-1">{loginErrors.password}</p>
                        )}
                      </div>

                      {/* Submit */}
                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full min-h-[44px] flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold text-[#08110F] bg-[#B8F36B] hover:bg-[#A5E852] active:bg-[#97D844] rounded-xl transition-all shadow-sm shadow-[#B8F36B]/20 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8F36B] disabled:opacity-60"
                        >
                          {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin text-[#08110F]" />
                          ) : (
                            <>
                              <span>Sign in</span>
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </div>
                    </form>

                    {/* Footer link to Sign up */}
                    <div className="mt-6 pt-5 border-t border-[#DEE3DE] dark:border-[#1A2E27] text-center">
                      <p className="text-xs text-[#69746F] dark:text-slate-400">
                        Don't have an account yet?{' '}
                        <button
                          type="button"
                          onClick={() => openAuth('signup')}
                          className="font-medium text-[#111916] dark:text-[#B8F36B] hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#B8F36B] rounded px-1"
                        >
                          Create an account
                        </button>
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center bg-[#B8F36B]/15 text-[#B8F36B]">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h2
                      className={`text-2xl font-heading font-medium tracking-tight mb-2 ${
                        isDark ? 'text-white' : 'text-[#111916]'
                      }`}
                    >
                      Signed in successfully
                    </h2>
                    <p className="text-sm text-[#69746F] dark:text-slate-400 mb-6">
                      Welcome back, {currentUser?.fullName || loginData.email}.
                    </p>
                    <button
                      type="button"
                      onClick={openDashboard}
                      className="w-full min-h-[44px] flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold text-[#08110F] bg-[#B8F36B] hover:bg-[#A5E852] rounded-xl transition-all shadow-sm shadow-[#B8F36B]/20 cursor-pointer"
                    >
                      <span>Enter Workspace</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* 4. FORGOT PASSWORD VIEW */}
            {currentAuthMode === 'forgot-password' && (
              <motion.div
                key="forgot"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className={`rounded-2xl border p-6 sm:p-8 shadow-xl ${
                  isDark
                    ? 'bg-[#10251E]/50 border-[#1A2E27] shadow-black/40'
                    : 'bg-white border-[#DEE3DE] shadow-black/5'
                }`}
              >
                {!forgotSubmitted ? (
                  <>
                    <div className="mb-6 text-left">
                      <h1
                        className={`text-2xl sm:text-[26px] font-heading font-medium tracking-tight mb-2 ${
                          isDark ? 'text-white' : 'text-[#111916]'
                        }`}
                      >
                        Reset password
                      </h1>
                      <p className="text-sm font-normal text-[#69746F] dark:text-slate-400">
                        Enter the email associated with your account, and we will send you a password reset link.
                      </p>
                    </div>

                    {authError && (
                      <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-500 dark:text-red-400 text-xs flex items-start gap-2.5">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{authError}</span>
                      </div>
                    )}

                    <form onSubmit={handleForgotSubmit} noValidate className="space-y-4">
                      <div>
                        <label
                          htmlFor="forgot-email"
                          className="block text-xs font-medium mb-1.5 text-[#111916] dark:text-slate-200"
                        >
                          Email address
                        </label>
                        <div className="relative">
                          <input
                            id="forgot-email"
                            type="email"
                            autoComplete="email"
                            value={forgotEmail}
                            onChange={(e) => {
                              setForgotEmail(e.target.value);
                              if (forgotError) setForgotError('');
                            }}
                            placeholder="amina@fashion.ng"
                            className={`w-full px-3.5 py-2.5 rounded-xl text-sm transition-colors outline-none border ${
                              forgotError
                                ? 'border-red-500/80 focus:ring-1 focus:ring-red-500'
                                : isDark
                                ? 'bg-[#08110F] border-[#1C382E] text-white placeholder-slate-500 focus:border-[#B8F36B] focus:ring-1 focus:ring-[#B8F36B]'
                                : 'bg-[#F7F6F0]/70 border-[#DEE3DE] text-[#111916] placeholder-slate-400 focus:border-[#10251E] focus:ring-1 focus:ring-[#10251E]'
                            }`}
                          />
                        </div>
                        {forgotError && (
                          <p className="text-xs text-red-500 mt-1">{forgotError}</p>
                        )}
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full min-h-[44px] flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold text-[#08110F] bg-[#B8F36B] hover:bg-[#A5E852] active:bg-[#97D844] rounded-xl transition-all shadow-sm shadow-[#B8F36B]/20 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8F36B] disabled:opacity-60"
                        >
                          {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin text-[#08110F]" />
                          ) : (
                            <>
                              <span>Send reset link</span>
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </div>
                    </form>

                    <div className="mt-6 pt-5 border-t border-[#DEE3DE] dark:border-[#1A2E27] text-center">
                      <button
                        type="button"
                        onClick={() => openAuth('login')}
                        className="text-xs font-medium text-[#69746F] dark:text-slate-400 hover:text-[#111916] dark:hover:text-white cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#B8F36B] rounded px-1"
                      >
                        ← Back to log in
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center bg-[#B8F36B]/15 text-[#B8F36B]">
                      <Mail className="w-6 h-6" />
                    </div>
                    <h2
                      className={`text-2xl font-heading font-medium tracking-tight mb-2 ${
                        isDark ? 'text-white' : 'text-[#111916]'
                      }`}
                    >
                      Check your email
                    </h2>
                    <p className="text-sm text-[#69746F] dark:text-slate-400 mb-6">
                      {forgotMessage || `We sent a password reset link to ${forgotEmail}.`}
                    </p>

                    <button
                      type="button"
                      onClick={() => openAuth('login')}
                      className="w-full min-h-[44px] flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold text-[#08110F] bg-[#B8F36B] hover:bg-[#A5E852] rounded-xl transition-all shadow-sm shadow-[#B8F36B]/20 cursor-pointer mb-3"
                    >
                      <span>Return to log in</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* 5. PASSWORD RESET VIEW */}
            {currentAuthMode === 'reset-password' && (
              <motion.div
                key="reset"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className={`rounded-2xl border p-6 sm:p-8 shadow-xl ${
                  isDark
                    ? 'bg-[#10251E]/50 border-[#1A2E27] shadow-black/40'
                    : 'bg-white border-[#DEE3DE] shadow-black/5'
                }`}
              >
                {!resetSuccess ? (
                  <>
                    <div className="mb-6 text-left">
                      <h1
                        className={`text-2xl sm:text-[26px] font-heading font-medium tracking-tight mb-2 ${
                          isDark ? 'text-white' : 'text-[#111916]'
                        }`}
                      >
                        Set new password
                      </h1>
                      <p className="text-sm font-normal text-[#69746F] dark:text-slate-400">
                        Create a new secure password for your Kopa account.
                      </p>
                    </div>

                    <form onSubmit={handleResetSubmit} noValidate className="space-y-4">
                      {/* New Password */}
                      <div>
                        <label
                          htmlFor="new-password"
                          className="block text-xs font-medium mb-1.5 text-[#111916] dark:text-slate-200"
                        >
                          New password
                        </label>
                        <div className="relative">
                          <input
                            id="new-password"
                            type={showNewPassword ? 'text' : 'password'}
                            autoComplete="new-password"
                            value={newPassword}
                            onChange={(e) => {
                              setNewPassword(e.target.value);
                              if (resetErrors.newPassword) setResetErrors({ ...resetErrors, newPassword: '' });
                            }}
                            placeholder="At least 6 characters"
                            className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl text-sm transition-colors outline-none border ${
                              resetErrors.newPassword
                                ? 'border-red-500/80 focus:ring-1 focus:ring-red-500'
                                : isDark
                                ? 'bg-[#08110F] border-[#1C382E] text-white placeholder-slate-500 focus:border-[#B8F36B] focus:ring-1 focus:ring-[#B8F36B]'
                                : 'bg-[#F7F6F0]/70 border-[#DEE3DE] text-[#111916] placeholder-slate-400 focus:border-[#10251E] focus:ring-1 focus:ring-[#10251E]'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer p-0.5"
                            aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                          >
                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {resetErrors.newPassword && (
                          <p className="text-xs text-red-500 mt-1">{resetErrors.newPassword}</p>
                        )}
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <label
                          htmlFor="confirm-password"
                          className="block text-xs font-medium mb-1.5 text-[#111916] dark:text-slate-200"
                        >
                          Confirm new password
                        </label>
                        <div className="relative">
                          <input
                            id="confirm-password"
                            type={showNewPassword ? 'text' : 'password'}
                            autoComplete="new-password"
                            value={confirmPassword}
                            onChange={(e) => {
                              setConfirmPassword(e.target.value);
                              if (resetErrors.confirmPassword) setResetErrors({ ...resetErrors, confirmPassword: '' });
                            }}
                            placeholder="Repeat new password"
                            className={`w-full px-3.5 py-2.5 rounded-xl text-sm transition-colors outline-none border ${
                              resetErrors.confirmPassword
                                ? 'border-red-500/80 focus:ring-1 focus:ring-red-500'
                                : isDark
                                ? 'bg-[#08110F] border-[#1C382E] text-white placeholder-slate-500 focus:border-[#B8F36B] focus:ring-1 focus:ring-[#B8F36B]'
                                : 'bg-[#F7F6F0]/70 border-[#DEE3DE] text-[#111916] placeholder-slate-400 focus:border-[#10251E] focus:ring-1 focus:ring-[#10251E]'
                            }`}
                          />
                        </div>
                        {resetErrors.confirmPassword && (
                          <p className="text-xs text-red-500 mt-1">{resetErrors.confirmPassword}</p>
                        )}
                      </div>

                      {/* Submit */}
                      <div className="pt-2">
                        <button
                          type="submit"
                          className="w-full min-h-[44px] flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold text-[#08110F] bg-[#B8F36B] hover:bg-[#A5E852] active:bg-[#97D844] rounded-xl transition-all shadow-sm shadow-[#B8F36B]/20 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8F36B]"
                        >
                          <span>Save new password</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </form>

                    <div className="mt-6 pt-5 border-t border-[#DEE3DE] dark:border-[#1A2E27] text-center">
                      <button
                        type="button"
                        onClick={() => openAuth('login')}
                        className="text-xs font-medium text-[#69746F] dark:text-slate-400 hover:text-[#111916] dark:hover:text-white cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#B8F36B] rounded px-1"
                      >
                        ← Back to log in
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center bg-[#B8F36B]/15 text-[#B8F36B]">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h2
                      className={`text-2xl font-heading font-medium tracking-tight mb-2 ${
                        isDark ? 'text-white' : 'text-[#111916]'
                      }`}
                    >
                      Password updated
                    </h2>
                    <p className="text-sm text-[#69746F] dark:text-slate-400 mb-6">
                      Your password has been reset successfully. You can now log in with your new password.
                    </p>
                    <button
                      type="button"
                      onClick={() => openAuth('login')}
                      className="w-full min-h-[44px] flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold text-[#08110F] bg-[#B8F36B] hover:bg-[#A5E852] rounded-xl transition-all shadow-sm shadow-[#B8F36B]/20 cursor-pointer"
                    >
                      <span>Log in to your account</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Subtle Bottom Trust note */}
      <footer className="w-full py-4 text-center">
        <p className="text-[11.5px] font-mono uppercase tracking-wider text-[#69746F] dark:text-slate-500">
          Kopa Business Operating System · Secure Confidential Ledger
        </p>
      </footer>
    </div>
  );
};
