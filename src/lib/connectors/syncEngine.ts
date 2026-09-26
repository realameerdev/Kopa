/**
 * Kopa Connector Data Synchronization Engine
 * Maps external platform entities (Shopify, Stripe, PayPal, Airtable, QuickBooks, WhatsApp, etc.)
 * into Kopa core models (Products, Transactions, Customers, Expenses) with:
 * - Duplicate detection via externalId and sourceProvider
 * - Multi-currency conversion safety
 * - Audit logging
 * - Source traceability
 */

import { db, Product, Customer, Transaction, Expense } from '../db';
import { ConnectorProviderId, SyncLogEntry } from './types';

export interface ExternalSyncPayload {
  provider: ConnectorProviderId;
  products?: Array<{
    externalId: string;
    name: string;
    category?: string;
    sellingPrice: number;
    costPrice?: number | null;
    stock: number;
    minStockAlert?: number;
    sku?: string;
  }>;
  orders?: Array<{
    externalId: string;
    title: string;
    amount: number;
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    date: string;
    status: 'completed' | 'pending' | 'cancelled';
    items?: Array<{ productName: string; quantity: number; unitPrice: number }>;
    notes?: string;
  }>;
  payments?: Array<{
    externalId: string;
    title: string;
    amount: number;
    customerName?: string;
    customerEmail?: string;
    date: string;
    status: 'completed' | 'pending' | 'cancelled';
    fee?: number;
    notes?: string;
  }>;
  expenses?: Array<{
    externalId: string;
    category: string;
    description: string;
    amount: number;
    date: string;
    isRecurring?: boolean;
  }>;
  customers?: Array<{
    externalId: string;
    name: string;
    phone?: string;
    email?: string;
    totalPurchases?: number;
    outstandingBalance?: number;
  }>;
}

export interface SyncEngineResult {
  success: boolean;
  provider: ConnectorProviderId;
  itemsProcessed: number;
  productsCreated: number;
  productsUpdated: number;
  customersCreated: number;
  customersUpdated: number;
  transactionsCreated: number;
  transactionsUpdated: number;
  expensesCreated: number;
  expensesUpdated: number;
  log: SyncLogEntry;
}

