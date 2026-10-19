"use client";

import { useEffect, useMemo, useState } from "react";
import { getRecords } from "../../../lib/storage/db";
import type { Customer, Expense, Invoice, Payment } from "../../../types";

export default function ReportsPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [error, setError] = useState("");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    loadReportData();
  }, []);

  async function loadReportData() {
    try {
      setError("");

      const [customerRecords, invoiceRecords, paymentRecords, expenseRecords] =
        await Promise.all([
          getRecords("customers"),
          getRecords("invoices"),
          getRecords("payments"),
          getRecords("expenses"),
        ]);

      setCustomers(customerRecords as unknown as Customer[]);
      setInvoices(invoiceRecords as unknown as Invoice[]);
      setPayments(paymentRecords as unknown as Payment[]);
      setExpenses(expenseRecords as unknown as Expense[]);
    } catch (error) {
      console.error("Failed to load report data:", error);
      setError("Failed to load report data.");
    }
  }

  function formatCurrency(value: number) {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  function formatDate(date: string) {
    if (!date) {
      return "-";
    }

    return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function isDateInRange(date: string, from: string, to: string) {
    if (from && date < from) {
      return false;
    }

    if (to && date > to) {
      return false;
    }

    return true;
  }

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) =>
      isDateInRange(invoice.issueDate, fromDate, toDate),
    );
  }, [invoices, fromDate, toDate]);

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) =>
      isDateInRange(payment.paymentDate, fromDate, toDate),
    );
  }, [payments, fromDate, toDate]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) =>
      isDateInRange(expense.expenseDate, fromDate, toDate),
    );
  }, [expenses, fromDate, toDate]);

  const totalInvoiced = useMemo(() => {
    return filteredInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
  }, [filteredInvoices]);

  const totalCollected = useMemo(() => {
    return filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
  }, [filteredPayments]);

  const totalOutstanding = useMemo(() => {
    const payableStatuses = ["issued", "unpaid", "partial", "overdue"];

    return filteredInvoices
      .filter((invoice) => payableStatuses.includes(invoice.status))
      .reduce((sum, invoice) => {
        const outstanding = Math.max(invoice.total - invoice.paidAmount, 0);

        return sum + outstanding;
      }, 0);
  }, [filteredInvoices]);

  const totalExpenses = useMemo(() => {
    return filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [filteredExpenses]);

  const netCashFlow = useMemo(() => {
    return totalCollected - totalExpenses;
  }, [totalCollected, totalExpenses]);

  const invoiceStatusSummary = useMemo(() => {
    return {
      draft: filteredInvoices.filter((invoice) => invoice.status === "draft")
        .length,

      submitted: filteredInvoices.filter(
        (invoice) => invoice.status === "submitted",
      ).length,

      approved: filteredInvoices.filter(
        (invoice) => invoice.status === "approved",
      ).length,

      issued: filteredInvoices.filter((invoice) => invoice.status === "issued")
        .length,

      unpaid: filteredInvoices.filter((invoice) => invoice.status === "unpaid")
        .length,

      partial: filteredInvoices.filter(
        (invoice) => invoice.status === "partial",
      ).length,

      paid: filteredInvoices.filter((invoice) => invoice.status === "paid")
        .length,

      overdue: filteredInvoices.filter(
        (invoice) => invoice.status === "overdue",
      ).length,

      rejected: filteredInvoices.filter(
        (invoice) => invoice.status === "rejected",
      ).length,

      cancelled: filteredInvoices.filter(
        (invoice) => invoice.status === "cancelled",
      ).length,
    };
  }, [filteredInvoices]);

  const expenseCategorySummary = useMemo(() => {
    const summary = new Map<string, { total: number; count: number }>();

    for (const expense of filteredExpenses) {
      const category = expense.category.trim() || "Uncategorized";

      const current = summary.get(category) ?? {
        total: 0,
        count: 0,
      };

      summary.set(category, {
        total: current.total + expense.amount,
        count: current.count + 1,
      });
    }

    return Array.from(summary.entries())
      .map(([category, data]) => ({
        category,
        total: data.total,
        count: data.count,
      }))
      .sort((a, b) => b.total - a.total);
  }, [filteredExpenses]);

  const paymentMethodSummary = useMemo(() => {
    const summary = {
      cash: {
        count: 0,
        total: 0,
      },
      bank: {
        count: 0,
        total: 0,
      },
      mobile: {
        count: 0,
        total: 0,
      },
      other: {
        count: 0,
        total: 0,
      },
    };

    for (const payment of filteredPayments) {
      summary[payment.method].count += 1;
      summary[payment.method].total += payment.amount;
    }

    return summary;
  }, [filteredPayments]);

  const sortedPayments = useMemo(() => {
    return [...filteredPayments].sort(
      (a, b) =>
        new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime(),
    );
  }, [filteredPayments]);

  const sortedExpenses = useMemo(() => {
    return [...filteredExpenses].sort(
      (a, b) =>
        new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime(),
    );
  }, [filteredExpenses]);

  const sortedInvoices = useMemo(() => {
    return [...filteredInvoices].sort(
      (a, b) =>
        new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime(),
    );
  }, [filteredInvoices]);

  const customerSummary = useMemo(() => {
    const summary = new Map<
      string,
      {
        customerId: string;
        invoiceCount: number;
        totalInvoiced: number;
        totalPaid: number;
        outstanding: number;
      }
    >();

    filteredInvoices.forEach((invoice) => {
      const existing = summary.get(invoice.customerId);

      const invoiceOutstanding = Math.max(
        invoice.total - invoice.paidAmount,
        0,
      );

      if (existing) {
        existing.invoiceCount += 1;
        existing.totalInvoiced += invoice.total;
        existing.totalPaid += invoice.paidAmount;
        existing.outstanding += invoiceOutstanding;
      } else {
        summary.set(invoice.customerId, {
          customerId: invoice.customerId,
          invoiceCount: 1,
          totalInvoiced: invoice.total,
          totalPaid: invoice.paidAmount,
          outstanding: invoiceOutstanding,
        });
      }
    });

    return Array.from(summary.values()).sort(
      (a, b) => b.outstanding - a.outstanding,
    );
  }, [filteredInvoices]);

  function getCustomer(customerId: string) {
    return customers.find((customer) => customer.id === customerId);
  }

  function getInvoiceNumber(invoiceId: string) {
    const invoice = invoices.find((item) => item.id === invoiceId);

    return invoice?.invoiceNumber ?? "-";
  }

  function getPaymentMethodLabel(method: Payment["method"]) {
    switch (method) {
      case "cash":
        return "Cash";

      case "bank":
        return "Bank Transfer";

      case "mobile":
        return "Mobile Payment";

      default:
        return "Other";
    }
  }

  function getInvoiceTypeLabel(invoice: Invoice) {
    switch (invoice.invoiceType) {
      case "sales":
        return "Sales Invoice";

      case "credit_note":
        return "Credit Note";

      case "debit_note":
        return "Debit Note";

      default:
        return "Invoice";
    }
  }

  function getInvoiceStatusClasses(status: Invoice["status"]) {
    switch (status) {
      case "paid":
        return "border-emerald-200 bg-emerald-50 text-emerald-800";

      case "partial":
      case "unpaid":
        return "border-amber-200 bg-amber-50 text-amber-800";

      case "overdue":
        return "border-red-200 bg-red-50 text-red-800";

      case "cancelled":
      case "rejected":
        return "border-red-200 bg-red-50 text-red-800";

      case "issued":
      case "approved":
        return "border-blue-200 bg-blue-50 text-blue-800";

      case "submitted":
        return "border-violet-200 bg-violet-50 text-violet-800";

      case "draft":
      default:
        return "border-slate-200 bg-slate-50 text-slate-700";
    }
  }

  function getInvoiceStatusLabel(status: Invoice["status"]) {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  const hasActiveDateFilter = fromDate || toDate;

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Business Reports
          </h1>

          <p className="mt-1 text-sm text-slate-600">
            Overview of invoices, payments, expenses, and cash flow.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
            {error}
          </div>
        )}

        {/* Date Filters */}
        <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Report Period
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Select a date range to calculate the report.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* From Date */}
            <div>
              <label
                htmlFor="fromDate"
                className="mb-2 block text-sm font-medium text-slate-800"
              >
                From Date
              </label>

              <input
                id="fromDate"
                type="date"
                value={fromDate}
                max={toDate || undefined}
                onChange={(event) => setFromDate(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            {/* To Date */}
            <div>
              <label
                htmlFor="toDate"
                className="mb-2 block text-sm font-medium text-slate-800"
              >
                To Date
              </label>

              <input
                id="toDate"
                type="date"
                value={toDate}
                min={fromDate || undefined}
                onChange={(event) => setToDate(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>
          </div>

          {hasActiveDateFilter && (
            <div className="mt-4 flex items-center justify-between gap-4 border-t border-slate-200 pt-4">
              <p className="text-sm text-slate-600">
                Showing data from{" "}
                <span className="font-semibold text-slate-900">
                  {fromDate || "beginning"}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-slate-900">
                  {toDate || "today"}
                </span>
                .
              </p>

              <button
                type="button"
                onClick={() => {
                  setFromDate("");
                  setToDate("");
                }}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Clear Dates
              </button>
            </div>
          )}
        </div>

        {/* Financial Overview */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Financial Overview
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Total Invoiced
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {formatCurrency(totalInvoiced)} ETB
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {filteredInvoices.length} invoice
                {filteredInvoices.length === 1 ? "" : "s"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Total Collected
              </p>

              <p className="mt-2 text-2xl font-bold text-emerald-700">
                {formatCurrency(totalCollected)} ETB
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {filteredPayments.length} payment
                {filteredPayments.length === 1 ? "" : "s"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Outstanding</p>

              <p className="mt-2 text-2xl font-bold text-amber-700">
                {formatCurrency(totalOutstanding)} ETB
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Amount still receivable
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Total Expenses
              </p>

              <p className="mt-2 text-2xl font-bold text-red-700">
                {formatCurrency(totalExpenses)} ETB
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {filteredExpenses.length} expense
                {filteredExpenses.length === 1 ? "" : "s"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Net Cash Flow
              </p>

              <p
                className={`mt-2 text-2xl font-bold ${
                  netCashFlow >= 0 ? "text-emerald-700" : "text-red-700"
                }`}
              >
                {formatCurrency(netCashFlow)} ETB
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Collected minus expenses
              </p>
            </div>
          </div>
        </div>

        {/* Invoice Summary */}
        <div className="mb-8 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Invoice Status Summary
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Number of invoices currently in each status.
            </p>
          </div>

          <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-500">Draft</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {invoiceStatusSummary.draft}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-500">Submitted</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {invoiceStatusSummary.submitted}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-500">Approved</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {invoiceStatusSummary.approved}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-500">Issued</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {invoiceStatusSummary.issued}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-500">Unpaid</p>
              <p className="mt-2 text-2xl font-bold text-amber-700">
                {invoiceStatusSummary.unpaid}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-500">Partial</p>
              <p className="mt-2 text-2xl font-bold text-amber-700">
                {invoiceStatusSummary.partial}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-500">Paid</p>
              <p className="mt-2 text-2xl font-bold text-emerald-700">
                {invoiceStatusSummary.paid}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-500">Overdue</p>
              <p className="mt-2 text-2xl font-bold text-red-700">
                {invoiceStatusSummary.overdue}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-500">Rejected</p>
              <p className="mt-2 text-2xl font-bold text-red-700">
                {invoiceStatusSummary.rejected}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-500">Cancelled</p>
              <p className="mt-2 text-2xl font-bold text-slate-700">
                {invoiceStatusSummary.cancelled}
              </p>
            </div>
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="mb-8 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Expense Breakdown
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Expenses grouped by category for the selected period.
            </p>
          </div>

          {expenseCategorySummary.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm font-semibold text-slate-700">
                No expense data available.
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Record an expense or change the selected date range.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                    <th className="px-6 py-3 font-medium">Category</th>
                    <th className="px-6 py-3 font-medium">
                      Number of Expenses
                    </th>
                    <th className="px-6 py-3 text-right font-medium">
                      Total Amount
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {expenseCategorySummary.map((item) => (
                    <tr
                      key={item.category}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {item.category}
                      </td>

                      <td className="px-6 py-4 text-slate-700">{item.count}</td>

                      <td className="px-6 py-4 text-right font-semibold text-slate-900">
                        {formatCurrency(item.total)} ETB
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Payment Analysis */}
        <div className="mb-8 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Payment Analysis
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Payments grouped by payment method for the selected period.
            </p>
          </div>

          <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-medium text-slate-500">Cash</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {formatCurrency(paymentMethodSummary.cash.total)} ETB
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {paymentMethodSummary.cash.count} payment
                {paymentMethodSummary.cash.count === 1 ? "" : "s"}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-medium text-slate-500">
                Bank Transfer
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {formatCurrency(paymentMethodSummary.bank.total)} ETB
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {paymentMethodSummary.bank.count} payment
                {paymentMethodSummary.bank.count === 1 ? "" : "s"}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-medium text-slate-500">
                Mobile Payment
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {formatCurrency(paymentMethodSummary.mobile.total)} ETB
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {paymentMethodSummary.mobile.count} payment
                {paymentMethodSummary.mobile.count === 1 ? "" : "s"}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-medium text-slate-500">Other</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {formatCurrency(paymentMethodSummary.other.total)} ETB
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {paymentMethodSummary.other.count} payment
                {paymentMethodSummary.other.count === 1 ? "" : "s"}
              </p>
            </div>
          </div>
        </div>

        {/* Payment History */}
        <div className="mb-8 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Payment History
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Payment transactions for the selected period.
            </p>
          </div>

          {sortedPayments.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm font-semibold text-slate-700">
                No payments found.
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Record a payment or change the selected date range.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                    <th className="px-6 py-3 font-medium">Date</th>
                    <th className="px-6 py-3 font-medium">Receipt</th>
                    <th className="px-6 py-3 font-medium">Invoice</th>
                    <th className="px-6 py-3 font-medium">Amount</th>
                    <th className="px-6 py-3 font-medium">Method</th>
                    <th className="px-6 py-3 font-medium">Notes</th>
                  </tr>
                </thead>

                <tbody>
                  {sortedPayments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="px-6 py-4 text-slate-700">
                        {formatDate(payment.paymentDate)}
                      </td>

                      <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-900">
                        {payment.receiptNumber}
                      </td>

                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {getInvoiceNumber(payment.invoiceId)}
                      </td>

                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {formatCurrency(payment.amount)} ETB
                      </td>

                      <td className="px-6 py-4 text-slate-700">
                        {getPaymentMethodLabel(payment.method)}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {payment.notes || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Expense History */}
        <div className="mb-8 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Expense History
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Expense transactions for the selected period.
            </p>
          </div>

          {sortedExpenses.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm font-semibold text-slate-700">
                No expenses found.
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Record an expense or change the selected date range.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                    <th className="px-6 py-3 font-medium">Date</th>
                    <th className="px-6 py-3 font-medium">Item / Expense</th>
                    <th className="px-6 py-3 font-medium">Category</th>
                    <th className="px-6 py-3 font-medium">Amount</th>
                    <th className="px-6 py-3 font-medium">Notes</th>
                  </tr>
                </thead>

                <tbody>
                  {sortedExpenses.map((expense) => (
                    <tr
                      key={expense.id}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="px-6 py-4 text-slate-700">
                        {formatDate(expense.expenseDate)}
                      </td>

                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {expense.description}
                      </td>

                      <td className="px-6 py-4 text-slate-700">
                        {expense.category || "-"}
                      </td>

                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {formatCurrency(expense.amount)} ETB
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {expense.notes || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Invoice History */}
        <div className="mb-8 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Invoice History
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Invoice transactions for the selected period.
            </p>
          </div>

          {sortedInvoices.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm font-semibold text-slate-700">
                No invoices found.
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Create an invoice or change the selected date range.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                    <th className="px-6 py-3 font-medium">Issue Date</th>

                    <th className="px-6 py-3 font-medium">Invoice Number</th>

                    <th className="px-6 py-3 font-medium">Type</th>

                    <th className="px-6 py-3 text-right font-medium">Total</th>

                    <th className="px-6 py-3 text-right font-medium">Paid</th>

                    <th className="px-6 py-3 text-right font-medium">
                      Outstanding
                    </th>

                    <th className="px-6 py-3 font-medium">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {sortedInvoices.map((invoice) => {
                    const outstanding = Math.max(
                      invoice.total - invoice.paidAmount,
                      0,
                    );

                    return (
                      <tr
                        key={invoice.id}
                        className="border-b border-slate-100 last:border-0"
                      >
                        <td className="px-6 py-4 text-slate-700">
                          {formatDate(invoice.issueDate)}
                        </td>

                        <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-900">
                          {invoice.invoiceNumber}
                        </td>

                        <td className="px-6 py-4 text-slate-700">
                          {getInvoiceTypeLabel(invoice)}
                        </td>

                        <td className="px-6 py-4 text-right font-semibold text-slate-900">
                          {formatCurrency(invoice.total)} ETB
                        </td>

                        <td className="px-6 py-4 text-right font-semibold text-emerald-700">
                          {formatCurrency(invoice.paidAmount)} ETB
                        </td>

                        <td className="px-6 py-4 text-right font-semibold text-amber-700">
                          {formatCurrency(outstanding)} ETB
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getInvoiceStatusClasses(
                              invoice.status,
                            )}`}
                          >
                            {getInvoiceStatusLabel(invoice.status)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Customer Summary */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Customer Summary
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Customers with the highest outstanding balances appear first.
            </p>
          </div>

          {customerSummary.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm font-semibold text-slate-700">
                No customer invoice data available.
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Create an invoice or change the selected date range.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                    <th className="px-6 py-3 font-medium">Customer</th>

                    <th className="px-6 py-3 font-medium">Customer Code</th>

                    <th className="px-6 py-3 text-right font-medium">
                      Invoices
                    </th>

                    <th className="px-6 py-3 text-right font-medium">
                      Total Invoiced
                    </th>

                    <th className="px-6 py-3 text-right font-medium">
                      Total Paid
                    </th>

                    <th className="px-6 py-3 text-right font-medium">
                      Outstanding
                    </th>

                    <th className="px-6 py-3 text-right font-medium">
                      Collection Rate
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {customerSummary.map((customerSummaryItem) => {
                    const customer = getCustomer(
                      customerSummaryItem.customerId,
                    );

                    const collectionRate =
                      customerSummaryItem.totalInvoiced > 0
                        ? (customerSummaryItem.totalPaid /
                            customerSummaryItem.totalInvoiced) *
                          100
                        : 0;

                    return (
                      <tr
                        key={customerSummaryItem.customerId}
                        className="border-b border-slate-100 last:border-0"
                      >
                        <td className="px-6 py-4 font-semibold text-slate-900">
                          {customer?.name ?? "Unknown Customer"}
                        </td>

                        <td className="px-6 py-4 text-slate-600">
                          {customer?.customerCode ?? "-"}
                        </td>

                        <td className="px-6 py-4 text-right text-slate-700">
                          {customerSummaryItem.invoiceCount}
                        </td>

                        <td className="px-6 py-4 text-right font-semibold text-slate-900">
                          {formatCurrency(customerSummaryItem.totalInvoiced)}{" "}
                          ETB
                        </td>

                        <td className="px-6 py-4 text-right font-semibold text-emerald-700">
                          {formatCurrency(customerSummaryItem.totalPaid)} ETB
                        </td>

                        <td className="px-6 py-4 text-right font-semibold text-amber-700">
                          {formatCurrency(customerSummaryItem.outstanding)} ETB
                        </td>

                        <td className="px-6 py-4 text-right">
                          <span
                            className={`font-semibold ${
                              collectionRate >= 100
                                ? "text-emerald-700"
                                : collectionRate > 0
                                  ? "text-amber-700"
                                  : "text-red-700"
                            }`}
                          >
                            {collectionRate.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
