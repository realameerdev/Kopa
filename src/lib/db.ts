/**
 * Kopa V1 Database Layer
 * Provides persistent, reactive CRUD operations for Business Operations:
 * Transactions, Products, Customers, Expenses, Notifications, and Business Settings.
 * Backed by Firebase Firestore with per-user data isolation and real-time synchronization,
 * with optimistic in-memory caching and offline resilience.
 */

import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  getDoc,
  Unsubscribe,
} from 'firebase/firestore';
import { firestore, isFirebaseConfigured } from './firebase';
import { ConnectorConnection, SyncLogEntry, ConnectorProviderId } from './connectors/types';

export type TransactionType = 'sale' | 'expense' | 'payment' | 'purchase' | 'refund' | 'debt';
export type TransactionStatus = 'completed' | 'pending' | 'cancelled';

export interface Product {
  id: string;
  name: string;
  category: string;
  sellingPrice: number;
  costPrice: number | null; // null represents "Cost not set"
  stock: number;
  minStockAlert: number;
  salesCount: number;
  totalRevenue: number;
  sourceProvider?: ConnectorProviderId | string;
  externalId?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  totalPurchases: number;
  outstandingBalance: number; // positive = customer owes business
  lastActivity: string;
  sourceProvider?: ConnectorProviderId | string;
  externalId?: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  title: string;
  amount: number;
  customerId?: string;
  customerName?: string;
  productId?: string;
  productName?: string;
  quantity?: number;
  cost?: number | null; // cost per item if known
  status: TransactionStatus;
  category: string;
  notes?: string;
  date: string;
  sourceProvider?: ConnectorProviderId | string;
  externalId?: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  isRecurring: boolean;
  sourceProvider?: ConnectorProviderId | string;
  externalId?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  type: 'stock' | 'debt' | 'activity' | 'system';
  title: string;
  message: string;
  date: string;
  read: boolean;
  actionUrl?: string;
}

export interface ChatMessageData {
  id: string;
  sender: 'user' | 'kopa';
  text: string;
  audioUrl?: string;
  language?: string;
  candidateAction?: {
    type: 'record_sale' | 'record_expense' | 'record_payment' | 'add_product' | 'add_customer' | 'none';
    title: string;
    amount: number;
    quantity?: number;
    productName?: string;
    customerName?: string;
    notes?: string;
  };
  confirmed?: boolean;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  title: string;
  language: string;
  messages: ChatMessageData[];
  createdAt: string;
  updatedAt: string;
}

export interface BusinessSettings {
  businessName: string;
  category: string;
  country: string;
  currency: string;
  currencySymbol: string;
  ownerName: string;
  email: string;
  phone?: string;
  description?: string;
  onboardingAnswers?: Record<string, any>;
  notifyLowStock: boolean;
  notifyDebts: boolean;
  notifyDailySummary: boolean;
}

// Storage keys helper based on userId
const STORAGE_PREFIX = 'kopa_v1_';
function getStorageKeys(userId: string = 'default') {
  return {
    PRODUCTS: `${STORAGE_PREFIX}${userId}_products`,
    CUSTOMERS: `${STORAGE_PREFIX}${userId}_customers`,
    TRANSACTIONS: `${STORAGE_PREFIX}${userId}_transactions`,
    EXPENSES: `${STORAGE_PREFIX}${userId}_expenses`,
    SETTINGS: `${STORAGE_PREFIX}${userId}_settings`,
    NOTIFICATIONS: `${STORAGE_PREFIX}${userId}_notifications`,
    CONNECTORS: `${STORAGE_PREFIX}${userId}_connectors`,
    SYNC_LOGS: `${STORAGE_PREFIX}${userId}_sync_logs`,
    CHAT_SESSIONS: `${STORAGE_PREFIX}${userId}_chat_sessions`,
  };
}

// Initial Clean State for New Users (Zero Fake/Sample Records)
const DEFAULT_SETTINGS: BusinessSettings = {
  businessName: 'My Business',
  category: 'General Business',
  country: 'Nigeria',
  currency: 'NGN',
  currencySymbol: '₦',
  ownerName: 'Business Owner',
  email: '',
  notifyLowStock: true,
  notifyDebts: true,
  notifyDailySummary: true,
};

const DEFAULT_PRODUCTS: Product[] = [];
const DEFAULT_CUSTOMERS: Customer[] = [];
const DEFAULT_TRANSACTIONS: Transaction[] = [];
const DEFAULT_EXPENSES: Expense[] = [];
const DEFAULT_NOTIFICATIONS: NotificationItem[] = [];
const DEFAULT_CONNECTORS: ConnectorConnection[] = [];
const DEFAULT_SYNC_LOGS: SyncLogEntry[] = [];

class KopaDatabase {
  private activeUserId: string | null = null;
  private unsubscribers: Unsubscribe[] = [];
  private listeners: Set<() => void> = new Set();

