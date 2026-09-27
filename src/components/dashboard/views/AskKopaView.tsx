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
} from 'lucide-react';
import { db, Product, Customer, Transaction } from '../../../lib/db';
import { useTheme } from '../../../context/ThemeContext';
import { MCPExecutor } from '../../../lib/connectors/mcpExecutor';
import { ConnectorProviderId } from '../../../lib/connectors/types';
import { ConnectorIcon } from '../connectors/ConnectorIcons';
import { KopaLogo } from '../../KopaLogo';

interface ParsedTransactionCandidate {
  type: 'sale' | 'expense' | 'payment';
  title: string;
  product?: Product;
  productName: string;
  quantity: number;
  amount: number;
  cost: number | null;
  customer?: Customer;
  customerName?: string;
  notes: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'kopa';
  text: string;
  candidate?: ParsedTransactionCandidate;
  dataSummary?: {
    title: string;
    items: { label: string; value: string; isAccent?: boolean }[];
  };
  mcpResult?: {
    provider: ConnectorProviderId;
    toolName: string;
    summary?: string;
    data?: any;
  };
  confirmed?: boolean;
  timestamp: string;
}

export const AskKopaView: React.FC = () => {
  const { isDark } = useTheme();
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showMcpDrawer, setShowMcpDrawer] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const settings = db.getSettings();
  const currencySymbol = settings.currencySymbol || '₦';
  const [availableMcpTools, setAvailableMcpTools] = useState(MCPExecutor.getAvailableTools());

  useEffect(() => {
    const unsub = db.subscribe(() => {
      setAvailableMcpTools(MCPExecutor.getAvailableTools());
    });
    return () => unsub();
  }, []);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'kopa',
      text: `Hello ${settings.ownerName}. I am tuned to your ${settings.category} operating context. You can tell me what happened in your business naturally (e.g. "Sold 3 shirts for ₦45,000" or "Paid ₦15,000 for diesel"), ask questions about revenue, debts, and inventory, or execute automated MCP actions across your connected tools.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  // Execute MCP Tool directly from chip or prompt
  const handleExecuteMcpTool = async (provider: ConnectorProviderId, toolName: string, args: Record<string, any> = {}) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: `Run ${toolName.replace(/_/g, ' ')} on ${provider.toUpperCase()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsProcessing(true);
    setShowMcpDrawer(false);

    try {
      const result = await MCPExecutor.execute({ provider, toolName, args });
      setIsProcessing(false);

      if (result.success) {
        setMessages((prev) => [
          ...prev,
          {
            id: `kopa-${Date.now()}`,
            sender: 'kopa',
            text: result.summary || `Successfully executed ${toolName} on ${provider.toUpperCase()}.`,
            mcpResult: {
              provider,
              toolName,
              summary: result.summary,
              data: result.data,
            },
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `kopa-${Date.now()}`,
            sender: 'kopa',
            text: `⚠️ Tool execution notice: ${result.error}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (err: any) {
      setIsProcessing(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `kopa-${Date.now()}`,
          sender: 'kopa',
          text: `Error executing MCP tool: ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  };

  // Natural Language Parsing Engine
  const parseNaturalLanguage = async (text: string) => {
    const lower = text.toLowerCase();
    const products = db.getProducts();
    const customers = db.getCustomers();

    // Check if user is asking to trigger connected MCP tools
    if (lower.includes('shopify') && lower.includes('order')) {
      const tool = availableMcpTools.find((t) => t.toolName === 'shopify_read_orders');
      if (tool) {
        return {
          isMcp: true,
          provider: 'shopify' as ConnectorProviderId,
          toolName: 'shopify_read_orders',
          args: { limit: 10 },
        };
      }
    }

    if (lower.includes('stripe') && (lower.includes('balance') || lower.includes('payout'))) {
      const tool = availableMcpTools.find((t) => t.toolName === 'stripe_get_balance');
      if (tool) {
        return {
          isMcp: true,
          provider: 'stripe' as ConnectorProviderId,
          toolName: 'stripe_get_balance',
          args: {},
        };
      }
    }

    if (lower.includes('airtable')) {
      const tool = availableMcpTools.find((t) => t.toolName === 'airtable_fetch_records');
      if (tool) {
        return {
          isMcp: true,
          provider: 'airtable' as ConnectorProviderId,
          toolName: 'airtable_fetch_records',
          args: { maxRecords: 20 },
        };
      }
    }

    // 1. QUESTION: How much did I make / revenue / profit?
    if (lower.includes('how much') || lower.includes('revenue') || lower.includes('profit') || lower.includes('made')) {
      const metrics = db.getMetrics(30);
      let reply = `In the last 30 days, your recorded revenue is ${currencySymbol}${metrics.totalRevenue.toLocaleString()} across ${metrics.totalTransactions} transactions. Total recorded expenses are ${currencySymbol}${metrics.totalExpenses.toLocaleString()}.`;
      if (metrics.hasIncompleteCostData) {
        reply += ` Note: ${metrics.itemsWithMissingCostCount} sold item(s) have "Cost not set", so gross profit cannot be calculated accurately yet.`;
      } else {
        reply += ` Verified gross profit is ${currencySymbol}${metrics.estimatedGrossProfit.toLocaleString()}.`;
      }

      return {
        reply,
        dataSummary: {
          title: '30-Day Financial Summary',
          items: [
            { label: 'Recorded Revenue', value: `${currencySymbol}${metrics.totalRevenue.toLocaleString()}`, isAccent: true },
            { label: 'Expenses', value: `${currencySymbol}${metrics.totalExpenses.toLocaleString()}` },
            {
              label: 'Gross Profit',
              value: metrics.hasIncompleteCostData ? 'Cost not set' : `${currencySymbol}${metrics.estimatedGrossProfit.toLocaleString()}`,
            },
          ],
        },
      };
    }

    // 2. QUESTION: Who owes me money / debts?
    if (lower.includes('owe') || lower.includes('debt') || lower.includes('balance') || lower.includes('debtor')) {
      const debtCustomers = customers.filter((c) => c.outstandingBalance > 0);
      const totalDebt = debtCustomers.reduce((sum, c) => sum + c.outstandingBalance, 0);

      if (debtCustomers.length === 0) {
        return {
          reply: 'Great news! You have 0 outstanding customer debts recorded on your ledger.',
        };
      }

      return {
        reply: `You have ${debtCustomers.length} customer(s) with pending credit balances totaling ${currencySymbol}${totalDebt.toLocaleString()}.`,
        dataSummary: {
          title: 'Outstanding Debtor Ledger',
          items: debtCustomers.slice(0, 5).map((c) => ({
            label: `${c.name} (${c.phone || 'No phone'})`,
            value: `${currencySymbol}${c.outstandingBalance.toLocaleString()}`,
            isAccent: true,
          })),
        },
      };
    }

    // 3. QUESTION: Low stock / inventory check?
    if (lower.includes('stock') || lower.includes('inventory') || lower.includes('reorder') || lower.includes('run out')) {
      const lowStock = products.filter((p) => p.stock <= p.minStockAlert);
      const totalVal = products.reduce((sum, p) => sum + p.sellingPrice * p.stock, 0);

      if (lowStock.length === 0) {
        return {
          reply: `All ${products.length} catalog products are above minimum reorder levels. Total inventory valuation is ${currencySymbol}${totalVal.toLocaleString()}.`,
        };
      }

      return {
        reply: `Attention: ${lowStock.length} product(s) are at or below minimum restock thresholds.`,
        dataSummary: {
          title: 'Critical Inventory Alerts',
          items: lowStock.map((p) => ({
            label: `${p.name} (Min: ${p.minStockAlert})`,
            value: `${p.stock} units left`,
            isAccent: p.stock === 0,
          })),
        },
      };
    }

    // 4. TRANSACTION ACTIONS (Sale, Expense, Payment)
    const isSale = lower.startsWith('sold') || lower.includes('sold') || lower.includes('sale of') || lower.includes('made a sale');
    const isExpense = lower.startsWith('paid') || lower.includes('spent') || lower.includes('bought') || lower.includes('expense of');

    let extractedAmount = 0;
    const forMatch = text.match(/(?:for|of|cost|worth)\s*(?:₦|ngn|\$|ksh|ghc)?\s*([0-9,]+(?:\.[0-9]+)?)/i);
    const amountMatch = text.match(/(?:₦|ngn|\$|ksh|ghc)\s*([0-9,]+(?:\.[0-9]+)?)/i);
    const generalNumberMatch = text.match(/\b([1-9][0-9]{2,}(?:,[0-9]{3})*)\b/);

    if (forMatch && forMatch[1]) {
      extractedAmount = parseFloat(forMatch[1].replace(/,/g, ''));
    } else if (amountMatch && amountMatch[1]) {
      extractedAmount = parseFloat(amountMatch[1].replace(/,/g, ''));
    } else if (generalNumberMatch && generalNumberMatch[1]) {
      extractedAmount = parseFloat(generalNumberMatch[1].replace(/,/g, ''));
    }

    let extractedQty = 1;
    const qtyMatch = text.match(/(?:sold|bought|recorded)\s+(\d+)/i);
    if (qtyMatch && qtyMatch[1]) {
      extractedQty = parseInt(qtyMatch[1]);
    }

    let matchedProduct: Product | undefined = undefined;
    for (const p of products) {
      if (lower.includes(p.name.toLowerCase()) || p.name.toLowerCase().split(' ').some((word) => word.length > 3 && lower.includes(word))) {
        matchedProduct = p;
        break;
      }
    }

    let matchedCustomer: Customer | undefined = undefined;
    for (const c of customers) {
      if (lower.includes(c.name.toLowerCase()) || lower.includes(c.name.split(' ')[0].toLowerCase())) {
        matchedCustomer = c;
        break;
      }
    }

    if (isSale) {
      const productName = matchedProduct ? matchedProduct.name : 'Recorded Item';
      const finalAmount = extractedAmount || (matchedProduct ? matchedProduct.sellingPrice * extractedQty : 0);

      if (finalAmount === 0) {
        return {
          reply: `I see you sold ${matchedProduct ? matchedProduct.name : 'an item'}, but what was the total sale amount? Please tell me (e.g. "Sold ${extractedQty} for ${currencySymbol}45,000") so I can record it accurately.`,
        };
      }

      const candidate: ParsedTransactionCandidate = {
        type: 'sale',
        title: `Sale: ${extractedQty} × ${productName}`,
        product: matchedProduct,
        productName,
        quantity: extractedQty,
        amount: finalAmount,
        cost: matchedProduct ? matchedProduct.costPrice : null,
        customer: matchedCustomer,
        customerName: matchedCustomer?.name,
        notes: `Recorded via Ask Kopa natural command: "${text}"`,
      };

      return {
        reply: `I understand: You sold ${extractedQty} × ${productName} for ${currencySymbol}${finalAmount.toLocaleString()}.${
          candidate.cost === null ? ' (Note: Product cost is not set; gross profit will show "Cost not set".)' : ''
        } Please confirm before I commit this permanently to your ledger.`,
        candidate,
      };
    }

    if (isExpense && extractedAmount > 0) {
      const candidate: ParsedTransactionCandidate = {
        type: 'expense',
        title: text.replace(/^(?:i\s+)?(?:paid|spent)\s+(?:for\s+)?/i, ''),
        productName: 'Business Expense',
        quantity: 1,
        amount: extractedAmount,
        cost: null,
        notes: `Expense recorded via natural command: "${text}"`,
      };

      return {
        reply: `I understand: You recorded a business expense of ${currencySymbol}${extractedAmount.toLocaleString()}. Please confirm to add it to your expense ledger.`,
        candidate,
      };
    }

    return {
      reply: `I heard: "${text}". You can ask me financial questions (e.g. "How much did I make this month?"), record sales or expenses, or execute actions on your connected platform tools below.`,
    };
  };

  const handleSend = async (customPrompt?: string) => {
    const promptToSend = (customPrompt || input).trim();
    if (!promptToSend) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: promptToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInput('');
    setIsProcessing(true);

    const parsed = await parseNaturalLanguage(promptToSend);
    setIsProcessing(false);

    if ((parsed as any).isMcp) {
      const { provider, toolName, args } = parsed as any;
      handleExecuteMcpTool(provider, toolName, args);
      return;
    }

    const kopaMsg: ChatMessage = {
      id: `kopa-${Date.now()}`,
      sender: 'kopa',
      text: (parsed as any).reply,
      candidate: (parsed as any).candidate,
      dataSummary: (parsed as any).dataSummary,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, kopaMsg]);
  };

  const handleConfirmCandidate = (msgId: string, candidate: ParsedTransactionCandidate) => {
    if (candidate.type === 'sale') {
      db.addTransaction({
        type: 'sale',
        title: candidate.title,
        amount: candidate.amount,
        quantity: candidate.quantity,
        cost: candidate.cost,
        productId: candidate.product?.id,
        productName: candidate.productName,
        customerId: candidate.customer?.id,
        customerName: candidate.customerName,
        status: 'completed',
        notes: candidate.notes,
        category: 'Sales',
        date: new Date().toISOString(),
      });

      if (candidate.product) {
        db.updateProduct(candidate.product.id, {
          stock: Math.max(0, candidate.product.stock - candidate.quantity),
          salesCount: candidate.product.salesCount + candidate.quantity,
          totalRevenue: candidate.product.totalRevenue + candidate.amount,
        });
      }
    } else if (candidate.type === 'expense') {
      db.addExpense({
        amount: candidate.amount,
        category: 'Operating Expense',
        description: candidate.title || candidate.notes || 'Operating Expense',
        isRecurring: false,
        date: new Date().toISOString(),
      });
    }

    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId
          ? {
              ...m,
              confirmed: true,
              text: `${m.text}\n\n✓ Transaction successfully committed to ledger!`,
            }
          : m
      )
    );
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome',
        sender: 'kopa',
        text: `New session started for ${settings.ownerName}. What happened in your business or what financial query would you like to run?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const promptCards = [
    {
      title: 'Analyze Financial Position',
      prompt: 'How much revenue and profit did I make in the last 30 days?',
      icon: TrendingUp,
    },
    {
      title: 'Customer Credit & Debts',
      prompt: 'Who owes me money and what are the pending balances?',
      icon: Users,
    },
    {
      title: 'Record a New Sale',
      prompt: 'Sold 3 black shirts for ₦45,000 to Ahmed',
      icon: Receipt,
    },
    {
      title: 'Stock & Inventory Alerts',
      prompt: 'Check my inventory for low stock items',
      icon: Package,
    },
  ];

  return (
    <div className="h-full flex flex-col min-h-0 overflow-hidden relative select-text">
      {/* 
        1. ChatGPT-STYLE FIXED TOP BAR (Stationary Header)
      */}
      <header className="shrink-0 h-14 sm:h-16 px-4 sm:px-6 border-b border-[#DEE3DE] dark:border-[#1A2E27] flex items-center justify-between backdrop-blur-xl bg-white/70 dark:bg-[#08110F]/70 z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#DEE3DE] dark:border-[#1C382E] bg-black/5 dark:bg-white/5 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#15803D] dark:bg-[#B8F36B] animate-pulse" />
            <span className="text-primary font-semibold">Kopa 2.5 Flash</span>
            <span className="text-[10px] text-muted font-mono hidden sm:inline">
              · Financial Engine
            </span>
          </div>

          <span className="text-xs text-secondary font-mono hidden md:inline truncate max-w-xs">
            {settings.businessName} ({settings.category})
          </span>
        </div>

        <div className="flex items-center gap-2">
          {availableMcpTools.length > 0 && (
            <button
              type="button"
              onClick={() => setShowMcpDrawer(!showMcpDrawer)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                showMcpDrawer
                  ? 'bg-[#15803D] dark:bg-[#B8F36B] text-white dark:text-[#08110F] border-transparent font-semibold'
                  : 'bg-black/5 dark:bg-white/5 border-[#DEE3DE] dark:border-[#1C382E] text-secondary hover:text-primary hover:bg-black/10 dark:hover:bg-white/10'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Connected Tools</span>
              <span className="text-[11px] font-mono">({availableMcpTools.length})</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleResetChat}
            className="p-2 rounded-xl text-muted hover:text-primary hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            title="Start new conversation"
            aria-label="Start new conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 
        Connected MCP Tools Floating Drawer / Banner
      */}
      <AnimatePresence>
        {showMcpDrawer && availableMcpTools.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="shrink-0 border-b border-[#DEE3DE] dark:border-[#1A2E27] bg-[#F7F6F0] dark:bg-[#0B1713] p-4 overflow-hidden z-10"
          >
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-primary flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-[#15803D] dark:text-[#B8F36B]" />
                  <span>Execute MCP Platform Actions</span>
                </span>
                <span className="text-[11px] text-muted font-mono">
                  1-click trigger
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {availableMcpTools.map((tool) => (
                  <button
                    key={`${tool.provider}-${tool.toolName}`}
                    type="button"
                    onClick={() => handleExecuteMcpTool(tool.provider, tool.toolName)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#DEE3DE] dark:border-[#1C382E] bg-white dark:bg-[#10251E] hover:border-[#15803D] dark:hover:border-[#B8F36B] text-xs font-medium text-secondary hover:text-primary transition-colors shadow-2xs cursor-pointer"
                  >
                    <ConnectorIcon provider={tool.provider} className="w-3.5 h-3.5 shrink-0" />
                    <span>{tool.description.split('.')[0] || tool.toolName}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 
        2. SCROLLABLE CONVERSATION STREAM (Only this inner section scrolls!)
      */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-6 sm:px-6 overscroll-contain">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Welcome Screen & Prompt Grid when conversation is just starting */}
          {messages.length === 1 && (
            <div className="py-6 sm:py-10 text-center">
              <div className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-[#10251E] dark:bg-[#B8F36B]/15 text-[#B8F36B] shadow-md border border-[#1C382E]">
                <Sparkles className="w-6 h-6 text-[#B8F36B]" />
              </div>

              <h2 className="text-xl sm:text-2xl font-heading font-medium tracking-tight text-primary mb-2">
                What can I help your business run today?
              </h2>
              <p className="text-xs sm:text-sm text-secondary max-w-md mx-auto mb-8 leading-relaxed font-sans">
                Tell me sales or expenses in natural language, ask questions about profitability, or automate tasks across connected platforms.
              </p>

              {/* 2x2 ChatGPT-style Prompt Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                {promptCards.map((card, idx) => {
                  const Icon = card.icon;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSend(card.prompt)}
                      className="p-3.5 sm:p-4 rounded-2xl border border-[#DEE3DE] dark:border-[#1C382E] bg-white dark:bg-[#10251E]/60 hover:border-[#15803D] dark:hover:border-[#B8F36B] transition-all shadow-2xs hover:shadow-xs group cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <div className="p-1.5 rounded-lg bg-black/5 dark:bg-white/5 text-[#15803D] dark:text-[#B8F36B]">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-heading font-semibold text-primary group-hover:text-[#15803D] dark:group-hover:text-[#B8F36B] transition-colors">
                          {card.title}
                        </span>
                      </div>
                      <p className="text-[12px] text-secondary font-sans line-clamp-2">
                        "{card.prompt}"
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Conversation Messages */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 sm:gap-4 ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {/* Kopa Avatar on Left for assistant responses */}
              {msg.sender === 'kopa' && (
                <div className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center bg-[#08110F] border border-[#1C382E] text-white shadow-xs mt-0.5">
                  <KopaLogo variant="symbol" theme="dark" size="sm" />
                </div>
              )}

              {/* Message Content Container */}
              <div
                className={`max-w-[88%] sm:max-w-[80%] ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                {/* User Message Bubble (Dark green conversation bubble with crisp light text) */}
                {msg.sender === 'user' ? (
                  <div className="bg-[#10251E] dark:bg-[#142B23] text-[#F7F6F0] px-4 py-2.5 rounded-3xl text-xs sm:text-sm font-sans leading-relaxed shadow-sm">
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                ) : (
                  /* Assistant Message (Clean typography with visible Kopa Assistant title) */
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-primary">Kopa Assistant</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-[#DEE3DE] dark:border-[#1C382E] bg-black/5 dark:bg-white/5 text-muted font-medium">
                        AI Ledger
                      </span>
                    </div>

                    <div className="text-xs sm:text-sm text-primary font-sans leading-relaxed">
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>

                    {/* Pre-Confirmation Card (Before permanent record) */}
                    {msg.candidate && !msg.confirmed && (
                      <div
                        className="p-4 rounded-2xl border border-[#15803D]/40 dark:border-[#B8F36B]/40 bg-white dark:bg-[#0E1F1A] shadow-md text-xs"
                      >
                        <div className="flex items-center gap-1.5 font-semibold text-[#15803D] dark:text-[#B8F36B] mb-2.5">
                          <ShieldCheck className="w-4 h-4 shrink-0" />
                          <span>Transaction Confirmation Required</span>
                        </div>

                        <div className="space-y-2 divide-y divide-[#DEE3DE] dark:divide-[#1A2E27]">
                          <div className="flex justify-between py-1">
                            <span className="text-secondary font-medium">Type</span>
                            <span className="font-semibold capitalize text-primary">
                              {msg.candidate.type}
                            </span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-secondary font-medium">Item</span>
                            <span className="font-medium text-primary">
                              {msg.candidate.productName}
                            </span>
                          </div>
                          {msg.candidate.type === 'sale' && (
                            <div className="flex justify-between py-1">
                              <span className="text-secondary font-medium">Quantity</span>
                              <span className="font-mono text-primary">
                                {msg.candidate.quantity}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between py-1.5 items-center">
                            <span className="text-secondary font-medium">Total Amount</span>
                            <span className="font-mono font-bold text-base text-[#15803D] dark:text-[#B8F36B]">
                              {currencySymbol}
                              {msg.candidate.amount.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3.5 pt-3 border-t border-[#DEE3DE] dark:border-[#1A2E27] flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleConfirmCandidate(msg.id, msg.candidate!)}
                            className="flex-1 py-2 px-3 rounded-xl bg-[#B8F36B] hover:bg-[#A5E852] text-[#08110F] text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Confirm & Commit to Ledger</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setMessages((prev) =>
                                prev.map((m) =>
                                  m.id === msg.id ? { ...m, text: `${m.text}\n\n✗ Discarded by user.` } : m
                                )
                              )
                            }
                            className="py-2 px-3 rounded-xl border border-[#DEE3DE] dark:border-[#1C382E] text-xs font-medium text-muted hover:text-primary cursor-pointer"
                          >
                            Discard
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Data Summary Card (For questions) */}
                    {msg.dataSummary && (
                      <div
                        className="p-4 rounded-2xl border border-[#DEE3DE] dark:border-[#1C382E] bg-white dark:bg-[#10251E] shadow-xs text-xs"
                      >
                        <span className="font-semibold block mb-2.5 text-primary">
                          {msg.dataSummary.title}
                        </span>
                        <div className="space-y-1.5 divide-y divide-[#DEE3DE]/60 dark:divide-[#1A2E27]">
                          {msg.dataSummary.items.map((item, i) => (
                            <div key={i} className="flex justify-between items-center pt-1.5 pb-0.5">
                              <span className="text-secondary font-medium">{item.label}</span>
                              <span
                                className={`font-mono font-medium ${
                                  item.isAccent
                                    ? 'text-[#15803D] dark:text-[#B8F36B] font-bold text-sm'
                                    : 'text-primary'
                                }`}
                              >
                                {item.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* MCP Tool Result Output */}
                    {msg.mcpResult && (
                      <div
                        className="p-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 dark:bg-[#0B1713] text-xs"
                      >
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-emerald-500/20">
                          <div className="flex items-center gap-1.5">
                            <ConnectorIcon provider={msg.mcpResult.provider} className="w-4 h-4" />
                            <span className="font-semibold capitalize font-mono text-[#15803D] dark:text-[#B8F36B]">
                              {msg.mcpResult.provider} · {msg.mcpResult.toolName}
                            </span>
                          </div>
                          <span className="text-[10px] text-[#15803D] dark:text-[#B8F36B] px-2 py-0.5 rounded bg-emerald-500/10 font-mono font-semibold">
                            LIVE MCP
                          </span>
                        </div>

                        {msg.mcpResult.summary && (
                          <p className="text-primary text-xs mb-2 leading-relaxed">
                            {msg.mcpResult.summary}
                          </p>
                        )}

                        {msg.mcpResult.data && (
                          <pre className="p-2.5 rounded-xl bg-black/5 dark:bg-black/40 text-[10px] font-mono text-primary overflow-x-auto max-h-40 border border-[#DEE3DE] dark:border-[#1C382E]">
                            {JSON.stringify(msg.mcpResult.data, null, 2)}
                          </pre>
                        )}
                      </div>
                    )}

                    {/* Message Actions Under Assistant Bubble (Copy, Timestamp) */}
                    <div className="flex items-center gap-2 pt-1 text-[11px] text-muted font-mono">
                      <span>{msg.timestamp}</span>
                      <span>·</span>
                      <button
                        type="button"
                        onClick={() => handleCopyMessage(msg.id, msg.text)}
                        className="inline-flex items-center gap-1 text-muted hover:text-primary transition-colors cursor-pointer"
                        title="Copy message text"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-[#15803D] dark:text-[#B8F36B]" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Assistant Processing Indicator */}
          {isProcessing && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center bg-[#08110F] border border-[#1C382E] text-white shadow-xs">
                <KopaLogo variant="symbol" theme="dark" size="sm" />
              </div>
              <div className="p-3 rounded-2xl border border-[#DEE3DE] dark:border-[#1C382E] bg-white dark:bg-[#10251E] flex items-center gap-2.5 text-xs text-muted font-mono shadow-xs">
                <div className="w-2 h-2 rounded-full bg-[#15803D] dark:bg-[#B8F36B] animate-ping" />
                <span>Kopa analyzing business context & records...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 
        3. CHATGPT-STYLE STAGNANT / ANCHORED BOTTOM DOCK (Never moves away!)
      */}
      <div className="shrink-0 w-full pt-2 pb-4 sm:pb-6 px-4 bg-gradient-to-t from-[#F7F6F0] via-[#F7F6F0]/95 to-transparent dark:from-[#08110F] dark:via-[#08110F]/95 dark:to-transparent z-20">
        <div className="max-w-3xl mx-auto w-full">
          {/* Floating ChatGPT Input Capsule */}
          <div className="relative shadow-xl rounded-3xl border border-[#DEE3DE] dark:border-[#1E3B30] bg-white dark:bg-[#10251E] p-2 sm:p-2.5 flex items-end gap-2 focus-within:ring-2 focus-within:ring-[#15803D] dark:focus-within:ring-[#B8F36B] focus-within:border-transparent transition-all">
            {/* Left Tool / Connector Button */}
            <button
              type="button"
              onClick={() => setShowMcpDrawer(!showMcpDrawer)}
              className="p-2 rounded-full text-muted hover:text-primary hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer shrink-0"
              title="Toggle tools & connectors"
              aria-label="Toggle tools"
            >
              <Plus className="w-4 h-4" />
            </button>

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
              placeholder="Ask Kopa or record business activity naturally…"
              className="flex-1 max-h-32 min-h-[36px] py-1.5 px-2 bg-transparent text-xs sm:text-sm text-primary placeholder:text-muted outline-none resize-none leading-relaxed"
            />

            {/* Audio Voice Simulation Mic */}
            <button
              type="button"
              onClick={() => {
                setIsRecording(!isRecording);
                if (!isRecording) {
                  setInput('Sold 3 lace fabrics for ₦90,000');
                }
              }}
              className={`p-2 rounded-full transition-colors cursor-pointer shrink-0 ${
                isRecording
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'text-slate-400 hover:text-[#111916] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
              }`}
              title={isRecording ? 'Listening...' : 'Voice input simulation'}
            >
              <Mic className="w-4 h-4" />
            </button>

            {/* Circular Send Button */}
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={!input.trim() || isProcessing}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-[#15803D] dark:bg-[#B8F36B] text-white dark:text-[#08110F] hover:opacity-90 disabled:opacity-30 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:text-slate-500 transition-all shrink-0 cursor-pointer shadow-xs"
              aria-label="Send message"
            >
              <CornerDownLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Discreet Legal/Operating Footnote */}
          <p className="text-[11px] text-center text-[#69746F] dark:text-slate-500 mt-2 font-sans">
            Ask Kopa analyzes your live ledger, products, customers, and connected tools.
          </p>
        </div>
      </div>
    </div>
  );
};