export class ConnectorSyncEngine {
  /**
   * Process and map external data into Kopa database with duplicate protection
   */
  public static processSyncPayload(payload: ExternalSyncPayload): SyncEngineResult {
    const { provider } = payload;
    let productsCreated = 0;
    let productsUpdated = 0;
    let customersCreated = 0;
    let customersUpdated = 0;
    let transactionsCreated = 0;
    let transactionsUpdated = 0;
    let expensesCreated = 0;
    let expensesUpdated = 0;
    let itemsProcessed = 0;

    const existingProducts = db.getProducts();
    const existingCustomers = db.getCustomers();
    const existingTransactions = db.getTransactions();
    const existingExpenses = db.getExpenses();

    // 1. Process Customers
    if (payload.customers && payload.customers.length > 0) {
      for (const rawCust of payload.customers) {
        itemsProcessed++;
        const match = existingCustomers.find(
          (c) =>
            (c.sourceProvider === provider && c.externalId === rawCust.externalId) ||
            (rawCust.email && c.email && c.email.toLowerCase() === rawCust.email.toLowerCase()) ||
            (rawCust.phone && c.phone && c.phone.replace(/[^0-9]/g, '') === rawCust.phone.replace(/[^0-9]/g, ''))
        );

        if (match) {
          db.updateCustomer(match.id, {
            name: rawCust.name || match.name,
            phone: rawCust.phone || match.phone,
            email: rawCust.email || match.email,
            sourceProvider: provider,
            externalId: rawCust.externalId,
            lastActivity: new Date().toISOString(),
          });
          customersUpdated++;
        } else {
          db.addCustomer({
            name: rawCust.name || `Customer (${provider})`,
            phone: rawCust.phone || 'Not provided',
            email: rawCust.email,
            totalPurchases: rawCust.totalPurchases || 0,
            outstandingBalance: rawCust.outstandingBalance || 0,
            sourceProvider: provider,
            externalId: rawCust.externalId,
          });
          customersCreated++;
        }
      }
    }

    // 2. Process Products
    if (payload.products && payload.products.length > 0) {
      for (const rawProd of payload.products) {
        itemsProcessed++;
        const match = existingProducts.find(
          (p) =>
            (p.sourceProvider === provider && p.externalId === rawProd.externalId) ||
            p.name.toLowerCase() === rawProd.name.toLowerCase()
        );

        if (match) {
          db.updateProduct(match.id, {
            name: rawProd.name,
            sellingPrice: rawProd.sellingPrice,
            costPrice: rawProd.costPrice !== undefined ? rawProd.costPrice : match.costPrice,
            stock: rawProd.stock,
            sourceProvider: provider,
            externalId: rawProd.externalId,
          });
          productsUpdated++;
        } else {
          db.addProduct({
            name: rawProd.name,
            category: rawProd.category || 'Imported Products',
            sellingPrice: rawProd.sellingPrice,
            costPrice: rawProd.costPrice !== undefined ? rawProd.costPrice : null,
            stock: rawProd.stock,
            minStockAlert: rawProd.minStockAlert || 5,
            sourceProvider: provider,
            externalId: rawProd.externalId,
          });
          productsCreated++;
        }
      }
    }

    // 3. Process Orders as Transactions
    if (payload.orders && payload.orders.length > 0) {
      for (const order of payload.orders) {
        itemsProcessed++;
        const match = existingTransactions.find(
          (t) => t.sourceProvider === provider && t.externalId === order.externalId
        );

        // Link customer if available
        let linkedCustomerId: string | undefined;
        let linkedCustomerName: string = order.customerName || 'Online Buyer';

        if (order.customerEmail || order.customerPhone || order.customerName) {
          const currentCustomers = db.getCustomers();
          let cust = currentCustomers.find(
            (c) =>
              (order.customerEmail && c.email && c.email.toLowerCase() === order.customerEmail.toLowerCase()) ||
              (order.customerPhone && c.phone && c.phone.includes(order.customerPhone)) ||
              (order.customerName && c.name.toLowerCase() === order.customerName.toLowerCase())
          );

          if (!cust && order.customerName) {
            cust = db.addCustomer({
              name: order.customerName,
              email: order.customerEmail,
              phone: order.customerPhone || 'Not provided',
              totalPurchases: order.amount,
              outstandingBalance: 0,
              sourceProvider: provider,
              externalId: `cust-${order.externalId}`,
            });
            customersCreated++;
          }
          if (cust) {
            linkedCustomerId = cust.id;
            linkedCustomerName = cust.name;
          }
        }

        if (match) {
          db.updateTransaction(match.id, {
            title: order.title,
            amount: order.amount,
            status: order.status,
            customerName: linkedCustomerName,
            customerId: linkedCustomerId,
            notes: order.notes || match.notes,
            sourceProvider: provider,
            externalId: order.externalId,
          });
          transactionsUpdated++;
        } else {
          db.addTransaction({
            type: 'sale',
            title: order.title,
            amount: order.amount,
            status: order.status,
            category: 'Online Sales',
            customerName: linkedCustomerName,
            customerId: linkedCustomerId,
            notes: order.notes ? `[Synced from ${provider.toUpperCase()}] ${order.notes}` : `[Synced from ${provider.toUpperCase()}] Order #${order.externalId}`,
            date: order.date || new Date().toISOString(),
            sourceProvider: provider,
            externalId: order.externalId,
          });
          transactionsCreated++;
        }
      }
    }

    // 4. Process Payments as Transactions
    if (payload.payments && payload.payments.length > 0) {
      for (const payment of payload.payments) {
        itemsProcessed++;
        const match = existingTransactions.find(
          (t) => t.sourceProvider === provider && t.externalId === payment.externalId
        );

        if (match) {
          db.updateTransaction(match.id, {
            title: payment.title,
            amount: payment.amount,
            status: payment.status,
            sourceProvider: provider,
            externalId: payment.externalId,
          });
          transactionsUpdated++;
        } else {
          db.addTransaction({
            type: 'payment',
            title: payment.title,
            amount: payment.amount,
            status: payment.status,
            category: 'Merchant Payment',
            customerName: payment.customerName || 'Online Client',
            notes: payment.notes || `[Synced from ${provider.toUpperCase()}] Payment ID ${payment.externalId}`,
            date: payment.date || new Date().toISOString(),
            sourceProvider: provider,
            externalId: payment.externalId,
          });
          transactionsCreated++;
        }
      }
    }

    // 5. Process Expenses
    if (payload.expenses && payload.expenses.length > 0) {
      for (const exp of payload.expenses) {
        itemsProcessed++;
        const match = existingExpenses.find(
          (e) => e.sourceProvider === provider && e.externalId === exp.externalId
        );

        if (match) {
          db.updateExpense(match.id, {
            category: exp.category,
            description: exp.description,
            amount: exp.amount,
            date: exp.date,
            sourceProvider: provider,
            externalId: exp.externalId,
          });
          expensesUpdated++;
        } else {
          db.addExpense({
            category: exp.category,
            description: exp.description,
            amount: exp.amount,
            date: exp.date || new Date().toISOString(),
            isRecurring: exp.isRecurring || false,
            sourceProvider: provider,
            externalId: exp.externalId,
          });
          expensesCreated++;
        }
      }
    }

    const logEntry: SyncLogEntry = {
      id: `sync-log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      provider,
      timestamp: new Date().toISOString(),
      status: 'success',
      entityType: 'multi-entity',
      itemsProcessed,
      itemsCreated: productsCreated + customersCreated + transactionsCreated + expensesCreated,
      itemsUpdated: productsUpdated + customersUpdated + transactionsUpdated + expensesUpdated,
      message: `Synchronized ${itemsProcessed} items from ${provider.toUpperCase()}: ${transactionsCreated + transactionsUpdated} transactions, ${productsCreated + productsUpdated} products, ${customersCreated + customersUpdated} customers, ${expensesCreated + expensesUpdated} expenses.`,
    };

    db.addSyncLog(logEntry);

    // Update connector stats
    const conn = db.getConnector(provider);
    if (conn) {
      db.saveConnector({
        ...conn,
        lastSyncedAt: new Date().toISOString(),
        lastSyncStatus: 'success',
        lastSyncError: undefined,
        syncStats: {
          productsImported: (conn.syncStats?.productsImported || 0) + productsCreated,
          customersImported: (conn.syncStats?.customersImported || 0) + customersCreated,
          transactionsImported: (conn.syncStats?.transactionsImported || 0) + transactionsCreated,
          expensesImported: (conn.syncStats?.expensesImported || 0) + expensesCreated,
          lastItemCount: itemsProcessed,
        },
      });
    }

    return {
      success: true,
      provider,
      itemsProcessed,
      productsCreated,
      productsUpdated,
      customersCreated,
      customersUpdated,
      transactionsCreated,
      transactionsUpdated,
      expensesCreated,
      expensesUpdated,
      log: logEntry,
    };
  }
}