  private products: Product[] = [];
  private customers: Customer[] = [];
  private transactions: Transaction[] = [];
  private expenses: Expense[] = [];
  private settings: BusinessSettings = { ...DEFAULT_SETTINGS };
  private notifications: NotificationItem[] = [];
  private connectors: ConnectorConnection[] = [];
  private syncLogs: SyncLogEntry[] = [];
  private chatSessions: ChatSession[] = [];

  constructor() {
    this.loadFromLocalCache('default');
  }

  // -------------------------------------------------------------
  // USER BINDING & FIRESTORE REAL-TIME SYNC
  // -------------------------------------------------------------
  public bindUser(userId: string, initialProfile?: Partial<BusinessSettings>) {
    if (this.activeUserId === userId) return;

    // Clean up existing listeners
    this.unsubscribers.forEach((unsub) => unsub());
    this.unsubscribers = [];

    this.activeUserId = userId;
    this.loadFromLocalCache(userId);

    // If initialProfile was passed and no settings are saved, merge them
    if (initialProfile) {
      this.settings = {
        ...this.settings,
        ...initialProfile,
      };
      this.saveSettingsToCache();
    }

    // Connect real-time Firestore listeners for isolated per-user collections
    this.initFirestoreSync(userId);
  }

  public unbindUser() {
    this.unsubscribers.forEach((unsub) => unsub());
    this.unsubscribers = [];
    this.activeUserId = null;
    this.loadFromLocalCache('default');
    this.notify();
  }

  public getActiveUserId(): string | null {
    return this.activeUserId;
  }

  private async initFirestoreSync(userId: string) {
    if (!firestore || !isFirebaseConfigured) return;
    try {
      // 1. User Profile / Settings listener
      const userDocRef = doc(firestore, 'users', userId);
      const unsubUser = onSnapshot(userDocRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as Partial<BusinessSettings>;
          this.settings = {
            ...this.settings,
            ...data,
          };
          this.saveSettingsToCache();
          this.notify();
        } else {
          // If document doesn't exist on Firestore yet, push current local settings
          setDoc(userDocRef, this.cleanForFirestore(this.settings), { merge: true }).catch((err) =>
            console.warn('Initial settings sync warning:', err)
          );
        }
      });
      this.unsubscribers.push(unsubUser);

      // 2. Products collection listener
      const productsRef = collection(firestore, 'users', userId, 'products');
      const unsubProducts = onSnapshot(productsRef, (snapshot) => {
        if (!snapshot.empty) {
          const remoteProducts: Product[] = [];
          snapshot.forEach((d) => remoteProducts.push(d.data() as Product));
          this.products = remoteProducts;
          this.saveProductsToCache();
          this.notify();
        } else if (this.products.length > 0) {
          // Sync local products to Firestore
          this.products.forEach((p) => {
            setDoc(doc(productsRef, p.id), this.cleanForFirestore(p)).catch(() => {});
          });
        }
      });
      this.unsubscribers.push(unsubProducts);

      // 3. Customers collection listener
      const customersRef = collection(firestore, 'users', userId, 'customers');
      const unsubCustomers = onSnapshot(customersRef, (snapshot) => {
        if (!snapshot.empty) {
          const remoteCustomers: Customer[] = [];
          snapshot.forEach((d) => remoteCustomers.push(d.data() as Customer));
          this.customers = remoteCustomers;
          this.saveCustomersToCache();
          this.notify();
        } else if (this.customers.length > 0) {
          this.customers.forEach((c) => {
            setDoc(doc(customersRef, c.id), this.cleanForFirestore(c)).catch(() => {});
          });
        }
      });
      this.unsubscribers.push(unsubCustomers);

      // 4. Transactions collection listener
      const txRef = collection(firestore, 'users', userId, 'transactions');
      const unsubTx = onSnapshot(txRef, (snapshot) => {
        if (!snapshot.empty) {
          const remoteTx: Transaction[] = [];
          snapshot.forEach((d) => remoteTx.push(d.data() as Transaction));
          // Sort newest first
          remoteTx.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          this.transactions = remoteTx;
          this.saveTransactionsToCache();
          this.notify();
        } else if (this.transactions.length > 0) {
          this.transactions.forEach((t) => {
            setDoc(doc(txRef, t.id), this.cleanForFirestore(t)).catch(() => {});
          });
        }
      });
      this.unsubscribers.push(unsubTx);

      // 5. Expenses collection listener
      const expRef = collection(firestore, 'users', userId, 'expenses');
      const unsubExp = onSnapshot(expRef, (snapshot) => {
        if (!snapshot.empty) {
          const remoteExp: Expense[] = [];
          snapshot.forEach((d) => remoteExp.push(d.data() as Expense));
          remoteExp.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          this.expenses = remoteExp;
          this.saveExpensesToCache();
          this.notify();
        } else if (this.expenses.length > 0) {
          this.expenses.forEach((e) => {
            setDoc(doc(expRef, e.id), this.cleanForFirestore(e)).catch(() => {});
          });
        }
      });
      this.unsubscribers.push(unsubExp);

