import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Send,
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
  Square,
  Edit3,
  DollarSign,
} from 'lucide-react';
import { db, Product, Customer, Transaction, ChatSession, ChatMessageData } from '../../../lib/db';
import { useTheme } from '../../../context/ThemeContext';
import { MCPExecutor } from '../../../lib/connectors/mcpExecutor';
import { ConnectorProviderId } from '../../../lib/connectors/types';

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

  // Chat Sessions & Active Session State (ChatGPT Style)
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);

  // Messages in Active Conversation
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Draft Editing Modal/State
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<number>(0);
  const [editName, setEditName] = useState<string>('');

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingFeedback, setRecordingFeedback] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load chat sessions from DB on mount & listen for updates
  useEffect(() => {
    const unsub = db.subscribe(() => {
      const sessions = db.getChatSessions();
      setChatSessions(sessions);
    });

    const initialSessions = db.getChatSessions();
    setChatSessions(initialSessions);

    if (initialSessions.length > 0) {
      setActiveSessionId(initialSessions[0].id);
      setMessages(initialSessions[0].messages);
      setSelectedLanguage(initialSessions[0].language || 'en');
    } else {
      // Create default welcome session
      const newSession = db.createChatSession(`Business Operations Assistant`, selectedLanguage);
      const welcomeMsg: ChatMessageData = {
        id: 'welcome',
        sender: 'kopa',
        text: `Hello ${settings.ownerName}. I am Kopa AI, connected directly to your ${settings.businessName} enterprise database. Ask me financial queries or speak/type transactions naturally (e.g., "I made a sale of ${currencySymbol}45,000 today" or "Alhaji Yusuf is owing me ${currencySymbol}50,000"). I will create structured action drafts for your confirmation before committing to Firestore.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      db.addChatMessageToSession(newSession.id, welcomeMsg);
      setActiveSessionId(newSession.id);
      setMessages([welcomeMsg]);
    }

    return () => unsub();
  }, []);

  // Update messages when active session changes
  useEffect(() => {
    if (activeSessionId) {
      const session = db.getChatSession(activeSessionId);
      if (session) {
        setMessages(session.messages);
        setSelectedLanguage(session.language || 'en');
      }
    }
  }, [activeSessionId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  // Create New Chat Session
  const handleNewChat = () => {
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
    if (!text || isProcessing || !activeSessionId) return;

    const userMessage: ChatMessageData = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      language: selectedLanguage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    db.addChatMessageToSession(activeSessionId, userMessage);
    setInput('');
    setIsProcessing(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const metrics = db.getMetrics(30);
      const res = await fetch('/api/ai/chat', {
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
            metrics,
            products: db.getProducts().slice(0, 10),
            customers: db.getCustomers().slice(0, 10),
          },
          chatHistory: messages.slice(-8),
        }),
      });

      const data = await res.json();
      setIsProcessing(false);

      const kopaMessage: ChatMessageData = {
        id: `kopa-${Date.now()}`,
        sender: 'kopa',
        text: data.replyText || 'I have analyzed your request against your business records.',
        language: selectedLanguage,
        candidateAction: data.actionDraft || undefined,
        confirmed: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, kopaMessage]);
      db.addChatMessageToSession(activeSessionId, kopaMessage);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setIsProcessing(false);
        return;
      }
      console.warn('AI chat request notice:', err);
      setIsProcessing(false);

      const fallbackMsg: ChatMessageData = {
        id: `kopa-${Date.now()}`,
        sender: 'kopa',
        text: `I received your input. You can confirm or manage your ledger records directly below.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      db.addChatMessageToSession(activeSessionId, fallbackMsg);
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsProcessing(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const selectedLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === selectedLanguage) || SUPPORTED_LANGUAGES[0];

  const suggestedPrompts = [
    { label: `I made a sale of ${currencySymbol}45,000 today`, lang: 'en' },
    { label: `Alhaji Yusuf is owing me ${currencySymbol}50,000`, lang: 'en' },
    { label: `I spent ${currencySymbol}8,000 on delivery`, lang: 'en' },
    { label: `Add 20 black shirts to inventory`, lang: 'en' },
    { label: `How much revenue did I make this month?`, lang: 'en' },
  ];

  return (
    <div className="h-full flex flex-col min-h-0 relative bg-[#F7F6F0] dark:bg-[#08110F] text-[#111916] dark:text-white overflow-hidden">
      {/* 
        1. TOP CONTROLS & LANGUAGE SWITCHER HEADER BAR
      */}
      <div className="shrink-0 p-3 sm:p-4 border-b border-[#DEE3DE] dark:border-[#1A2E27] bg-[#F7F6F0]/90 dark:bg-[#08110F]/90 backdrop-blur-md flex flex-wrap items-center justify-between gap-2.5 z-20">
        <div className="flex items-center gap-2">
          {/* History Drawer Toggle (ChatGPT Style) */}
          <button
            type="button"
            onClick={() => setHistoryDrawerOpen(!historyDrawerOpen)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#DEE3DE] dark:border-[#1C382E] bg-white dark:bg-[#10251E] text-xs font-semibold text-[#111916] dark:text-white hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors shadow-2xs"
            title="Chat History"
          >
            <History className="w-3.5 h-3.5 text-[#15803D] dark:text-[#B8F36B]" />
            <span className="hidden sm:inline">History</span>
            <span className="px-1.5 py-0.5 rounded bg-[#15803D]/10 dark:bg-[#B8F36B]/20 text-[10px] font-mono font-bold text-[#15803D] dark:text-[#B8F36B]">
              {chatSessions.length}
            </span>
          </button>

          {/* New Chat Button */}
          <button
            type="button"
            onClick={handleNewChat}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#15803D] dark:bg-[#B8F36B] text-[#08110F] text-xs font-semibold hover:opacity-90 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Language Selector Dropdown */}
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-[#15803D] dark:text-[#B8F36B]" />
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold outline-none cursor-pointer ${
              isDark ? 'bg-[#10251E] border-[#1C382E] text-white' : 'bg-white border-[#DEE3DE] text-[#111916] shadow-2xs'
            }`}
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code} className={isDark ? 'bg-[#08110F]' : 'bg-white'}>
                {lang.flag} {lang.name} ({lang.nativeName})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 
        2. CHATGPT-STYLE CHAT HISTORY DRAWER / SIDEBAR
      */}
      <AnimatePresence>
        {historyDrawerOpen && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute top-14 bottom-0 left-0 w-72 z-30 border-r border-[#DEE3DE] dark:border-[#1C382E] bg-white dark:bg-[#0A1612] p-4 flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#DEE3DE] dark:border-[#1C382E] mb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#15803D] dark:text-[#B8F36B]" />
                <span className="text-xs font-heading font-semibold">Conversations</span>
              </div>
              <button
                type="button"
                onClick={() => setHistoryDrawerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
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
                        ? 'bg-[#15803D]/10 dark:bg-[#B8F36B]/15 border-[#15803D]/30 dark:border-[#B8F36B]/40 font-semibold'
                        : isDark
                        ? 'border-[#1C382E] hover:bg-white/5 text-slate-300'
                        : 'border-[#DEE3DE] hover:bg-black/5 text-[#111916]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <MessageSquare className="w-3.5 h-3.5 shrink-0 text-[#15803D] dark:text-[#B8F36B]" />
                      <span className="truncate">{s.title || 'Conversation'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteSession(s.id, e)}
                      className="p-1 rounded text-red-400 hover:bg-red-500/10 cursor-pointer shrink-0"
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
      <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4 max-w-3xl mx-auto w-full overscroll-contain">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-xs ${
                msg.sender === 'user'
                  ? 'bg-[#15803D] dark:bg-[#B8F36B] text-white dark:text-[#08110F] rounded-br-2xs font-medium'
                  : isDark
                  ? 'bg-[#10251E] border border-[#1C382E] text-white rounded-bl-2xs'
                  : 'bg-white border border-[#DEE3DE] text-[#111916] rounded-bl-2xs'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5 text-[10px] font-mono opacity-80">
                <span>{msg.sender === 'user' ? 'You' : 'Kopa AI'}</span>
                <span>{msg.timestamp}</span>
              </div>

              <p className="whitespace-pre-wrap">{msg.text}</p>

              {/* Action Draft Confirmation Card (Requirements 3, 4, 7) */}
              {msg.candidateAction && (
                <div className="mt-3 p-3.5 rounded-2xl border bg-black/5 dark:bg-white/5 border-[#15803D]/30 dark:border-[#B8F36B]/40 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-heading font-bold text-[#15803D] dark:text-[#B8F36B] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      {msg.candidateAction.title || 'Structured Action Detected'}
                    </span>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">
                      {msg.confirmed ? 'CONFIRMED' : 'DRAFT'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-white/50 dark:bg-black/20 p-2.5 rounded-xl border border-black/5 dark:border-white/5">
                    <div>
                      <span className="text-[10px] opacity-70 block">Amount</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {currencySymbol}
                        {msg.candidateAction.amount ? msg.candidateAction.amount.toLocaleString() : '0'}
                      </span>
                    </div>

                    {msg.candidateAction.customerName && (
                      <div>
                        <span className="text-[10px] opacity-70 block">Customer</span>
                        <span className="font-semibold">{msg.candidateAction.customerName}</span>
                      </div>
                    )}

                    {msg.candidateAction.productName && (
                      <div>
                        <span className="text-[10px] opacity-70 block">Product</span>
                        <span className="font-semibold">{msg.candidateAction.productName}</span>
                      </div>
                    )}

                    <div>
                      <span className="text-[10px] opacity-70 block">Date</span>
                      <span className="font-semibold">Today</span>
                    </div>
                  </div>

                  {/* Confirmation or Verified Badge */}
                  {!msg.confirmed ? (
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleConfirmActionDraft(msg.id, msg.candidateAction)}
                        className="flex-1 py-2 px-3 rounded-xl bg-[#15803D] dark:bg-[#B8F36B] text-white dark:text-[#08110F] font-bold text-xs hover:opacity-90 transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Confirm & Record</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium pt-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Saved to Firestore and reflected on dashboard.</span>
                    </div>
                  )}
                </div>
              )}

              {/* Copy & Retry Controls */}
              <div className="flex items-center justify-end gap-3 pt-2">
                {msg.sender === 'kopa' && (
                  <button
                    type="button"
                    onClick={() => handleSend(messages[messages.findIndex((m) => m.id === msg.id) - 1]?.text)}
                    className="inline-flex items-center gap-1 text-[10px] opacity-70 hover:opacity-100 cursor-pointer"
                    title="Retry response"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Retry</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleCopy(msg.id, msg.text)}
                  className="inline-flex items-center gap-1 text-[10px] opacity-70 hover:opacity-100 cursor-pointer"
                >
                  {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>
        ))}

        {isProcessing && (
          <div className="flex items-center justify-between p-3 rounded-2xl border border-[#DEE3DE] dark:border-[#1C382E] bg-white dark:bg-[#10251E] text-xs text-[#69746F] dark:text-slate-400 font-mono w-full sm:w-auto">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-[#15803D] dark:bg-[#B8F36B] animate-ping" />
              <span>Analyzing business context in {selectedLangObj.name}...</span>
            </div>
            <button
              type="button"
              onClick={handleStopGeneration}
              className="px-2 py-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>Stop</span>
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      {messages.length <= 2 && !isProcessing && (
        <div className="shrink-0 px-4 py-2 max-w-3xl mx-auto w-full flex flex-wrap gap-2 overflow-x-auto scrollbar-none">
          {suggestedPrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(p.label)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all shrink-0 cursor-pointer ${
                isDark
                  ? 'bg-[#10251E] border-[#1C382E] text-slate-300 hover:text-white hover:border-[#B8F36B]'
                  : 'bg-white border-[#DEE3DE] text-[#111916] hover:border-black/30 shadow-2xs'
              }`}
            >
              ✨ {p.label}
            </button>
          ))}
        </div>
      )}

      {/* 
        4. STAGNANT CHATGPT-STYLE BOTTOM INPUT DOCK WITH VOICE MIC
      */}
      <div className="shrink-0 w-full p-3 sm:p-4 bg-[#F7F6F0] dark:bg-[#08110F] border-t border-[#DEE3DE] dark:border-[#1A2E27] z-20">
        <div className="max-w-3xl mx-auto w-full space-y-2">
          {recordingFeedback && (
            <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-500 flex items-center justify-between animate-pulse">
              <span className="font-mono">{recordingFeedback}</span>
              <button type="button" onClick={() => setRecordingFeedback(null)} className="p-1 cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="relative shadow-xl rounded-2xl border border-[#DEE3DE] dark:border-[#1E3B30] bg-white dark:bg-[#10251E] p-2 flex items-end gap-2 focus-within:ring-2 focus-within:ring-[#15803D] dark:focus-within:ring-[#B8F36B] transition-all">
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
              placeholder={`Ask Kopa or speak in ${selectedLangObj.name} ("I sold 3 shirts for ${currencySymbol}45,000")…`}
              className="flex-1 max-h-32 min-h-[38px] py-1.5 px-2 bg-transparent text-xs sm:text-sm text-[#111916] dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none resize-none leading-relaxed"
            />

            {/* Voice Recording Button */}
            <button
              type="button"
              onClick={startVoiceRecording}
              className={`p-2.5 rounded-full transition-colors cursor-pointer shrink-0 ${
                isRecording
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'text-slate-400 hover:text-[#111916] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
              }`}
              title={isRecording ? 'Stop Recording' : `Speak in ${selectedLangObj.name}`}
            >
              <Mic className="w-4 h-4" />
            </button>

            {/* Circular Send Button */}
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={!input.trim() || isProcessing}
              className="w-9 h-9 rounded-full flex items-center justify-center bg-[#15803D] dark:bg-[#B8F36B] text-white dark:text-[#08110F] hover:opacity-90 disabled:opacity-30 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:text-slate-500 transition-all shrink-0 cursor-pointer shadow-xs"
              aria-label="Send message"
            >
              <CornerDownLeft className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#69746F] dark:text-slate-400 font-sans px-1">
            <span>Powered by Gemini 3.8 Flash</span>
            <span>Active Language: {selectedLangObj.flag} {selectedLangObj.name}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
