"use client";

import { useEffect, useMemo, useState } from "react";
import { getRecords } from "../../../../lib/storage/db";
import type { Customer, Invoice, Payment } from "../../../../types";

export default function PaymentReportPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [paymentRecords, invoiceRecords, customerRecords] =
        await Promise.all([
          getRecords("payments"),
          getRecords("invoices"),
          getRecords("customers"),
        ]);

      setPayments(paymentRecords as unknown as Payment[]);
      setInvoices(invoiceRecords as unknown as Invoice[]);
      setCustomers(customerRecords as unknown as Customer[]);
    } catch (error) {
      console.error("Failed to load payment report:", error);
    }
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  function getInvoice(payment: Payment) {
    return invoices.find((invoice) => invoice.id === payment.invoiceId);
  }

  function getCustomer(payment: Payment) {
    const invoice = getInvoice(payment);

    return customers.find((customer) => customer.id === invoice?.customerId);
  }

  const filteredPayments = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return [...payments]
      .filter((payment) => {
        if (methodFilter !== "all" && payment.method !== methodFilter) {
          return false;
        }

        if (!searchValue) {
          return true;
        }

        const invoice = getInvoice(payment);
        const customer = getCustomer(payment);

        return (
          invoice?.invoiceNumber?.toLowerCase().includes(searchValue) ||
          customer?.name?.toLowerCase().includes(searchValue) ||
          payment.receiptNumber?.toLowerCase().includes(searchValue) ||
          payment.method.toLowerCase().includes(searchValue)
        );
      })
      .sort(
        (a, b) =>
          new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime(),
      );
  }, [payments, invoices, customers, search, methodFilter]);

  const totalCollected = payments.reduce(
    (sum, payment) => sum + payment.amount,
    0,
  );

  const totalOutstanding = invoices.reduce((sum, invoice) => {
    const isPayable =
      invoice.status === "issued" ||
      invoice.status === "unpaid" ||
      invoice.status === "partial" ||
      invoice.status === "overdue";

    if (!isPayable) {
      return sum;
    }

    const remaining = Math.max(invoice.total - invoice.paidAmount, 0);

    return sum + remaining;
  }, 0);

  const paidInvoices = invoices.filter(
    (invoice) => invoice.total > 0 && invoice.status === "paid",
  ).length;

  const partialInvoices = invoices.filter(
    (invoice) => invoice.total > 0 && invoice.status === "partial",
  ).length;

  const unpaidInvoices = invoices.filter(
    (invoice) =>
      invoice.total > 0 &&
      (invoice.status === "issued" || invoice.status === "unpaid"),
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Payment Report
            </h1>

            <p className="mt-1 text-sm text-slate-600">
              Review collected payments and outstanding invoice balances.
            </p>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 print:hidden"
          >
            Print Report
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Total Collected
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {formatCurrency(totalCollected)} ETB
            </p>

            <p className="mt-1 text-xs text-slate-500">
              From recorded payments
            </p>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
            <p className="text-sm font-medium text-amber-700">Outstanding</p>

            <p className="mt-2 text-2xl font-bold text-amber-900">
              {formatCurrency(totalOutstanding)} ETB
            </p>

            <p className="mt-1 text-xs text-amber-700">
              Remaining invoice balances
            </p>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
            <p className="text-sm font-medium text-emerald-700">
              Paid Invoices
            </p>

            <p className="mt-2 text-2xl font-bold text-emerald-900">
              {paidInvoices}
            </p>

            <p className="mt-1 text-xs text-emerald-700">Fully paid</p>
          </div>

          <div className="rounded-xl border border-red-200 bg-red-50 p-5 shadow-sm">
            <p className="text-sm font-medium text-red-700">Unpaid</p>

            <p className="mt-2 text-2xl font-bold text-red-900">
              {unpaidInvoices}
            </p>

            <p className="mt-1 text-xs text-red-700">No payment recorded</p>
          </div>
        </div>

        {/* Invoice Status Summary */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap gap-3">
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800">
              🟢 Paid: {paidInvoices}
            </span>

            <span className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800">
              🟠 Partial: {partialInvoices}
            </span>

            <span className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-800">
              🔴 Unpaid: {unpaidInvoices}
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm print:hidden">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-800">
                Search
              </label>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search invoice, customer, or receipt..."
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-800">
                Payment Method
              </label>

              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              >
                <option value="all">All Methods</option>
                <option value="cash">Cash</option>
                <option value="bank">Bank Transfer</option>
                <option value="mobile">Mobile Payment</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Payment History */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Payment History
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {filteredPayments.length} payment
              {filteredPayments.length === 1 ? "" : "s"} found.
            </p>
          </div>

          {filteredPayments.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm font-semibold text-slate-700">
                No payment records found.
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Recorded payments will appear here.
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

                    <th className="px-6 py-3 font-medium">Customer</th>

                    <th className="px-6 py-3 font-medium">Amount</th>

                    <th className="px-6 py-3 font-medium">Method</th>

                    <th className="px-6 py-3 font-medium">Invoice Status</th>

                    <th className="px-6 py-3 font-medium">Notes</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredPayments.map((payment) => {
                    const invoice = getInvoice(payment);
                    const customer = getCustomer(payment);

                    const status = invoice?.status ?? "unknown";

                    return (
                      <tr
                        key={payment.id}
                        className="border-b border-slate-100 last:border-0"
                      >
                        <td className="px-6 py-4 text-slate-700">
                          {new Date(payment.paymentDate).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </td>

                        <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-700">
                          {payment.receiptNumber}
                        </td>

                        <td className="px-6 py-4 font-semibold text-slate-900">
                          {invoice?.invoiceNumber ?? "Unknown"}
                        </td>

                        <td className="px-6 py-4 text-slate-700">
                          {customer?.name ?? "Unknown"}
                        </td>

                        <td className="px-6 py-4 font-semibold text-slate-900">
                          {formatCurrency(payment.amount)} ETB
                        </td>

                        <td className="px-6 py-4 text-slate-700">
                          {payment.method === "cash"
                            ? "Cash"
                            : payment.method === "bank"
                              ? "Bank Transfer"
                              : payment.method === "mobile"
                                ? "Mobile Payment"
                                : "Other"}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                              status === "paid"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                : status === "partial"
                                  ? "border-amber-200 bg-amber-50 text-amber-800"
                                  : status === "unpaid" ||
                                      status === "issued" ||
                                      status === "overdue"
                                    ? "border-red-200 bg-red-50 text-red-800"
                                    : "border-slate-200 bg-slate-50 text-slate-700"
                            }`}
                          >
                            {status === "paid"
                              ? "Paid"
                              : status === "partial"
                                ? "Partial"
                                : status === "unpaid"
                                  ? "Unpaid"
                                  : status === "issued"
                                    ? "Issued"
                                    : status === "overdue"
                                      ? "Overdue"
                                      : status === "unknown"
                                        ? "Unknown"
                                        : status}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="text-slate-600">
                              {payment.notes || "-"}
                            </span>

                            <a
                              href={`/payments/${payment.id}`}
                              className="whitespace-nowrap rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            >
                              View Receipt
                            </a>
                          </div>
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
