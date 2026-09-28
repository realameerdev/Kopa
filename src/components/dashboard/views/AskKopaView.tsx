import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  Receipt,
  Users,
  Package,
  Clock,
  ShieldCheck,
  Layers,
  Terminal,
  ExternalLink,
  Plus,
  Copy,
  Check,
  RotateCcw,
  Mic,
  MicOff,
  CornerDownLeft,
  ChevronDown,
  Globe,
  MessageSquare,
  History,
  Trash2,
  X,
  Volume2,
  VolumeX,
  Square,
  Edit3,
  DollarSign,
  Send,
  Zap,
  Bot,
  User,
  CreditCard,
  CheckCheck,
} from 'lucide-react';
import { db, Product, Customer, Transaction, ChatSession, ChatMessageData } from '../../../lib/db';
import { useTheme } from '../../../context/ThemeContext';

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  speechCode: string;
}

const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', speechCode: 'en-NG' },
  { code: 'ha', name: 'Hausa', nativeName: 'Harshen Hausa', flag: '🇳🇬', speechCode: 'ha-NG' },
  { code: 'yo', name: 'Yoruba', nativeName: 'Èdè Yorùbá', flag: '🇳🇬', speechCode: 'yo-NG' },
  { code: 'ig', name: 'Igbo', nativeName: 'Asụsụ Igbo', flag: '🇳🇬', speechCode: 'ig-NG' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', flag: '🇰🇪', speechCode: 'sw-KE' },
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ', flag: '🇪🇹', speechCode: 'am-ET' },
];