      // 6. Notifications collection listener
      const notifRef = collection(firestore, 'users', userId, 'notifications');
      const unsubNotif = onSnapshot(notifRef, (snapshot) => {
        if (!snapshot.empty) {
          const remoteNotifs: NotificationItem[] = [];
          snapshot.forEach((d) => remoteNotifs.push(d.data() as NotificationItem));
          remoteNotifs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          this.notifications = remoteNotifs;
          this.saveNotificationsToCache();
          this.notify();
        } else if (this.notifications.length > 0) {
          this.notifications.forEach((n) => {
            setDoc(doc(notifRef, n.id), this.cleanForFirestore(n)).catch(() => {});
          });
        }
      });
      this.unsubscribers.push(unsubNotif);

      // 7. Connectors collection listener
      const connRef = collection(firestore, 'users', userId, 'connectors');
      const unsubConn = onSnapshot(connRef, (snapshot) => {
        if (!snapshot.empty) {
          const remoteConns: ConnectorConnection[] = [];
          snapshot.forEach((d) => remoteConns.push(d.data() as ConnectorConnection));
          this.connectors = remoteConns;
          this.saveConnectorsToCache();
          this.notify();
        } else if (this.connectors.length > 0) {
          this.connectors.forEach((c) => {
            setDoc(doc(connRef, c.id), this.cleanForFirestore(c)).catch(() => {});
          });
        }
      });
      this.unsubscribers.push(unsubConn);

