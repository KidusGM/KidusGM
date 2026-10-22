"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  addRecord,
  getInvoices,
  getCustomers,
  getRecords,
  updateRecord,
  generatePaymentReceiptNumber,
} from "@/lib/storage/db";
import type { Customer, Invoice, Payment } from "../../../types";

export default function PaymentsPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  const [selectedInvoiceId, setSelectedInvoiceId] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [paymentMethod, setPaymentMethod] = useState<Payment["method"]>("cash");
  const [notes, setNotes] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [invoiceRecords, customerRecords, paymentRecords] =
        await Promise.all([
          getRecords("invoices"),
          getRecords("customers"),
          getRecords("payments"),
        ]);

      setInvoices(invoiceRecords as unknown as Invoice[]);
      setCustomers(customerRecords as unknown as Customer[]);
      setPayments(paymentRecords as unknown as Payment[]);
    } catch (err) {
      console.error(err);
      setError("Failed to load payment data.");
    }
  }

  const payableInvoices = invoices.filter(
    (invoice) =>
      invoice.status === "issued" ||
      invoice.status === "unpaid" ||
      invoice.status === "partial" ||
      invoice.status === "overdue",
  );

  const selectedInvoice = invoices.find(
    (invoice) => invoice.id === selectedInvoiceId,
  );

  const selectedCustomer = customers.find(
    (customer) => customer.id === selectedInvoice?.customerId,
  );

  const invoicePayments = payments.filter(
    (payment) => payment.invoiceId === selectedInvoiceId,
  );

  const invoiceTotal = selectedInvoice?.total ?? 0;
  const paidAmount = selectedInvoice?.paidAmount ?? 0;
  const remainingBalance = Math.max(invoiceTotal - paidAmount, 0);

  function getStatusLabel(invoice: Invoice) {
    const paid = invoice.paidAmount ?? 0;
    const remaining = Math.max(invoice.total - paid, 0);

    if (remaining <= 0) {
      return {
        label: "Paid",
        className: "bg-emerald-100 text-emerald-800 border border-emerald-200",
      };
    }

    if (paid > 0) {
      return {
        label: "Partial",
        className: "bg-amber-100 text-amber-800 border border-amber-200",
      };
    }

    return {
      label: "Unpaid",
      className: "bg-red-100 text-red-800 border border-red-200",
    };
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  async function handlePayment() {
    setError("");
    setSuccess("");

    if (!selectedInvoice) {
      setError("Please select an invoice.");
      return;
    }

    const amount = Number(paymentAmount);

    if (!amount || amount <= 0) {
      setError("Please enter a valid payment amount.");
      return;
    }

    if (amount > remainingBalance) {
      setError(
        `Payment cannot exceed the remaining balance of ${formatCurrency(
          remainingBalance,
        )} ETB.`,
      );
      return;
    }

    if (!paymentDate) {
      setError("Please select a payment date.");
      return;
    }

    const newPaidAmount = Number((paidAmount + amount).toFixed(2));

    const newStatus =
      newPaidAmount >= Number(invoiceTotal.toFixed(2)) ? "paid" : "partial";

    const receiptNumber = await generatePaymentReceiptNumber();

    const payment: Payment = {
      id: crypto.randomUUID(),
      receiptNumber,
      invoiceId: selectedInvoice.id,
      amount,
      paymentDate,
      method: paymentMethod,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
    };

    const updatedInvoice: Invoice = {
      ...selectedInvoice,
      paidAmount: newPaidAmount,
      status: newStatus,
    };

    try {
      await addRecord(
        "payments",
        payment as unknown as Record<string, unknown>,
      );

      await updateRecord(
        "invoices",
        updatedInvoice as unknown as Record<string, unknown>,
      );

      setPaymentAmount("");
      setNotes("");

      await loadData();

      setSuccess(
        `Payment of ${formatCurrency(amount)} ETB recorded successfully.`,
      );
    } catch (err) {
      console.error(err);
      setError("Failed to record payment.");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Payments</h1>
            <p className="mt-1 text-sm text-slate-600">
              Record invoice payments and track outstanding balances.
            </p>
          </div>

          <Link
            href="/payments/report"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Payment Report
          </Link>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {success}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Payment Form */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <h2 className="text-lg font-semibold text-slate-900">
              Record Payment
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Select an issued invoice and record a payment.
            </p>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {/* Invoice */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-800">
                  Invoice
                </label>

                <select
                  value={selectedInvoiceId}
                  onChange={(e) => {
                    setSelectedInvoiceId(e.target.value);
                    setPaymentAmount("");
                    setError("");
                    setSuccess("");
                  }}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                >
                  <option value="">Select an invoice</option>

                  {payableInvoices.map((invoice) => {
                    const customer = customers.find(
                      (customer) => customer.id === invoice.customerId,
                    );

                    return (
                      <option key={invoice.id} value={invoice.id}>
                        {invoice.invoiceNumber} -{" "}
                        {customer?.name ?? "Unknown Customer"} -{" "}
                        {formatCurrency(invoice.total)} ETB
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Invoice Summary */}
              {selectedInvoice && (
                <div className="md:col-span-2 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Invoice Total
                    </p>
                    <p className="mt-1 text-xl font-bold text-slate-900">
                      {formatCurrency(invoiceTotal)} ETB
                    </p>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Already Paid
                    </p>
                    <p className="mt-1 text-xl font-bold text-slate-900">
                      {formatCurrency(paidAmount)} ETB
                    </p>
                  </div>

                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-amber-700">
                      Remaining Balance
                    </p>
                    <p className="mt-1 text-xl font-bold text-amber-900">
                      {formatCurrency(remainingBalance)} ETB
                    </p>
                  </div>
                </div>
              )}

              {/* Customer */}
              {selectedInvoice && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-800">
                    Customer
                  </label>

                  <div className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-900">
                    {selectedCustomer?.name ?? "Unknown Customer"}
                  </div>
                </div>
              )}

              {/* Status */}
              {selectedInvoice && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-800">
                    Payment Status
                  </label>

                  <div className="flex h-[42px] items-center">
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-semibold ${
                        getStatusLabel(selectedInvoice).className
                      }`}
                    >
                      {getStatusLabel(selectedInvoice).label}
                    </span>
                  </div>
                </div>
              )}

              {/* Payment Amount */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-800">
                  Payment Amount (ETB)
                </label>

                <input
                  type="number"
                  min="0"
                  max={remainingBalance}
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Enter payment amount"
                  disabled={!selectedInvoice || remainingBalance <= 0}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100 disabled:text-slate-500"
                />

                {selectedInvoice && remainingBalance > 0 && (
                  <p className="mt-1.5 text-xs text-slate-600">
                    Maximum payment:{" "}
                    <span className="font-semibold text-slate-800">
                      {formatCurrency(remainingBalance)} ETB
                    </span>
                  </p>
                )}
              </div>

              {/* Payment Date */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-800">
                  Payment Date
                </label>

                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-800">
                  Payment Method
                </label>

                <select
                  value={paymentMethod}
                  onChange={(e) =>
                    setPaymentMethod(e.target.value as Payment["method"])
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                >
                  <option value="cash">Cash</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="mobile">Mobile Payment</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-800">
                  Notes
                </label>

                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional payment note"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
              </div>
            </div>

            {/* Action */}
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={handlePayment}
                disabled={!selectedInvoice || remainingBalance <= 0}
                className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Record Payment
              </button>
            </div>
          </div>

          {/* Balance Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Outstanding Balance
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Current balance for the selected invoice.
            </p>

            <div className="mt-6 rounded-xl bg-slate-900 p-5 text-white">
              <p className="text-sm text-slate-300">Remaining</p>

              <p className="mt-2 text-3xl font-bold">
                {selectedInvoice
                  ? `${formatCurrency(remainingBalance)} ETB`
                  : "0.00 ETB"}
              </p>

              {selectedInvoice && (
                <div className="mt-4">
                  <div className="h-2 overflow-hidden rounded-full bg-slate-700">
                    <div
                      className="h-full rounded-full bg-white"
                      style={{
                        width: `${Math.min(
                          (paidAmount / invoiceTotal) * 100,
                          100,
                        )}%`,
                      }}
                    />
                  </div>

                  <p className="mt-2 text-xs text-slate-300">
                    {invoiceTotal > 0
                      ? `${Math.round((paidAmount / invoiceTotal) * 100)}% paid`
                      : "0% paid"}
                  </p>
                </div>
              )}
            </div>

            {selectedInvoice && (
              <div className="mt-5">
                <div className="flex items-center justify-between border-b border-slate-100 py-3">
                  <span className="text-sm text-slate-500">Invoice</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {selectedInvoice.invoiceNumber}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-slate-100 py-3">
                  <span className="text-sm text-slate-500">Customer</span>
                  <span className="max-w-[180px] truncate text-sm font-semibold text-slate-900">
                    {selectedCustomer?.name ?? "Unknown"}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3">
                  <span className="text-sm text-slate-500">Due Date</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {selectedInvoice.dueDate || "N/A"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Payment History */}
        {selectedInvoice && (
          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Payment History
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Payments recorded against {selectedInvoice.invoiceNumber}.
                </p>
              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                {invoicePayments.length} payment
                {invoicePayments.length === 1 ? "" : "s"}
              </span>
            </div>

            {invoicePayments.length === 0 ? (
              <div className="mt-6 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
                <p className="text-sm font-medium text-slate-700">
                  No payments recorded yet.
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  The first payment will appear here.
                </p>
              </div>
            ) : (
              <div className="mt-6 overflow-x-auto">
                <table className="w-full min-w-[700px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="px-3 py-3 font-medium">Date</th>
                      <th className="px-3 py-3 font-medium">Amount</th>
                      <th className="px-3 py-3 font-medium">Method</th>
                      <th className="px-3 py-3 font-medium">Notes</th>
                    </tr>
                  </thead>

                  <tbody>
                    {[...invoicePayments]
                      .sort(
                        (a, b) =>
                          new Date(b.paymentDate).getTime() -
                          new Date(a.paymentDate).getTime(),
                      )
                      .map((payment) => (
                        <tr
                          key={payment.id}
                          className="border-b border-slate-100 last:border-0"
                        >
                          <td className="px-3 py-3 text-slate-700">
                            {payment.paymentDate}
                          </td>

                          <td className="px-3 py-3 font-semibold text-slate-900">
                            {formatCurrency(payment.amount)} ETB
                          </td>

                          <td className="px-3 py-3 capitalize text-slate-700">
                            {payment.method}
                          </td>

                          <td className="px-3 py-3 text-slate-600">
                            {payment.notes || "-"}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
