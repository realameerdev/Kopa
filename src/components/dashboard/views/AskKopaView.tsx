import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { db, Product, Customer, Transaction } from '../../../lib/db';
import { useTheme } from '../../../context/ThemeContext';
import { MCPExecutor } from '../../../lib/connectors/mcpExecutor';
import { ConnectorProviderId } from '../../../lib/connectors/types';
import { ConnectorIcon } from '../connectors/ConnectorIcons';

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
      text: `Hello ${settings.ownerName}. I am tuned to your ${settings.category} operating context and connected platform tools. Tell me what happened in your business naturally (e.g. "Sold 3 shirts for ₦45,000" or "Paid ₦15,000 for electricity"), ask questions about revenue, or execute MCP actions across your connected integrations.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

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
    const isDebtPayment =
      (lower.includes('debt') || lower.includes('repaid') || lower.includes('paid balance')) &&
      !isExpense;

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
      reply: `I heard: "${text}". You can ask me financial questions (e.g. "How much did I make this month?"), record sales/expenses, or use the connected MCP tools below.`,
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
        category: candidate.product?.category || 'Retail Sales',
        notes: candidate.notes,
        date: new Date().toISOString(),
      });
    } else if (candidate.type === 'expense') {
      db.addExpense({
        amount: candidate.amount,
        category: 'Operating Expense',
        description: candidate.title,
        date: new Date().toISOString(),
        isRecurring: false,
      });
    }

    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId
          ? {
              ...m,
              confirmed: true,
              text: `${m.text}\n\n✓ Confirmed and committed to your official business ledger.`,
            }
          : m
      )
    );
  };

  const samplePrompts = [
    'How much revenue did I make in the last 30 days?',
    'Who owes me money right now?',
    'Which items are low in stock?',
    'Sold 2 shirts for ₦30,000',
    'Paid ₦12,000 for electricity bill',
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* View Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-heading font-semibold tracking-tight text-[#111916] dark:text-white">
          Ask Kopa & MCP Intelligence
        </h1>
        <p className="text-xs sm:text-sm text-[#69746F] dark:text-slate-400 mt-0.5">
          Conversational financial intelligence, natural ledger bookkeeping, and connected platform tools
        </p>
      </div>

      {/* Connected Apps MCP Tools Bar */}
      {availableMcpTools.length > 0 && (
        <div className="space-y-2 p-3.5 rounded-2xl border bg-emerald-500/5 border-emerald-500/20">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>Connected MCP Platform Tools ({availableMcpTools.length})</span>
            </span>
            <span className="text-[11px] text-slate-400 font-mono">1-click execute</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {availableMcpTools.map((tool) => (
              <button
                key={`${tool.provider}-${tool.toolName}`}
                onClick={() => handleExecuteMcpTool(tool.provider, tool.toolName)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                  isDark
                    ? 'bg-[#10251E] border-[#1C382E] text-slate-200 hover:border-emerald-500/40 hover:text-white'
                    : 'bg-white border-slate-200 text-slate-800 hover:border-emerald-400 shadow-2xs'
                }`}
              >
                <ConnectorIcon provider={tool.provider} className="w-3.5 h-3.5 shrink-0" />
                <span>{tool.description.split('.')[0] || tool.toolName}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Quick Command Chips */}
      <div>
        <p className="text-xs font-mono uppercase tracking-wider text-[#69746F] dark:text-slate-400 mb-2">
          Try asking:
        </p>
        <div className="flex flex-wrap gap-2">
          {samplePrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => handleSend(prompt)}
              className={`text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                isDark
                  ? 'bg-[#10251E]/60 border-[#1C382E] text-slate-300 hover:text-white hover:border-[#B8F36B]/40'
                  : 'bg-white border-[#DEE3DE] text-[#111916] hover:border-black/30 shadow-2xs'
              }`}
            >
              "{prompt}"
            </button>
          ))}
        </div>
      </div>

      {/* Main Conversation Stream */}
      <div
        className={`min-h-[380px] max-h-[520px] overflow-y-auto p-4 sm:p-6 rounded-2xl border flex flex-col gap-4 ${
          isDark ? 'bg-[#08110F] border-[#1C382E]' : 'bg-[#F7F6F0]/80 border-[#DEE3DE]'
        }`}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center gap-2 mb-1 px-1">
              <span className="text-[11px] font-mono text-[#69746F] dark:text-slate-400">
                {msg.sender === 'kopa' ? 'Kopa' : 'You'} · {msg.timestamp}
              </span>
            </div>

            <div
              className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm whitespace-pre-wrap ${
                msg.sender === 'user'
                  ? 'bg-[#B8F36B] text-[#08110F] font-medium'
                  : isDark
                  ? 'bg-[#10251E]/90 border border-[#1C382E] text-slate-200'
                  : 'bg-white border border-[#DEE3DE] text-[#111916] shadow-xs'
              }`}
            >
              <p className="leading-relaxed">{msg.text}</p>

              {/* MCP Tool Result Output */}
              {msg.mcpResult && (
                <div
                  className={`mt-3 p-3.5 rounded-xl border text-xs ${
                    isDark ? 'bg-[#08110F] border-emerald-500/30' : 'bg-emerald-50/50 border-emerald-200'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5">
                    <div className="flex items-center gap-1.5">
                      <ConnectorIcon provider={msg.mcpResult.provider} className="w-4 h-4" />
                      <span className="font-semibold capitalize font-mono text-emerald-400">
                        {msg.mcpResult.provider} · {msg.mcpResult.toolName}
                      </span>
                    </div>
                    <span className="text-[10px] text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 font-mono">
                      LIVE MCP DATA
                    </span>
                  </div>

                  {msg.mcpResult.summary && (
                    <p className="text-slate-300 dark:text-slate-200 text-xs mb-2">
                      {msg.mcpResult.summary}
                    </p>
                  )}

                  {msg.mcpResult.data && (
                    <pre className="p-2.5 rounded-lg bg-black/40 text-[10px] font-mono text-slate-300 overflow-x-auto max-h-40">
                      {JSON.stringify(msg.mcpResult.data, null, 2)}
                    </pre>
                  )}
                </div>
              )}

              {/* Data Summary Card (For questions) */}
              {msg.dataSummary && (
                <div
                  className={`mt-3 p-3.5 rounded-xl border text-xs ${
                    isDark ? 'bg-[#08110F] border-[#1C382E]' : 'bg-[#F7F6F0] border-[#DEE3DE]'
                  }`}
                >
                  <span className="font-semibold block mb-2 text-[#111916] dark:text-white">
                    {msg.dataSummary.title}
                  </span>
                  <div className="space-y-1.5">
                    {msg.dataSummary.items.map((item, i) => (
                      <div key={i} className="flex justify-between items-center py-0.5">
                        <span className="text-[#69746F] dark:text-slate-400">{item.label}</span>
                        <span className={`font-mono font-medium ${item.isAccent ? 'text-[#B8F36B] font-bold' : ''}`}>
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pre-Confirmation Card (Before permanent record) */}
              {msg.candidate && !msg.confirmed && (
                <div
                  className={`mt-4 p-4 rounded-xl border ${
                    isDark ? 'bg-[#08110F] border-[#B8F36B]/30' : 'bg-white border-[#B8F36B] shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#B8F36B] mb-2">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Transaction Confirmation Required</span>
                  </div>

                  <div className="space-y-2 text-xs divide-y divide-[#DEE3DE] dark:divide-[#1A2E27]">
                    <div className="flex justify-between py-1">
                      <span className="text-[#69746F] dark:text-slate-400">Type</span>
                      <span className="font-medium capitalize">{msg.candidate.type}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-[#69746F] dark:text-slate-400">Item</span>
                      <span className="font-medium">{msg.candidate.productName}</span>
                    </div>
                    {msg.candidate.type === 'sale' && (
                      <div className="flex justify-between py-1">
                        <span className="text-[#69746F] dark:text-slate-400">Quantity</span>
                        <span className="font-medium">{msg.candidate.quantity}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-1">
                      <span className="text-[#69746F] dark:text-slate-400">Total Amount</span>
                      <span className="font-mono font-bold text-sm text-[#B8F36B]">
                        {currencySymbol}
                        {msg.candidate.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#DEE3DE] dark:border-[#1A2E27] flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleConfirmCandidate(msg.id, msg.candidate!)}
                      className="flex-1 py-2 px-3 rounded-xl bg-[#B8F36B] text-[#08110F] text-xs font-semibold hover:bg-[#A5E852] transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Confirm & Commit to Ledger</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setMessages((prev) =>
                          prev.map((m) =>
                            m.id === msg.id ? { ...m, text: `${m.text} \n\n✗ Discarded by user.` } : m
                          )
                        )
                      }
                      className="py-2 px-3 rounded-xl border border-black/10 dark:border-white/10 text-xs font-medium hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer text-slate-400"
                    >
                      Discard
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isProcessing && (
          <div className="flex items-start gap-2">
            <div
              className={`p-3 rounded-2xl border text-xs flex items-center gap-2 ${
                isDark ? 'bg-[#10251E]/80 border-[#1C382E]' : 'bg-white border-[#DEE3DE]'
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-[#B8F36B] animate-ping" />
              <span className="text-[#69746F] dark:text-slate-400 font-mono text-[11px]">
                Kopa analyzing data & connected platform tools...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
          placeholder="Tell Kopa what happened in your business or query connected platforms…"
          className={`w-full pl-4 pr-12 py-3.5 rounded-2xl border text-xs sm:text-sm outline-none transition-all shadow-md ${
            isDark
              ? 'bg-[#10251E]/70 border-[#1C382E] text-white placeholder-slate-500 focus:border-[#B8F36B] focus:ring-1 focus:ring-[#B8F36B]'
              : 'bg-white border-[#DEE3DE] text-[#111916] placeholder-slate-400 focus:border-[#10251E] focus:ring-1 focus:ring-[#10251E]'
          }`}
        />
        <button
          type="button"
          onClick={() => handleSend()}
          disabled={!input.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-[#B8F36B] text-[#08110F] hover:bg-[#A5E852] disabled:opacity-40 transition-colors cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