      // 8. Sync Logs collection listener
      const logsRef = collection(firestore, 'users', userId, 'sync_logs');
      const unsubLogs = onSnapshot(logsRef, (snapshot) => {
        if (!snapshot.empty) {
          const remoteLogs: SyncLogEntry[] = [];
          snapshot.forEach((d) => remoteLogs.push(d.data() as SyncLogEntry));
          remoteLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          this.syncLogs = remoteLogs;
          this.saveSyncLogsToCache();
          this.notify();
        }
      });
      this.unsubscribers.push(unsubLogs);
    } catch (err) {
      console.warn('Firestore initialization notice:', err);
    }
  }

  private cleanForFirestore<T extends Record<string, any>>(obj: T): T {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = value;
      }
    }
    return cleaned as T;
  }

  // -------------------------------------------------------------
  // LOCAL CACHE & STORAGE MANAGEMENT
  // -------------------------------------------------------------
  private loadFromLocalCache(userId: string) {
    const keys = getStorageKeys(userId);
    try {
      const savedSettings = localStorage.getItem(keys.SETTINGS);
      this.settings = savedSettings ? JSON.parse(savedSettings) : { ...DEFAULT_SETTINGS };

      const savedProducts = localStorage.getItem(keys.PRODUCTS);
      this.products = savedProducts ? JSON.parse(savedProducts) : [...DEFAULT_PRODUCTS];

      const savedCustomers = localStorage.getItem(keys.CUSTOMERS);
      this.customers = savedCustomers ? JSON.parse(savedCustomers) : [...DEFAULT_CUSTOMERS];

      const savedTransactions = localStorage.getItem(keys.TRANSACTIONS);
      this.transactions = savedTransactions ? JSON.parse(savedTransactions) : [...DEFAULT_TRANSACTIONS];

      const savedExpenses = localStorage.getItem(keys.EXPENSES);
      this.expenses = savedExpenses ? JSON.parse(savedExpenses) : [...DEFAULT_EXPENSES];

      const savedNotifications = localStorage.getItem(keys.NOTIFICATIONS);
      this.notifications = savedNotifications ? JSON.parse(savedNotifications) : [...DEFAULT_NOTIFICATIONS];

      const savedConnectors = localStorage.getItem(keys.CONNECTORS);
      this.connectors = savedConnectors ? JSON.parse(savedConnectors) : [...DEFAULT_CONNECTORS];

      const savedLogs = localStorage.getItem(keys.SYNC_LOGS);
      this.syncLogs = savedLogs ? JSON.parse(savedLogs) : [...DEFAULT_SYNC_LOGS];

      const savedChat = localStorage.getItem(keys.CHAT_SESSIONS);
      this.chatSessions = savedChat ? JSON.parse(savedChat) : [];
    } catch (e) {
      console.warn('Could not read from local cache:', e);
    }
  }

  private saveSettingsToCache() {
    const keys = getStorageKeys(this.activeUserId || 'default');
    try {
      localStorage.setItem(keys.SETTINGS, JSON.stringify(this.settings));
    } catch {}
  }

  private saveProductsToCache() {
    const keys = getStorageKeys(this.activeUserId || 'default');
    try {
      localStorage.setItem(keys.PRODUCTS, JSON.stringify(this.products));
    } catch {}
  }

  private saveCustomersToCache() {
    const keys = getStorageKeys(this.activeUserId || 'default');
    try {
      localStorage.setItem(keys.CUSTOMERS, JSON.stringify(this.customers));
    } catch {}
  }

  private saveTransactionsToCache() {
    const keys = getStorageKeys(this.activeUserId || 'default');
    try {
      localStorage.setItem(keys.TRANSACTIONS, JSON.stringify(this.transactions));
    } catch {}
  }

  private saveExpensesToCache() {
    const keys = getStorageKeys(this.activeUserId || 'default');
    try {
      localStorage.setItem(keys.EXPENSES, JSON.stringify(this.expenses));
    } catch {}
  }

  private saveNotificationsToCache() {
    const keys = getStorageKeys(this.activeUserId || 'default');
    try {
      localStorage.setItem(keys.NOTIFICATIONS, JSON.stringify(this.notifications));
    } catch {}
  }

  private saveConnectorsToCache() {
    const keys = getStorageKeys(this.activeUserId || 'default');
    try {
      localStorage.setItem(keys.CONNECTORS, JSON.stringify(this.connectors));
    } catch {}
  }

  private saveSyncLogsToCache() {
    const keys = getStorageKeys(this.activeUserId || 'default');
    try {
      localStorage.setItem(keys.SYNC_LOGS, JSON.stringify(this.syncLogs));
    } catch {}
  }

  private saveChatSessionsToCache() {
    const keys = getStorageKeys(this.activeUserId || 'default');
    try {
      localStorage.setItem(keys.CHAT_SESSIONS, JSON.stringify(this.chatSessions));
    } catch {}
  }

  // -------------------------------------------------------------
  // CHAT SESSIONS & HISTORY (ChatGPT Style)
  // -------------------------------------------------------------
  public getChatSessions(): ChatSession[] {
    return [...this.chatSessions].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  public getChatSession(id: string): ChatSession | undefined {
    return this.chatSessions.find((s) => s.id === id);
  }

  public createChatSession(title?: string, language: string = 'en'): ChatSession {
    const session: ChatSession = {
      id: `chat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: title || 'New Business Conversation',
      language,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.chatSessions.unshift(session);
    this.saveChatSessionsToCache();
    this.notify();
    return session;
  }

  public addChatMessageToSession(sessionId: string, message: ChatMessageData): void {
    const session = this.chatSessions.find((s) => s.id === sessionId);
    if (session) {
      if (!session.messages.some((m) => m.id === message.id)) {
        // Extra safeguard: prevent adding identical consecutive assistant responses
        const last = session.messages[session.messages.length - 1];
        if (
          last &&
          last.sender === message.sender &&
          message.sender === 'kopa' &&
          last.text === message.text
        ) {
          return;
        }
        session.messages.push(message);
      }
      session.updatedAt = new Date().toISOString();
      if (session.messages.length === 1 && message.sender === 'user') {
        session.title = message.text.length > 32 ? message.text.substring(0, 32) + '...' : message.text;
      }
      this.saveChatSessionsToCache();
      this.notify();
    }
  }

  public deleteChatSession(sessionId: string): void {
    this.chatSessions = this.chatSessions.filter((s) => s.id !== sessionId);
    this.saveChatSessionsToCache();
    this.notify();
  }

  // -------------------------------------------------------------
  // REACTIVE BROADCAST
  // -------------------------------------------------------------
  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (e) {
        console.error('Error in db subscriber:', e);
      }
    });
  }

  // -------------------------------------------------------------
  // PRODUCTS CRUD
  // -------------------------------------------------------------
  public getProducts(): Product[] {
    return [...this.products];
  }

  public getProduct(id: string): Product | undefined {
    return this.products.find((p) => p.id === id);
  }

  public addProduct(product: Omit<Product, 'id' | 'createdAt' | 'salesCount' | 'totalRevenue'> & { id?: string }): Product {
    const newProduct: Product = {
      ...product,
      id: product.id || `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      salesCount: 0,
      totalRevenue: 0,
      createdAt: new Date().toISOString(),
    };

    this.products.unshift(newProduct);
    this.saveProductsToCache();
    this.notify();

    if (this.activeUserId && firestore && isFirebaseConfigured) {
      setDoc(doc(firestore, 'users', this.activeUserId, 'products', newProduct.id), this.cleanForFirestore(newProduct)).catch((err) =>
        console.error('Firestore addProduct error:', err)
      );
    }

    return newProduct;
  }

  public updateProduct(id: string, updates: Partial<Omit<Product, 'id' | 'createdAt'>>): Product | null {
    const index = this.products.findIndex((p) => p.id === id);
    if (index === -1) return null;

    this.products[index] = { ...this.products[index], ...updates };
    this.saveProductsToCache();
    this.notify();

    if (this.activeUserId && firestore && isFirebaseConfigured) {
      setDoc(doc(firestore, 'users', this.activeUserId, 'products', id), this.cleanForFirestore(this.products[index]), { merge: true }).catch((err) =>
        console.error('Firestore updateProduct error:', err)
      );
    }

    return this.products[index];
  }

  public deleteProduct(id: string): boolean {
    const initialLen = this.products.length;
    this.products = this.products.filter((p) => p.id !== id);
    if (this.products.length !== initialLen) {
      this.saveProductsToCache();
      this.notify();

      if (this.activeUserId && firestore && isFirebaseConfigured) {
        deleteDoc(doc(firestore, 'users', this.activeUserId, 'products', id)).catch((err) =>
          console.error('Firestore deleteProduct error:', err)
        );
      }
      return true;
    }
    return false;
  }

  // -------------------------------------------------------------
  // CUSTOMERS CRUD
  // -------------------------------------------------------------
  public getCustomers(): Customer[] {
    return [...this.customers];
  }

  public getCustomer(id: string): Customer | undefined {
    return this.customers.find((c) => c.id === id);
  }

  public addCustomer(customer: Omit<Customer, 'id' | 'createdAt' | 'lastActivity' | 'totalPurchases'> & { id?: string; totalPurchases?: number }): Customer {
    const newCustomer: Customer = {
      ...customer,
      id: customer.id || `cust-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      totalPurchases: customer.totalPurchases || 0,
      lastActivity: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    this.customers.unshift(newCustomer);
    this.saveCustomersToCache();
    this.notify();

    if (this.activeUserId && firestore && isFirebaseConfigured) {
      setDoc(doc(firestore, 'users', this.activeUserId, 'customers', newCustomer.id), this.cleanForFirestore(newCustomer)).catch((err) =>
        console.error('Firestore addCustomer error:', err)
      );
    }

    return newCustomer;
  }

  public updateCustomer(id: string, updates: Partial<Omit<Customer, 'id' | 'createdAt'>>): Customer | null {
    const index = this.customers.findIndex((c) => c.id === id);
    if (index === -1) return null;

    this.customers[index] = {
      ...this.customers[index],
      ...updates,
      lastActivity: updates.lastActivity || new Date().toISOString(),
    };
    this.saveCustomersToCache();
    this.notify();

    if (this.activeUserId && firestore && isFirebaseConfigured) {
      setDoc(doc(firestore, 'users', this.activeUserId, 'customers', id), this.cleanForFirestore(this.customers[index]), { merge: true }).catch((err) =>
        console.error('Firestore updateCustomer error:', err)
      );
    }

    return this.customers[index];
  }

  public deleteCustomer(id: string): boolean {
    const initialLen = this.customers.length;
    this.customers = this.customers.filter((c) => c.id !== id);
    if (this.customers.length !== initialLen) {
      this.saveCustomersToCache();
      this.notify();

      if (this.activeUserId && firestore && isFirebaseConfigured) {
        deleteDoc(doc(firestore, 'users', this.activeUserId, 'customers', id)).catch((err) =>
          console.error('Firestore deleteCustomer error:', err)
        );
      }
      return true;
    }
    return false;
  }

  // -------------------------------------------------------------
  // TRANSACTIONS CRUD (With Inventory & Ledger Integrity)
  // -------------------------------------------------------------
  public getTransactions(): Transaction[] {
    return [...this.transactions];
  }

  public getTransaction(id: string): Transaction | undefined {
    return this.transactions.find((t) => t.id === id);
  }

  public addTransaction(transaction: Omit<Transaction, 'id' | 'createdAt'> & { id?: string }): Transaction {
    const newTx: Transaction = {
      ...transaction,
      id: transaction.id || `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };

    this.transactions.unshift(newTx);
    this.saveTransactionsToCache();

    // Side-effects on linked products and customers
    if (newTx.type === 'sale') {
      if (newTx.productId && newTx.quantity) {
        const prod = this.getProduct(newTx.productId);
        if (prod) {
          const newStock = Math.max(0, prod.stock - newTx.quantity);
          this.updateProduct(prod.id, {
            stock: newStock,
            salesCount: prod.salesCount + newTx.quantity,
            totalRevenue: prod.totalRevenue + newTx.amount,
          });

          // Check if low stock notification should be triggered
          if (newStock <= prod.minStockAlert) {
            this.addNotification({
              type: 'stock',
              title: 'Low Stock Alert',
              message: `${prod.name} has only ${newStock} unit(s) remaining (threshold: ${prod.minStockAlert}).`,
              actionUrl: '#products',
            });
          }
        }
      }

      if (newTx.customerId) {
        const cust = this.getCustomer(newTx.customerId);
        if (cust) {
          this.updateCustomer(cust.id, {
            totalPurchases: cust.totalPurchases + newTx.amount,
            lastActivity: new Date().toISOString(),
          });
        }
      }
    } else if (newTx.type === 'payment' && newTx.customerId) {
      // Repaying a debt
      const cust = this.getCustomer(newTx.customerId);
      if (cust) {
        this.updateCustomer(cust.id, {
          outstandingBalance: Math.max(0, cust.outstandingBalance - newTx.amount),
          lastActivity: new Date().toISOString(),
        });
      }
    } else if (newTx.type === 'debt' && newTx.customerId) {
      // Adding new customer debt
      const cust = this.getCustomer(newTx.customerId);
      if (cust) {
        this.updateCustomer(cust.id, {
          outstandingBalance: cust.outstandingBalance + newTx.amount,
          lastActivity: new Date().toISOString(),
        });
      }
    } else if (newTx.type === 'expense') {
      // Automatically keep expense registry in sync
      this.addExpense({
        category: newTx.category || 'General',
        description: newTx.title,
        amount: newTx.amount,
        date: newTx.date,
        isRecurring: false,
      });
    }

    this.notify();

    if (this.activeUserId && firestore && isFirebaseConfigured) {
      setDoc(doc(firestore, 'users', this.activeUserId, 'transactions', newTx.id), this.cleanForFirestore(newTx)).catch((err) =>
        console.error('Firestore addTransaction error:', err)
      );
    }

    return newTx;
  }

  public updateTransaction(id: string, updates: Partial<Omit<Transaction, 'id' | 'createdAt'>>): Transaction | null {
    const index = this.transactions.findIndex((t) => t.id === id);
    if (index === -1) return null;

    this.transactions[index] = { ...this.transactions[index], ...updates };
    this.saveTransactionsToCache();
    this.notify();

    if (this.activeUserId && firestore && isFirebaseConfigured) {
      setDoc(doc(firestore, 'users', this.activeUserId, 'transactions', id), this.cleanForFirestore(this.transactions[index]), { merge: true }).catch((err) =>
        console.error('Firestore updateTransaction error:', err)
      );
    }

    return this.transactions[index];
  }

  public deleteTransaction(id: string): boolean {
    const initialLen = this.transactions.length;
    this.transactions = this.transactions.filter((t) => t.id !== id);
    if (this.transactions.length !== initialLen) {
      this.saveTransactionsToCache();
      this.notify();

      if (this.activeUserId && firestore && isFirebaseConfigured) {
        deleteDoc(doc(firestore, 'users', this.activeUserId, 'transactions', id)).catch((err) =>
          console.error('Firestore deleteTransaction error:', err)
        );
      }
      return true;
    }
    return false;
  }

  // -------------------------------------------------------------
  // EXPENSES CRUD
  // -------------------------------------------------------------
  public getExpenses(): Expense[] {
    return [...this.expenses];
  }

  public getExpense(id: string): Expense | undefined {
    return this.expenses.find((e) => e.id === id);
  }

  public addExpense(expense: Omit<Expense, 'id' | 'createdAt'> & { id?: string }): Expense {
    const newExp: Expense = {
      ...expense,
      id: expense.id || `exp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };

    this.expenses.unshift(newExp);
    this.saveExpensesToCache();
    this.notify();

    if (this.activeUserId && firestore && isFirebaseConfigured) {
      setDoc(doc(firestore, 'users', this.activeUserId, 'expenses', newExp.id), this.cleanForFirestore(newExp)).catch((err) =>
        console.error('Firestore addExpense error:', err)
      );
    }

    return newExp;
  }

  public updateExpense(id: string, updates: Partial<Omit<Expense, 'id' | 'createdAt'>>): Expense | null {
    const index = this.expenses.findIndex((e) => e.id === id);
    if (index === -1) return null;

    this.expenses[index] = { ...this.expenses[index], ...updates };
    this.saveExpensesToCache();
    this.notify();

    if (this.activeUserId && firestore && isFirebaseConfigured) {
      setDoc(doc(firestore, 'users', this.activeUserId, 'expenses', id), this.cleanForFirestore(this.expenses[index]), { merge: true }).catch((err) =>
        console.error('Firestore updateExpense error:', err)
      );
    }

    return this.expenses[index];
  }

  public deleteExpense(id: string): boolean {
    const initialLen = this.expenses.length;
    this.expenses = this.expenses.filter((e) => e.id !== id);
    if (this.expenses.length !== initialLen) {
      this.saveExpensesToCache();
      this.notify();

      if (this.activeUserId && firestore && isFirebaseConfigured) {
        deleteDoc(doc(firestore, 'users', this.activeUserId, 'expenses', id)).catch((err) =>
          console.error('Firestore deleteExpense error:', err)
        );
      }
      return true;
    }
    return false;
  }

  // -------------------------------------------------------------
  // NOTIFICATIONS CRUD
  // -------------------------------------------------------------
  public getNotifications(): NotificationItem[] {
    return [...this.notifications];
  }

  public addNotification(notif: Omit<NotificationItem, 'id' | 'date' | 'read'> & { id?: string; read?: boolean }): NotificationItem {
    const newNotif: NotificationItem = {
      ...notif,
      id: notif.id || `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      date: new Date().toISOString(),
      read: notif.read ?? false,
    };

    this.notifications.unshift(newNotif);
    this.saveNotificationsToCache();
    this.notify();

    if (this.activeUserId && firestore && isFirebaseConfigured) {
      setDoc(doc(firestore, 'users', this.activeUserId, 'notifications', newNotif.id), this.cleanForFirestore(newNotif)).catch((err) =>
        console.error('Firestore addNotification error:', err)
      );
    }

    return newNotif;
  }

  public markNotificationRead(id: string): void {
    const notif = this.notifications.find((n) => n.id === id);
    if (notif) {
      notif.read = true;
      this.saveNotificationsToCache();
      this.notify();

      if (this.activeUserId && firestore && isFirebaseConfigured) {
        setDoc(doc(firestore, 'users', this.activeUserId, 'notifications', id), { read: true }, { merge: true }).catch((err) =>
          console.error('Firestore markNotificationRead error:', err)
        );
      }
    }
  }

  public markAllNotificationsRead(): void {
    this.notifications.forEach((n) => (n.read = true));
    this.saveNotificationsToCache();
    this.notify();

    const uid = this.activeUserId;
    if (uid && firestore && isFirebaseConfigured) {
      const fs = firestore;
      this.notifications.forEach((n) => {
        setDoc(doc(fs, 'users', uid, 'notifications', n.id), { read: true }, { merge: true }).catch(() => {});
      });
    }
  }

  public deleteNotification(id: string): boolean {
    const initialLen = this.notifications.length;
    this.notifications = this.notifications.filter((n) => n.id !== id);
    if (this.notifications.length !== initialLen) {
      this.saveNotificationsToCache();
      this.notify();

      const uid = this.activeUserId;
      if (uid && firestore && isFirebaseConfigured) {
        deleteDoc(doc(firestore, 'users', uid, 'notifications', id)).catch((err) =>
          console.error('Firestore deleteNotification error:', err)
        );
      }
      return true;
    }
    return false;
  }

  // -------------------------------------------------------------
  // SETTINGS & BUSINESS PROFILE
  // -------------------------------------------------------------
  public getSettings(): BusinessSettings {
    return { ...this.settings };
  }

  public updateSettings(updates: Partial<BusinessSettings>): BusinessSettings {
    this.settings = { ...this.settings, ...updates };
    this.saveSettingsToCache();
    this.notify();

    if (this.activeUserId && firestore && isFirebaseConfigured) {
      setDoc(doc(firestore, 'users', this.activeUserId), this.cleanForFirestore(this.settings), { merge: true }).catch((err) =>
        console.error('Firestore updateSettings error:', err)
      );
    }

    return { ...this.settings };
  }

  public resetToSampleData(): void {
    this.settings = { ...DEFAULT_SETTINGS };
    this.products = [...DEFAULT_PRODUCTS];
    this.customers = [...DEFAULT_CUSTOMERS];
    this.transactions = [...DEFAULT_TRANSACTIONS];
    this.expenses = [...DEFAULT_EXPENSES];
    this.notifications = [...DEFAULT_NOTIFICATIONS];
    this.saveSettingsToCache();
    this.saveProductsToCache();
    this.saveCustomersToCache();
    this.saveTransactionsToCache();
    this.saveExpensesToCache();
    this.saveNotificationsToCache();
    this.notify();
  }

  // -------------------------------------------------------------
  // CONNECTORS & MCP INTEGRATIONS
  // -------------------------------------------------------------
  public getConnectors(): ConnectorConnection[] {
    return [...this.connectors];
  }

  public getConnector(provider: string): ConnectorConnection | undefined {
    return this.connectors.find((c) => c.provider === provider || c.id === provider);
  }

  public saveConnector(connection: ConnectorConnection): ConnectorConnection {
    const index = this.connectors.findIndex((c) => c.id === connection.id || c.provider === connection.provider);
    if (index !== -1) {
      this.connectors[index] = { ...this.connectors[index], ...connection };
    } else {
      this.connectors.push(connection);
    }
    this.saveConnectorsToCache();
    this.notify();

    if (this.activeUserId && firestore && isFirebaseConfigured) {
      setDoc(
        doc(firestore, 'users', this.activeUserId, 'connectors', connection.id || connection.provider),
        this.cleanForFirestore(connection),
        { merge: true }
      ).catch((err) => console.error('Firestore saveConnector error:', err));
    }

    return connection;
  }

  public disconnectConnector(providerId: string): boolean {
    const beforeLen = this.connectors.length;
    this.connectors = this.connectors.filter((c) => c.provider !== providerId && c.id !== providerId);
    if (this.connectors.length !== beforeLen) {
      this.saveConnectorsToCache();
      this.notify();

      if (this.activeUserId && firestore && isFirebaseConfigured) {
        deleteDoc(doc(firestore, 'users', this.activeUserId, 'connectors', providerId)).catch((err) =>
          console.error('Firestore disconnectConnector error:', err)
        );
      }
      return true;
    }
    return false;
  }

  public getSyncLogs(provider?: string): SyncLogEntry[] {
    if (provider) {
      return this.syncLogs.filter((l) => l.provider === provider);
    }
    return [...this.syncLogs];
  }

  public addSyncLog(log: SyncLogEntry): SyncLogEntry {
    this.syncLogs.unshift(log);
    // Keep max 100 logs
    if (this.syncLogs.length > 100) {
      this.syncLogs = this.syncLogs.slice(0, 100);
    }
    this.saveSyncLogsToCache();
    this.notify();

    if (this.activeUserId && firestore && isFirebaseConfigured) {
      setDoc(doc(firestore, 'users', this.activeUserId, 'sync_logs', log.id), this.cleanForFirestore(log)).catch(
        (err) => console.error('Firestore addSyncLog error:', err)
      );
    }

    return log;
  }

  // -------------------------------------------------------------
  // METRICS & FINANCIAL CALCULATIONS
  // Note: STRICT RULE: Never invent profit or cost data.
  // If product cost is unavailable, clearly show Cost not set
  // and exclude it from profit calculations.
  // -------------------------------------------------------------
  public getMetrics(periodDays: number = 30) {
    const cutoff = periodDays > 0 ? Date.now() - periodDays * 86400000 : 0;

    const filteredTx = this.transactions.filter((t) => {
      if (t.status === 'cancelled') return false;
      if (cutoff === 0) return true;
      return new Date(t.date).getTime() >= cutoff;
    });

    const salesTx = filteredTx.filter((t) => t.type === 'sale');
    const totalRevenue = salesTx.reduce((sum, t) => sum + t.amount, 0);

    const filteredExpenses = this.expenses.filter((e) => {
      if (cutoff === 0) return true;
      return new Date(e.date).getTime() >= cutoff;
    });
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

    // Calculate gross profit ONLY where cost data exists
    let estimatedGrossProfit = 0;
    let itemsWithMissingCostCount = 0;
    let verifiedCostedRevenue = 0;

    salesTx.forEach((tx) => {
      let unitCost: number | null = tx.cost ?? null;

      // If transaction doesn't have cost, attempt lookup from product definition
      if (unitCost === null && tx.productId) {
        const prod = this.getProduct(tx.productId);
        if (prod && prod.costPrice !== null) {
          unitCost = prod.costPrice;
        }
      }

      if (unitCost !== null && unitCost !== undefined) {
        const qty = tx.quantity || 1;
        const totalCost = unitCost * qty;
        estimatedGrossProfit += tx.amount - totalCost;
        verifiedCostedRevenue += tx.amount;
      } else {
        // Cost is missing! Exclude from profit calculation
        itemsWithMissingCostCount += tx.quantity || 1;
      }
    });

    // Outstanding customer debts across all customers
    const outstandingDebts = this.customers.reduce((sum, c) => sum + Math.max(0, c.outstandingBalance), 0);

    // Inventory valuation
    let inventoryValuationAtSellingPrice = 0;
    let inventoryValuationAtCostPrice = 0;
    let inventoryItemsMissingCost = 0;

    this.products.forEach((p) => {
      inventoryValuationAtSellingPrice += p.sellingPrice * p.stock;
      if (p.costPrice !== null && p.costPrice !== undefined) {
        inventoryValuationAtCostPrice += p.costPrice * p.stock;
      } else {
        inventoryItemsMissingCost += p.stock;
      }
    });

    return {
      periodDays,
      totalRevenue,
      totalExpenses,
      estimatedGrossProfit,
      hasIncompleteCostData: itemsWithMissingCostCount > 0,
      itemsWithMissingCostCount,
      verifiedCostedRevenue,
      totalTransactions: filteredTx.length,
      outstandingDebts,
      currentInventoryValue: inventoryValuationAtSellingPrice,
      inventoryValue: inventoryValuationAtSellingPrice,
      inventoryValuationAtCostPrice,
      inventoryItemsMissingCost,
      uncostedInventoryItems: inventoryItemsMissingCost,
    };
  }
}

// Global Singleton Database Instance
export const db = new KopaDatabase();