export const AskKopaView: React.FC = () => {
  const { isDark } = useTheme();
  const settings = db.getSettings();
  const currencySymbol = settings.currencySymbol || '₦';

  // Selected Language (default English, saved per user)
  const [selectedLanguage, setSelectedLanguage] = useState<string>(() => {
    return localStorage.getItem('kopa_chat_language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('kopa_chat_language', selectedLanguage);
  }, [selectedLanguage]);

  // Chat Sessions & Active Session State
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);

  // Messages in Active Conversation
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  // Live real-time ledger metrics for prompt suggestions & welcome HUD
  const [metrics, setMetrics] = useState(() => db.getMetrics(30));
  const [products, setProducts] = useState<Product[]>(() => db.getProducts());
  const [customers, setCustomers] = useState<Customer[]>(() => db.getCustomers());

  // Mutex Lock for preventing Duplicate API Calls & Duplicate Messages
  const sendingLockRef = useRef<boolean>(false);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingFeedback, setRecordingFeedback] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync DB state
  useEffect(() => {
    const unsub = db.subscribe(() => {
      setMetrics(db.getMetrics(30));
      setProducts(db.getProducts());
      setCustomers(db.getCustomers());
      const sessions = db.getChatSessions();
      setChatSessions(sessions);
      if (activeSessionId) {
        const session = db.getChatSession(activeSessionId);
        if (session) {
          setMessages(session.messages);
        }
      }
    });

    return () => unsub();
  }, [activeSessionId]);

  // Load chat sessions on mount and initialize default session if needed
  useEffect(() => {
    const initialSessions = db.getChatSessions();
    setChatSessions(initialSessions);

    if (initialSessions.length > 0) {
      if (!activeSessionId || !initialSessions.some((s) => s.id === activeSessionId)) {
        setActiveSessionId(initialSessions[0].id);
        setMessages(initialSessions[0].messages);
        setSelectedLanguage(initialSessions[0].language || 'en');
      }
    } else {
      // Create default welcome session
      const newSession = db.createChatSession(`Business Operations Assistant`, selectedLanguage);
      const welcomeMsg: ChatMessageData = {
        id: 'welcome',
        sender: 'kopa',
        text: `Hello ${settings.ownerName || 'Merchant'}! I am Kopa AI, powered by Google's latest Gemini AI models and connected directly to your ${settings.businessName} live enterprise ledger.\n\nYou can ask me financial questions, check customer debts, analyze profits, or dictate business transactions naturally (e.g., "I sold 3 shirts for ${currencySymbol}45,000 to Alhaji Yusuf"). I will automatically formulate structured action drafts for your confirmation before committing to Firestore.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      db.addChatMessageToSession(newSession.id, welcomeMsg);
      setActiveSessionId(newSession.id);
      setMessages([welcomeMsg]);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  // Text-To-Speech (TTS) Reader
  const handleToggleSpeak = (msgId: string, text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === selectedLanguage);
    if (langObj?.speechCode) {
      utterance.lang = langObj.speechCode;
    }
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  // Create New Chat Session
  const handleNewChat = () => {
    window.speechSynthesis?.cancel();
    setSpeakingMsgId(null);
    const newSession = db.createChatSession('New Business Chat', selectedLanguage);
    const welcomeMsg: ChatMessageData = {
      id: `welcome-${Date.now()}`,
      sender: 'kopa',
      text: `New conversation started for ${settings.businessName}. How can I assist you with sales, expenses, inventory, or customer debts today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    db.addChatMessageToSession(newSession.id, welcomeMsg);
    setActiveSessionId(newSession.id);
    setMessages([welcomeMsg]);
    setHistoryDrawerOpen(false);
  };

  // Delete Chat Session
  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    db.deleteChatSession(id);
    const remaining = db.getChatSessions();
    setChatSessions(remaining);
    if (remaining.length > 0) {
      setActiveSessionId(remaining[0].id);
      setMessages(remaining[0].messages);
    } else {
      handleNewChat();
    }
  };

  // Speech Recognition / Voice Input Handler
  const startVoiceRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setRecordingFeedback('Speech recognition is not supported in this browser. Please type your prompt.');
      setTimeout(() => setRecordingFeedback(null), 4000);
      return;
    }

    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === selectedLanguage);
      recognition.lang = langObj?.speechCode || 'en-NG';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsRecording(true);
        setRecordingFeedback(`Listening in ${langObj?.name || 'English'}... Speak now!`);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInput(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition notice:', event.error);
        setIsRecording(false);
        setRecordingFeedback(`Voice input note: ${event.error || 'Could not process audio'}`);
        setTimeout(() => setRecordingFeedback(null), 3000);
      };

      recognition.onend = () => {
        setIsRecording(false);
        setRecordingFeedback(null);
      };

      recognition.start();
    } catch (e: any) {
      console.warn('Speech recognition exception:', e);
      setIsRecording(false);
    }
  };

  // Execute Action Draft upon User Confirmation (Commits to Firestore & DB)
  const handleConfirmActionDraft = (msgId: string, draft: any) => {
    if (!draft || !draft.type || draft.type === 'none') return;

    if (draft.type === 'record_sale' && draft.amount > 0) {
      db.addTransaction({
        type: 'sale',
        title: draft.title || `Sale Recorded via Kopa AI`,
        amount: draft.amount,
        quantity: draft.quantity || 1,
        productName: draft.productName || 'General Sale',
        customerName: draft.customerName,
        status: 'completed',
        category: draft.category || 'Sales',
        notes: draft.notes || 'Recorded via Kopa AI Voice/Text Draft',
        date: new Date().toISOString(),
      });
    } else if ((draft.type === 'record_debt' || draft.type === 'add_debt') && draft.amount > 0) {
      const custName = draft.customerName || draft.title || 'Customer';
      db.addCustomer({
        name: custName,
        phone: draft.notes || 'Contact via Kopa',
        outstandingBalance: draft.amount,
      });
      db.addTransaction({
        type: 'debt',
        title: `Debt Recorded: ${custName}`,
        amount: draft.amount,
        customerName: custName,
        status: 'pending',
        category: 'Customer Credit',
        notes: `Outstanding debt recorded via Kopa AI`,
        date: new Date().toISOString(),
      });
    } else if (draft.type === 'record_expense' && draft.amount > 0) {
      db.addTransaction({
        type: 'expense',
        title: draft.title || `Expense Recorded via Kopa AI`,
        amount: draft.amount,
        status: 'completed',
        category: draft.category || 'Operating Expense',
        notes: draft.notes || 'Expense recorded via Kopa AI',
        date: new Date().toISOString(),
      });
    } else if (draft.type === 'record_payment' && draft.amount > 0) {
      db.addTransaction({
        type: 'payment',
        title: draft.title || `Debt Payment Received`,
        amount: draft.amount,
        customerName: draft.customerName,
        status: 'completed',
        category: 'Customer Payments',
        notes: 'Debt payment recorded via Kopa AI',
        date: new Date().toISOString(),
      });
    } else if (draft.type === 'add_product' && draft.productName) {
      db.addProduct({
        name: draft.productName,
        category: draft.category || 'General',
        sellingPrice: draft.amount || 0,
        costPrice: null,
        stock: draft.quantity || 10,
        minStockAlert: 3,
      });
    }

    // Mark message as confirmed in state & DB
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, confirmed: true } : m))
    );

    if (activeSessionId) {
      const session = db.getChatSession(activeSessionId);
      if (session) {
        const msg = session.messages.find((m) => m.id === msgId);
        if (msg) msg.confirmed = true;
        db.addChatMessageToSession(activeSessionId, {
          id: `sys-${Date.now()}`,
          sender: 'kopa',
          text: `✓ Action confirmed and recorded in your live enterprise ledger and Firestore. Dashboard metrics have updated.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
      }
    }
  };

  // Handle Send Message
  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isProcessing || sendingLockRef.current || !activeSessionId) return;

    sendingLockRef.current = true;
    setIsProcessing(true);

    const userMsgId = `user-${Date.now()}`;
    const userMessage: ChatMessageData = {
      id: userMsgId,
      sender: 'user',
      text,
      language: selectedLanguage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Save to single source of truth in DB session
    db.addChatMessageToSession(activeSessionId, userMessage);
    setMessages((prev) => {
      if (prev.some((m) => m.id === userMsgId)) return prev;
      return [...prev, userMessage];
    });

    setInput('');

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const currentMetrics = db.getMetrics(30);
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          message: text,
          language: selectedLanguage,
          businessContext: {
            businessName: settings.businessName,
            category: settings.category,
            country: settings.country,
            currency: settings.currency,
            currencySymbol,
            metrics: currentMetrics,
            products: db.getProducts().slice(0, 15),
            customers: db.getCustomers().slice(0, 15),
          },
          chatHistory: messages.slice(-8),
        }),
      });

      const data = await res.json();

      const assistantMsgId = `kopa-${Date.now()}`;
      const kopaMessage: ChatMessageData = {
        id: assistantMsgId,
        sender: 'kopa',
        text: data.replyText || 'I have analyzed your request against your business records.',
        language: selectedLanguage,
        candidateAction: data.actionDraft || undefined,
        confirmed: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      db.addChatMessageToSession(activeSessionId, kopaMessage);
      setMessages((prev) => {
        if (prev.some((m) => m.id === assistantMsgId)) return prev;
        return [...prev, kopaMessage];
      });
    } catch (err: any) {
      if (err.name === 'AbortError') return;

      console.warn('AI chat request notice:', err);
      const fallbackId = `kopa-err-${Date.now()}`;
      const fallbackMsg: ChatMessageData = {
        id: fallbackId,
        sender: 'kopa',
        text: `I received your message. You can manage and review your real-time ledger entries directly on your dashboard.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      db.addChatMessageToSession(activeSessionId, fallbackMsg);
      setMessages((prev) => {
        if (prev.some((m) => m.id === fallbackId)) return prev;
        return [...prev, fallbackMsg];
      });
    } finally {
      setIsProcessing(false);
      sendingLockRef.current = false;
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsProcessing(false);
      sendingLockRef.current = false;
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const selectedLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === selectedLanguage) || SUPPORTED_LANGUAGES[0];

  // Quick prompt cards categorized for high clarity
  const quickActions = [
    {
      category: 'Sales & Incomes',
      icon: TrendingUp,
      prompts: [
        `I sold 3 shirts for ${currencySymbol}45,000 to Madam Joy`,
        `How much total revenue did we make this month?`,
      ],
    },
    {
      category: 'Debts & Receivables',
      icon: Users,
      prompts: [
        `Who owes me money and what are their balances?`,
        `Alhaji Yusuf is owing me ${currencySymbol}50,000 for supplies`,
      ],
    },
    {
      category: 'Expenses & Costs',
      icon: Receipt,
      prompts: [
        `I spent ${currencySymbol}12,500 on generator fuel and logistics`,
        `What is my estimated gross profit for the last 30 days?`,
      ],
    },
    {
      category: 'Stock & Inventory',
      icon: Package,
      prompts: [
        `Which products are running low in stock?`,
        `Add 20 cartons of vegetable oil to inventory`,
      ],
    },
  ];

  const debtorsCount = customers.filter((c) => (c.outstandingBalance || 0) > 0).length;
  const lowStockCount = products.filter((p) => p.stock <= (p.minStockAlert || 5)).length;

  return (
    <div className="h-full flex flex-col min-h-0 relative bg-[#F7FAFC] dark:bg-[#07111F] text-[#0F172A] dark:text-[#F8FBFF] overflow-hidden">
      {/* 
        1. TOP CONTROLS & MODEL BADGE BAR (Premium Blue & White Silk)
      */}
      <div className="shrink-0 px-4 py-3 sm:px-6 sm:py-3.5 border-b border-[#DCE6F0] dark:border-[#243B56] bg-white/95 dark:bg-[#0D1B2E]/95 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 z-20">
        {/* Left: Model Name & Realtime Engine Status */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#2563EB] to-[#60A5FA] flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-heading font-bold text-[#0F172A] dark:text-white tracking-tight">
                Ask Kopa AI
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Google Gemini 3.8 Flash</span>
              </span>
            </div>
            <div className="text-[11px] text-[#64748B] dark:text-[#9FB1C5] flex items-center gap-1.5">
              <span>{settings.businessName}</span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Live Ledger Connected</span>
            </div>
          </div>
        </div>

        {/* Right: History, New Chat, Language Switcher */}
        <div className="flex items-center gap-2">
          {/* History Drawer Toggle */}
          <button
            type="button"
            onClick={() => setHistoryDrawerOpen(!historyDrawerOpen)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#DCE6F0] dark:border-[#243B56] bg-white dark:bg-[#132640] text-xs font-semibold text-[#0F172A] dark:text-[#F8FBFF] hover:bg-[#EAF2FF] dark:hover:bg-[#102B4D] cursor-pointer transition-colors shadow-2xs"
            title="Chat History"
          >
            <History className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#60A5FA]" />
            <span className="hidden sm:inline">History</span>
            <span className="px-1.5 py-0.2 rounded bg-[#2563EB]/10 dark:bg-[#60A5FA]/20 text-[10px] font-mono font-bold text-[#2563EB] dark:text-[#60A5FA]">
              {chatSessions.length}
            </span>
          </button>

          {/* New Chat Button */}
          <button
            type="button"
            onClick={handleNewChat}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#2563EB] dark:bg-[#3B82F6] text-white text-xs font-semibold hover:bg-[#1D4ED8] dark:hover:bg-[#2563EB] cursor-pointer shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Chat</span>
          </button>

          {/* Language Selector Dropdown */}
          <div className="relative">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className={`pl-3 pr-8 py-1.5 rounded-xl border text-xs font-semibold outline-none cursor-pointer appearance-none ${
                isDark ? 'bg-[#0D1B2E] border-[#243B56] text-[#F8FBFF]' : 'bg-white border-[#DCE6F0] text-[#0F172A] shadow-2xs'
              }`}
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className={isDark ? 'bg-[#07111F]' : 'bg-white'}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#64748B] dark:text-[#9FB1C5]" />
          </div>
        </div>
      </div>

      {/* 
        2. CHAT HISTORY DRAWER
      */}
      <AnimatePresence>
        {historyDrawerOpen && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute top-14 bottom-0 left-0 w-72 z-30 border-r border-[#DCE6F0] dark:border-[#243B56] bg-white dark:bg-[#0D1B2E] p-4 flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE6F0] dark:border-[#243B56] mb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA]" />
                <span className="text-xs font-heading font-semibold">Conversations</span>
              </div>
              <button
                type="button"
                onClick={() => setHistoryDrawerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-[#0F172A] dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {chatSessions.map((s) => {
                const isActive = s.id === activeSessionId;
                return (
                  <div
                    key={s.id}
                    onClick={() => {
                      setActiveSessionId(s.id);
                      setMessages(s.messages);
                      setSelectedLanguage(s.language || 'en');
                      setHistoryDrawerOpen(false);
                    }}
                    className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-colors ${
                      isActive
                        ? 'bg-[#EAF2FF] dark:bg-[#102B4D] border-[#2563EB]/40 dark:border-[#60A5FA]/40 font-semibold text-[#2563EB] dark:text-[#60A5FA]'
                        : isDark
                        ? 'border-[#243B56] hover:bg-[#132640] text-[#D5E2F0]'
                        : 'border-[#DCE6F0] hover:bg-[#EAF2FF]/50 text-[#0F172A]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <MessageSquare className="w-3.5 h-3.5 shrink-0 text-[#2563EB] dark:text-[#60A5FA]" />
                      <span className="truncate">{s.title || 'Conversation'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteSession(s.id, e)}
                      className="p-1 rounded text-red-500 hover:bg-red-500/10 cursor-pointer shrink-0"
                      title="Delete chat"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 
        3. MAIN MESSAGES STREAM AREA
      */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-5 max-w-4xl mx-auto w-full overscroll-contain">
        {/* Welcome HUD Card when chat is empty or fresh */}
        {messages.length <= 1 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-5 sm:p-6 rounded-2xl border transition-all ${
              isDark ? 'bg-[#0D1B2E] border-[#243B56]' : 'bg-white border-[#DCE6F0] shadow-xs'
            }`}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[#2563EB]/10 text-[#2563EB] dark:bg-[#3B82F6]/20 dark:text-[#60A5FA] uppercase tracking-wide">
                  Intelligence Overview
                </span>
                <h3 className="text-base sm:text-lg font-heading font-bold text-[#0F172A] dark:text-white mt-1.5">
                  Welcome back, {settings.ownerName || 'Merchant'}
                </h3>
                <p className="text-xs text-[#64748B] dark:text-[#9FB1C5] mt-1 leading-relaxed">
                  Ask Kopa is your automated CFO and bookkeeping assistant. Ask questions in {selectedLangObj.name} or type transactions naturally to keep your accounts updated instantly.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-[#EAF2FF] dark:bg-[#102B4D] text-[#2563EB] dark:text-[#60A5FA] shrink-0">
                <Bot className="w-6 h-6" />
              </div>
            </div>

            {/* Live Ledger Quick KPI Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 pb-4 border-y border-[#DCE6F0] dark:border-[#243B56] my-4">
              <div className="p-2.5 rounded-xl bg-[#F7FAFC] dark:bg-[#07111F] border border-[#DCE6F0] dark:border-[#243B56]">
                <span className="text-[10px] text-[#64748B] dark:text-[#9FB1C5] block">30-Day Revenue</span>
                <span className="text-xs sm:text-sm font-bold font-mono text-[#2563EB] dark:text-[#60A5FA]">
                  {currencySymbol}{metrics.totalRevenue.toLocaleString()}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F7FAFC] dark:bg-[#07111F] border border-[#DCE6F0] dark:border-[#243B56]">
                <span className="text-[10px] text-[#64748B] dark:text-[#9FB1C5] block">Expenses</span>
                <span className="text-xs sm:text-sm font-bold font-mono text-[#0F172A] dark:text-white">
                  {currencySymbol}{metrics.totalExpenses.toLocaleString()}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F7FAFC] dark:bg-[#07111F] border border-[#DCE6F0] dark:border-[#243B56]">
                <span className="text-[10px] text-[#64748B] dark:text-[#9FB1C5] block">Customer Debts</span>
                <span className="text-xs sm:text-sm font-bold font-mono text-amber-500">
                  {currencySymbol}{metrics.outstandingDebts.toLocaleString()}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F7FAFC] dark:bg-[#07111F] border border-[#DCE6F0] dark:border-[#243B56]">
                <span className="text-[10px] text-[#64748B] dark:text-[#9FB1C5] block">Low Stock Alerts</span>
                <span className="text-xs sm:text-sm font-bold font-mono text-rose-500">
                  {lowStockCount} items
                </span>
              </div>
            </div>

            {/* Quick Action Suggestion Cards */}
            <div>
              <span className="text-[11px] font-heading font-semibold text-[#64748B] dark:text-[#9FB1C5] block mb-2">
                Try asking one of these quick operations:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {quickActions.flatMap((g) => g.prompts.slice(0, 1)).map((prompt, pIdx) => (
                  <button
                    key={pIdx}
                    type="button"
                    onClick={() => handleSend(prompt)}
                    className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between group cursor-pointer ${
                      isDark
                        ? 'bg-[#132640] border-[#243B56] text-[#D5E2F0] hover:text-white hover:border-[#60A5FA] hover:bg-[#102B4D]'
                        : 'bg-[#F7FAFC] border-[#DCE6F0] text-[#0F172A] hover:border-[#2563EB] hover:bg-[#EAF2FF]/50'
                    }`}
                  >
                    <span className="truncate pr-2">✨ {prompt}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#60A5FA] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Message Stream */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            {/* Sender Metadata Bar */}
            <div className="flex items-center gap-2 mb-1 px-1 text-[10px] font-mono text-[#64748B] dark:text-[#9FB1C5]">
              {msg.sender === 'user' ? (
                <>
                  <span>{msg.timestamp}</span>
                  <span className="font-semibold text-[#0F172A] dark:text-white">You</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-[#2563EB] dark:bg-[#60A5FA]" />
                  <span className="font-bold text-[#2563EB] dark:text-[#60A5FA]">Kopa AI</span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </>
              )}
            </div>

            {/* Bubble Container */}
            <div
              className={`max-w-[92%] sm:max-w-[82%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed transition-all shadow-xs ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white rounded-tr-xs font-medium'
                  : isDark
                  ? 'bg-[#0D1B2E] border border-[#243B56] text-[#F8FBFF] rounded-tl-xs shadow-xs'
                  : 'bg-white border border-[#DCE6F0] text-[#0F172A] rounded-tl-xs shadow-xs'
              }`}
            >
              {/* Message text with newline formatting */}
              <div className="whitespace-pre-wrap break-words leading-relaxed space-y-1">
                {msg.text}
              </div>

              {/* High-Fidelity Structured Action Draft Confirmation Receipt Card */}
              {msg.candidateAction && (
                <div className="mt-3.5 p-3.5 sm:p-4 rounded-xl border bg-[#EAF2FF]/60 dark:bg-[#102B4D]/60 border-[#2563EB]/30 dark:border-[#60A5FA]/40 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#2563EB]/20 dark:border-[#60A5FA]/20 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded-lg bg-[#2563EB] text-white">
                        <Receipt className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-xs font-heading font-bold text-[#0F3B82] dark:text-[#60A5FA]">
                        {msg.candidateAction.title || 'Structured Action Draft'}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                        msg.confirmed
                          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                          : 'bg-[#2563EB]/20 text-[#2563EB] dark:text-[#60A5FA]'
                      }`}
                    >
                      {msg.confirmed ? 'POSTED' : 'PENDING APPROVAL'}
                    </span>
                  </div>

                  {/* Financial Receipt Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-mono bg-white dark:bg-[#07111F] p-3 rounded-xl border border-[#DCE6F0] dark:border-[#243B56]">
                    <div>
                      <span className="text-[10px] text-[#64748B] dark:text-[#9FB1C5] block">Total Amount</span>
                      <span className="font-bold text-sm text-[#2563EB] dark:text-[#60A5FA]">
                        {currencySymbol}
                        {msg.candidateAction.amount ? msg.candidateAction.amount.toLocaleString() : '0'}
                      </span>
                    </div>

                    {msg.candidateAction.productName && (
                      <div>
                        <span className="text-[10px] text-[#64748B] dark:text-[#9FB1C5] block">Product</span>
                        <span className="font-semibold truncate block">
                          {msg.candidateAction.productName}
                          {msg.candidateAction.quantity ? ` (×${msg.candidateAction.quantity})` : ''}
                        </span>
                      </div>
                    )}

                    {msg.candidateAction.customerName && (
                      <div>
                        <span className="text-[10px] text-[#64748B] dark:text-[#9FB1C5] block">Customer</span>
                        <span className="font-semibold truncate block">{msg.candidateAction.customerName}</span>
                      </div>
                    )}

                    <div>
                      <span className="text-[10px] text-[#64748B] dark:text-[#9FB1C5] block">Target Ledger</span>
                      <span className="font-medium uppercase text-[11px] text-[#0F172A] dark:text-slate-300">
                        {msg.candidateAction.type.replace('_', ' ')}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-[#64748B] dark:text-[#9FB1C5] block">Posting Date</span>
                      <span className="font-semibold">Today</span>
                    </div>
                  </div>

                  {/* Confirmation Button or Completed Banner */}
                  {!msg.confirmed ? (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => handleConfirmActionDraft(msg.id, msg.candidateAction)}
                        className="w-full py-2.5 px-4 rounded-xl bg-[#2563EB] dark:bg-[#3B82F6] text-white font-bold text-xs hover:bg-[#1D4ED8] dark:hover:bg-[#2563EB] transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm & Post to Live Ledger</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <CheckCheck className="w-4 h-4 shrink-0" />
                      <span>Committed to verified enterprise ledger and Firestore.</span>
                    </div>
                  )}
                </div>
              )}

              {/* Bottom Assistant Controls: Read Aloud TTS, Retry, Copy */}
              {msg.sender === 'kopa' && (
                <div className="flex items-center justify-end gap-3 pt-2.5 mt-2 border-t border-[#DCE6F0]/60 dark:border-[#243B56]/60 text-[11px] text-[#64748B] dark:text-[#9FB1C5]">
                  <button
                    type="button"
                    onClick={() => handleToggleSpeak(msg.id, msg.text)}
                    className="inline-flex items-center gap-1 opacity-80 hover:opacity-100 hover:text-[#2563EB] dark:hover:text-[#60A5FA] cursor-pointer transition-colors"
                    title={speakingMsgId === msg.id ? 'Stop listening' : 'Read aloud'}
                  >
                    {speakingMsgId === msg.id ? <VolumeX className="w-3.5 h-3.5 text-red-500" /> : <Volume2 className="w-3.5 h-3.5" />}
                    <span>{speakingMsgId === msg.id ? 'Stop' : 'Listen'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSend(messages[messages.findIndex((m) => m.id === msg.id) - 1]?.text)}
                    className="inline-flex items-center gap-1 opacity-80 hover:opacity-100 hover:text-[#2563EB] dark:hover:text-[#60A5FA] cursor-pointer transition-colors"
                    title="Regenerate response"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retry</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopy(msg.id, msg.text)}
                    className="inline-flex items-center gap-1 opacity-80 hover:opacity-100 hover:text-[#2563EB] dark:hover:text-[#60A5FA] cursor-pointer transition-colors"
                  >
                    {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="flex items-center justify-between p-3.5 rounded-2xl border border-[#DCE6F0] dark:border-[#243B56] bg-white dark:bg-[#0D1B2E] text-xs text-[#475569] dark:text-[#D5E2F0] font-mono shadow-xs max-w-md">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#2563EB] dark:bg-[#60A5FA] animate-ping" />
              <span>Analyzing business context in {selectedLangObj.name}...</span>
            </div>
            <button
              type="button"
              onClick={handleStopGeneration}
              className="px-2.5 py-1 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>Stop</span>
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 
        4. QUICK PROMPT CAROUSEL CHIPS
      */}
      {!isProcessing && messages.length > 1 && (
        <div className="shrink-0 px-4 sm:px-6 py-2 max-w-4xl mx-auto w-full flex items-center gap-2 overflow-x-auto scrollbar-none z-10">
          <span className="text-[11px] font-medium text-[#64748B] dark:text-[#9FB1C5] shrink-0 mr-1 flex items-center gap-1">
            <Zap className="w-3 h-3 text-[#2563EB] dark:text-[#60A5FA]" />
            <span>Suggested:</span>
          </span>
          {[
            `Who has overdue customer debts?`,
            `What is my gross profit margin this month?`,
            `I spent ${currencySymbol}6,000 on delivery`,
            `Check low stock inventory alerts`,
          ].map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(prompt)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all shrink-0 cursor-pointer shadow-2xs ${
                isDark
                  ? 'bg-[#0D1B2E] border-[#243B56] text-[#D5E2F0] hover:text-white hover:border-[#60A5FA]'
                  : 'bg-white border-[#DCE6F0] text-[#0F172A] hover:border-[#2563EB]'
              }`}
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* 
        5. PREMIUM DOCKED INPUT BAR WITH VOICE MIC
      */}
      <div className="shrink-0 w-full p-3 sm:p-5 bg-white/90 dark:bg-[#07111F]/90 border-t border-[#DCE6F0] dark:border-[#243B56] backdrop-blur-md z-20">
        <div className="max-w-4xl mx-auto w-full space-y-2">
          {/* Voice recording alert banner */}
          {recordingFeedback && (
            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-500 flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span className="font-mono font-medium">{recordingFeedback}</span>
              </div>
              <button type="button" onClick={() => setRecordingFeedback(null)} className="p-1 cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Input pill container */}
          <div className="relative shadow-md rounded-2xl border border-[#DCE6F0] dark:border-[#243B56] bg-white dark:bg-[#0D1B2E] p-2 sm:p-2.5 flex items-end gap-2 focus-within:ring-2 focus-within:ring-[#2563EB] dark:focus-within:ring-[#60A5FA] transition-all">
            {/* Auto-expanding Input Area */}
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={`Ask anything or dictate a transaction in ${selectedLangObj.name} ("Sold 2 bags of rice for ${currencySymbol}120,000")…`}
              className="flex-1 max-h-36 min-h-[38px] py-1.5 px-2 bg-transparent text-xs sm:text-sm text-[#0F172A] dark:text-[#F8FBFF] placeholder-[#64748B] dark:placeholder-[#9FB1C5] outline-none resize-none leading-relaxed"
            />

            {/* Voice Recording Button */}
            <button
              type="button"
              onClick={startVoiceRecording}
              className={`p-2.5 rounded-full transition-all cursor-pointer shrink-0 ${
                isRecording
                  ? 'bg-red-500 text-white animate-pulse shadow-md'
                  : 'text-[#64748B] hover:text-[#0F172A] dark:hover:text-white hover:bg-[#EAF2FF] dark:hover:bg-[#132640]'
              }`}
              title={isRecording ? 'Stop Recording' : `Speak in ${selectedLangObj.name}`}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Send Button */}
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={!input.trim() || isProcessing}
              className="w-9 h-9 rounded-full flex items-center justify-center bg-[#2563EB] dark:bg-[#3B82F6] text-white hover:bg-[#1D4ED8] dark:hover:bg-[#2563EB] disabled:opacity-30 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:text-slate-500 transition-all shrink-0 cursor-pointer shadow-xs"
              aria-label="Send message"
            >
              <CornerDownLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Subtext info */}
          <div className="flex items-center justify-between text-[11px] text-[#64748B] dark:text-[#9FB1C5] font-sans px-1 pt-0.5">
            <span className="flex items-center gap-1.5">
              <span>Google Gemini 3.8 Flash</span>
              <span>•</span>
              <span className="hidden sm:inline">Press Enter to send, Shift + Enter for new line</span>
            </span>
            <span className="font-medium">
              Language: {selectedLangObj.flag} {selectedLangObj.name}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
