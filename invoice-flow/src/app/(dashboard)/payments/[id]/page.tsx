"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getRecords } from "../../../../lib/storage/db";
import type { Customer, Invoice, Payment } from "../../../../types";

export default function PaymentReceiptPage() {
  const params = useParams();
  const paymentId = String(params.id);

  const [payment, setPayment] = useState<Payment | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPayment();
  }, [paymentId]);

  async function loadPayment() {
    try {
      const [paymentRecords, invoiceRecords, customerRecords] =
        await Promise.all([
          getRecords("payments"),
          getRecords("invoices"),
          getRecords("customers"),
        ]);

      const foundPayment = paymentRecords.find(
        (record) => String(record.id) === paymentId,
      ) as unknown as Payment | undefined;

      if (!foundPayment) {
        setError("Payment record not found.");
        setLoading(false);
        return;
      }

      const foundInvoice = invoiceRecords.find(
        (record) => String(record.id) === String(foundPayment.invoiceId),
      ) as unknown as Invoice | undefined;

      const foundCustomer = customerRecords.find(
        (record) => String(record.id) === String(foundInvoice?.customerId),
      ) as unknown as Customer | undefined;

      setPayment(foundPayment);
      setInvoice(foundInvoice ?? null);
      setCustomer(foundCustomer ?? null);
    } catch (err) {
      console.error(err);
      setError("Failed to load payment receipt.");
    } finally {
      setLoading(false);
    }
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-12">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm text-slate-600">Loading payment receipt...</p>
        </div>
      </div>
    );
  }

  if (error || !payment || !invoice) {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-12">
        <div className="mx-auto max-w-3xl rounded-xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-red-800">Payment Receipt</h1>

          <p className="mt-2 text-sm text-slate-600">
            {error || "Payment information could not be found."}
          </p>

          <button
            type="button"
            onClick={() => window.history.back()}
            className="mt-6 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 print:hidden"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const previousPaidAmount = Math.max(invoice.paidAmount - payment.amount, 0);

  const remainingBalance = Math.max(invoice.total - invoice.paidAmount, 0);

  const status =
    remainingBalance <= 0
      ? "Paid"
      : invoice.paidAmount > 0
        ? "Partial"
        : "Unpaid";

  return (
    <div className="min-h-screen bg-slate-100 px-6 py-8">
      {/* Screen controls */}
      <div className="mx-auto mb-6 flex max-w-3xl items-center justify-between print:hidden">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          ← Back
        </button>

        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Print Receipt
        </button>
      </div>

      {/* Receipt */}
      <div className="mx-auto max-w-3xl bg-white shadow-sm print:shadow-none">
        <div className="p-8 sm:p-10">
          {/* Header */}
          {/* Header */}
          <div className="flex flex-col gap-6 border-b-2 border-slate-900 pb-8 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                InvoiceFlow
              </h1>

              <p className="mt-1 text-sm font-medium text-slate-700">
                Invoice & Billing Management System
              </p>

              <div className="mt-3 space-y-1 text-xs text-slate-500">
                <p>Addis Ababa, Ethiopia</p>
                <p>Phone: +251 975374800</p>
                <p>Email: kidusgirum7@gmail.com</p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Payment Receipt
              </p>

              <p className="mt-2 text-xs font-medium uppercase tracking-wider text-slate-500">
                Receipt Reference
              </p>

              <p className="mt-1 font-mono text-base font-bold text-slate-900">
                {payment.receiptNumber}
              </p>

              <p className="mt-3 text-xs font-medium uppercase tracking-wider text-slate-500">
                Payment Date
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                {new Date(payment.paymentDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Customer and invoice */}
          <div className="grid gap-8 border-b border-slate-200 py-8 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Received From
              </p>

              <p className="mt-2 text-base font-semibold text-slate-900">
                {customer?.name ?? "Unknown Customer"}
              </p>

              {customer?.customerCode && (
                <p className="mt-1 text-sm text-slate-500">
                  Customer Code: {customer.customerCode}
                </p>
              )}

              {customer?.phone && (
                <p className="mt-1 text-sm text-slate-500">
                  Phone: {customer.phone}
                </p>
              )}

              {customer?.email && (
                <p className="mt-1 text-sm text-slate-500">
                  Email: {customer.email}
                </p>
              )}
            </div>

            <div className="sm:text-right">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Invoice
              </p>

              <p className="mt-2 text-base font-semibold text-slate-900">
                {invoice.invoiceNumber}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Invoice Total: {formatCurrency(invoice.total)}{" "}
                {invoice.currency}
              </p>
            </div>
          </div>

          {/* Payment information */}
          <div className="py-8">
            <h2 className="text-lg font-semibold text-slate-900">
              Payment Details
            </h2>

            <div className="mt-5 overflow-hidden rounded-lg border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <span className="text-sm text-slate-600">
                  Previous Paid Amount
                </span>

                <span className="font-semibold text-slate-900">
                  {formatCurrency(previousPaidAmount)} {invoice.currency}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-5">
                <span className="text-sm font-semibold text-slate-900">
                  Payment Received
                </span>

                <span className="text-xl font-bold text-slate-900">
                  {formatCurrency(payment.amount)} {invoice.currency}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <span className="text-sm text-slate-600">
                  Remaining Balance
                </span>

                <span className="font-semibold text-slate-900">
                  {formatCurrency(remainingBalance)} {invoice.currency}
                </span>
              </div>

              <div className="flex items-center justify-between px-5 py-4">
                <span className="text-sm text-slate-600">Payment Method</span>

                <span className="font-semibold text-slate-900">
                  {payment.method === "cash"
                    ? "Cash"
                    : payment.method === "bank"
                      ? "Bank Transfer"
                      : payment.method === "mobile"
                        ? "Mobile Payment"
                        : "Other"}
                </span>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between border-y border-slate-200 py-5">
            <span className="text-sm font-medium text-slate-600">
              Payment Status
            </span>

            <span
              className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${
                status === "Paid"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : status === "Partial"
                    ? "border-amber-200 bg-amber-50 text-amber-800"
                    : "border-red-200 bg-red-50 text-red-800"
              }`}
            >
              {status}
            </span>
          </div>

          {/* Notes */}
          {payment.notes && (
            <div className="border-b border-slate-200 py-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Notes
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-700">
                {payment.notes}
              </p>
            </div>
          )}

          {/* Signature */}
          <div className="grid gap-10 pt-16 sm:grid-cols-2">
            <div>
              <div className="border-b border-slate-400" />
              <p className="mt-2 text-center text-xs text-slate-500">
                Received By
              </p>
            </div>

            <div>
              <div className="border-b border-slate-400" />
              <p className="mt-2 text-center text-xs text-slate-500">
                Customer Signature
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 border-t border-slate-200 pt-6 text-center">
            <p className="text-xs text-slate-500">
              This receipt confirms the payment recorded against the invoice
              shown above.
            </p>

            <p className="mt-2 text-xs font-medium text-slate-600">
              InvoiceFlow
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
