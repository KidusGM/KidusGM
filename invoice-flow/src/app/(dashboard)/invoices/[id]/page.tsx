"use client";

import { useEffect, useState } from "react";
import { getRecords, updateRecord } from "../../../../lib/storage/db";
import type { Customer, Invoice } from "../../../../types";

export default function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleSubmitInvoice = async () => {
    if (!invoice) {
      return;
    }

    if (invoice.status !== "draft") {
      setError("Only draft invoices can be submitted.");
      return;
    }

    try {
      const updatedInvoice: Invoice = {
        ...invoice,
        status: "submitted",
      };

      await updateRecord("invoices", updatedInvoice);

      setInvoice(updatedInvoice);
      setError("");
    } catch (submitError) {
      console.error("Failed to submit invoice:", submitError);

      setError("Failed to submit the invoice.");
    }
  };

  const handleApproveInvoice = async () => {
    if (!invoice) {
      return;
    }

    if (
      invoice.status !== "submitted" &&
      invoice.status !== "pending_approval"
    ) {
      setError("Only submitted invoices can be approved.");
      return;
    }

    try {
      const updatedInvoice: Invoice = {
        ...invoice,
        status: "approved",
      };

      await updateRecord("invoices", updatedInvoice);

      setInvoice(updatedInvoice);
      setError("");
    } catch (approvalError) {
      console.error("Failed to approve invoice:", approvalError);

      setError("Failed to approve the invoice.");
    }
  };

  const handleIssueInvoice = async () => {
    if (!invoice) {
      return;
    }

    if (invoice.status !== "approved") {
      setError("Only approved invoices can be issued.");
      return;
    }

    try {
      const updatedInvoice: Invoice = {
        ...invoice,
        status: "issued",
      };

      await updateRecord("invoices", updatedInvoice);

      setInvoice(updatedInvoice);
      setError("");
    } catch (issueError) {
      console.error("Failed to issue invoice:", issueError);

      setError("Failed to issue the invoice.");
    }
  };

  const handleCancelInvoice = async () => {
    if (!invoice) {
      return;
    }

    if (Number(invoice.paidAmount || 0) > 0) {
      setError(
        "This invoice cannot be cancelled because a payment has already been recorded.",
      );
      return;
    }

    if (invoice.status === "cancelled") {
      setError("This invoice has already been cancelled.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to cancel this invoice? This action cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    try {
      const updatedInvoice: Invoice = {
        ...invoice,
        status: "cancelled",
      };

      await updateRecord("invoices", updatedInvoice);

      setInvoice(updatedInvoice);
      setError("");
    } catch (cancelError) {
      console.error("Failed to cancel invoice:", cancelError);

      setError("Failed to cancel the invoice.");
    }
  };

  useEffect(() => {
    async function loadInvoice() {
      try {
        const { id } = await params;

        const [invoiceRecords, customerRecords] = await Promise.all([
          getRecords("invoices"),
          getRecords("customers"),
        ]);

        const foundInvoice = invoiceRecords.find(
          (item) => String(item.id) === String(id),
        ) as Invoice | undefined;

        if (!foundInvoice) {
          setError("Invoice not found.");
          return;
        }

        setInvoice(foundInvoice);

        const foundCustomer = customerRecords.find(
          (item) => String(item.id) === String(foundInvoice.customerId),
        ) as Customer | undefined;

        setCustomer(foundCustomer ?? null);
      } catch {
        setError("Unable to load the invoice.");
      } finally {
        setLoading(false);
      }
    }

    loadInvoice();
  }, [params]);

  if (loading) {
    return (
      <main className="p-6">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm text-slate-500">Loading invoice...</p>
        </div>
      </main>
    );
  }

  if (!invoice) {
    return (
      <main className="p-6">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-xl border border-red-200 bg-red-50 p-5">
            <h1 className="font-semibold text-red-800">Invoice Not Found</h1>

            <p className="mt-1 text-sm text-red-700">
              {error || "The requested invoice does not exist."}
            </p>

            <a
              href="/invoices"
              className="mt-4 inline-block text-sm font-medium text-red-800 underline"
            >
              Back to Invoices
            </a>
          </div>
        </div>
      </main>
    );
  }

  const statusLabel = String(invoice.status || "draft")
    .replace("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

  const invoiceTypeLabel = String(invoice.invoiceType || "sales")
    .replace("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

  const paymentTermsLabel = String(invoice.paymentTerms)
    .replace("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

  const balance = Math.max(
    Number(invoice.total || 0) - Number(invoice.paidAmount || 0),
    0,
  );

  return (
    <main className="p-6">
      <div className="mx-auto max-w-6xl">
        {/* ========================================================= */}
        {/* SCREEN VIEW                                               */}
        {/* ========================================================= */}

        <div className="print:hidden">
          {/* Header */}
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <p className="text-sm font-medium text-slate-400">
                Sales & Billing
              </p>

              <h1 className="mt-1 text-2xl font-bold text-slate-900">
                {invoice.invoiceNumber}
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Invoice details and billing information.
              </p>
            </div>

            <div className="flex gap-2">
              {invoice.status === "draft" && (
                <a
                  href={`/invoices/${invoice.id}/edit`}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Edit
                </a>
              )}

              <a
                href="/invoices"
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Back
              </a>

              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                Print
              </button>
            </div>
          </div>

          {/* Invoice Summary */}
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <div className="rounded-xl border bg-white p-5">
              <p className="text-sm text-slate-500">Invoice Type</p>

              <p className="mt-1 font-semibold text-slate-900">
                {invoiceTypeLabel}
              </p>
            </div>

            <div className="rounded-xl border bg-white p-5">
              <p className="text-sm text-slate-500">Status</p>

              <span
                className={`mt-2 inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                  invoice.status === "draft"
                    ? "bg-amber-100 text-amber-800"
                    : invoice.status === "submitted"
                      ? "bg-blue-100 text-blue-800"
                      : invoice.status === "pending_approval"
                        ? "bg-purple-100 text-purple-800"
                        : invoice.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : invoice.status === "issued"
                            ? "bg-slate-200 text-slate-800"
                            : invoice.status === "partial"
                              ? "bg-orange-100 text-orange-800"
                              : invoice.status === "paid"
                                ? "bg-emerald-100 text-emerald-800"
                                : invoice.status === "overdue"
                                  ? "bg-red-100 text-red-800"
                                  : invoice.status === "rejected"
                                    ? "bg-red-100 text-red-800"
                                    : invoice.status === "cancelled"
                                      ? "bg-gray-100 text-gray-700"
                                      : "bg-gray-100 text-gray-700"
                }`}
              >
                {statusLabel}
              </span>
            </div>

            <div className="rounded-xl border bg-white p-5">
              <p className="text-sm text-slate-500">Issue Date</p>

              <p className="mt-1 font-semibold text-slate-900">
                {invoice.issueDate}
              </p>
            </div>

            <div className="rounded-xl border bg-white p-5">
              <p className="text-sm text-slate-500">Due Date</p>

              <p className="mt-1 font-semibold text-slate-900">
                {invoice.dueDate}
              </p>
            </div>
          </div>

          {/* Customer + Payment Information */}
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <section className="rounded-xl border bg-white p-5">
              <h2 className="font-semibold text-slate-900">Customer</h2>

              <div className="mt-4 space-y-2 text-sm">
                <p>
                  <span className="font-medium text-slate-500">Name:</span>{" "}
                  <span className="text-slate-900">
                    {customer?.name || "Unknown customer"}
                  </span>
                </p>

                {customer?.email && (
                  <p>
                    <span className="font-medium text-slate-500">Email:</span>{" "}
                    {customer.email}
                  </p>
                )}

                {customer?.phone && (
                  <p>
                    <span className="font-medium text-slate-500">Phone:</span>{" "}
                    {customer.phone}
                  </p>
                )}

                {customer?.tin && (
                  <p>
                    <span className="font-medium text-slate-500">TIN:</span>{" "}
                    {customer.tin}
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-xl border bg-white p-5">
              <h2 className="font-semibold text-slate-900">
                Payment Information
              </h2>

              <div className="mt-4 space-y-2 text-sm">
                <p>
                  <span className="font-medium text-slate-500">Currency:</span>{" "}
                  {invoice.currency}
                </p>

                <p>
                  <span className="font-medium text-slate-500">
                    Payment Terms:
                  </span>{" "}
                  {paymentTermsLabel}
                </p>

                <p>
                  <span className="font-medium text-slate-500">
                    Paid Amount:
                  </span>{" "}
                  {Number(invoice.paidAmount || 0).toLocaleString()}{" "}
                  {invoice.currency}
                </p>

                <p>
                  <span className="font-medium text-slate-500">Balance:</span>{" "}
                  {balance.toLocaleString()} {invoice.currency}
                </p>
              </div>
            </section>
          </div>

          {/* Reference Information */}
          {(invoice.purchaseOrderNumber ||
            invoice.referenceNumber ||
            invoice.referenceInvoiceId) && (
            <section className="mt-6 rounded-xl border bg-white p-5">
              <h2 className="font-semibold text-slate-900">
                Reference Information
              </h2>

              <div className="mt-4 grid gap-3 text-sm md:grid-cols-3">
                {invoice.purchaseOrderNumber && (
                  <div>
                    <p className="text-slate-500">Purchase Order</p>

                    <p className="mt-1 font-medium text-slate-900">
                      {invoice.purchaseOrderNumber}
                    </p>
                  </div>
                )}

                {invoice.referenceNumber && (
                  <div>
                    <p className="text-slate-500">Reference Number</p>

                    <p className="mt-1 font-medium text-slate-900">
                      {invoice.referenceNumber}
                    </p>
                  </div>
                )}

                {invoice.referenceInvoiceId && (
                  <div>
                    <p className="text-slate-500">Reference Invoice</p>

                    <p className="mt-1 font-medium text-slate-900">
                      {invoice.referenceInvoiceId}
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Items */}
          <section className="mt-6 rounded-xl border bg-white">
            <div className="border-b px-5 py-4">
              <h2 className="font-semibold text-slate-900">Invoice Items</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="border-b bg-slate-50 text-left">
                  <tr>
                    <th className="px-5 py-3 font-medium text-slate-500">
                      Description
                    </th>

                    <th className="px-5 py-3 font-medium text-slate-500">
                      Unit
                    </th>

                    <th className="px-5 py-3 font-medium text-slate-500">
                      Qty
                    </th>

                    <th className="px-5 py-3 font-medium text-slate-500">
                      Unit Price
                    </th>

                    <th className="px-5 py-3 font-medium text-slate-500">
                      Discount
                    </th>

                    <th className="px-5 py-3 font-medium text-slate-500">
                      Tax
                    </th>

                    <th className="px-5 py-3 text-right font-medium text-slate-500">
                      Total
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {invoice.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-5 py-4 text-slate-900">
                        {item.description}
                      </td>

                      <td className="px-5 py-4 text-slate-600">{item.unit}</td>

                      <td className="px-5 py-4 text-slate-600">
                        {item.quantity}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {item.unitPrice.toLocaleString()} {invoice.currency}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {item.discount.toLocaleString()} {invoice.currency}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {item.tax.toLocaleString()} {invoice.currency}
                      </td>

                      <td className="px-5 py-4 text-right font-medium text-slate-900">
                        {item.total.toLocaleString()} {invoice.currency}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Financial Summary */}
          <section className="mt-6 flex justify-end">
            <div className="w-full rounded-xl border bg-white p-5 sm:max-w-md">
              <h2 className="font-semibold text-slate-900">
                Financial Summary
              </h2>

              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Subtotal</span>

                  <span className="font-medium text-slate-900">
                    {invoice.subtotal.toLocaleString()} {invoice.currency}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Discount</span>

                  <span>
                    {invoice.discount.toLocaleString()} {invoice.currency}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Tax</span>

                  <span>
                    {invoice.tax.toLocaleString()} {invoice.currency}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Withholding Tax</span>

                  <span>
                    {invoice.withholdingTax.toLocaleString()} {invoice.currency}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Other Charges</span>

                  <span>
                    {invoice.otherCharges.toLocaleString()} {invoice.currency}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Rounding Adjustment</span>

                  <span>
                    {invoice.roundingAdjustment.toLocaleString()}{" "}
                    {invoice.currency}
                  </span>
                </div>

                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-900">
                      Grand Total
                    </span>

                    <span className="text-lg font-bold text-slate-900">
                      {invoice.total.toLocaleString()} {invoice.currency}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Notes */}
          {(invoice.notes || invoice.terms) && (
            <section className="mt-6 grid gap-6 md:grid-cols-2">
              {invoice.notes && (
                <div className="rounded-xl border bg-white p-5">
                  <h2 className="font-semibold text-slate-900">Notes</h2>

                  <p className="mt-3 whitespace-pre-wrap text-sm text-slate-600">
                    {invoice.notes}
                  </p>
                </div>
              )}

              {invoice.terms && (
                <div className="rounded-xl border bg-white p-5">
                  <h2 className="font-semibold text-slate-900">
                    Terms & Conditions
                  </h2>

                  <p className="mt-3 whitespace-pre-wrap text-sm text-slate-600">
                    {invoice.terms}
                  </p>
                </div>
              )}
            </section>
          )}

          {/* Invoice Actions */}
          <div className="mt-6 space-y-3">
            {String(invoice.status).toLowerCase() === "draft" && (
              <div className="flex justify-end rounded-xl border bg-white p-5">
                <button
                  type="button"
                  onClick={handleSubmitInvoice}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Submit Invoice
                </button>
              </div>
            )}

            {invoice.status !== "draft" && invoice.status !== "cancelled" && (
              <div className="flex justify-end rounded-xl border bg-white p-5">
                <button
                  type="button"
                  onClick={handleCancelInvoice}
                  className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700"
                >
                  Cancel Invoice
                </button>
              </div>
            )}

            {invoice.status === "submitted" && (
              <div className="flex justify-end rounded-xl border bg-white p-5">
                <button
                  type="button"
                  onClick={handleApproveInvoice}
                  className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-700"
                >
                  Approve Invoice
                </button>
              </div>
            )}

            {invoice.status === "approved" && (
              <div className="flex justify-end rounded-xl border bg-white p-5">
                <button
                  type="button"
                  onClick={handleIssueInvoice}
                  className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
                >
                  Issue Invoice
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* PRINTABLE INVOICE                                          */}
        {/* ========================================================= */}

        <div className="hidden print:block print:bg-white">
          <div className="mx-auto max-w-4xl bg-white p-8 text-slate-900">
            {/* Print Header */}
            <div className="flex items-start justify-between border-b-2 border-slate-900 pb-6">
              <div>
                <p className="text-2xl font-bold tracking-tight">InvoiceFlow</p>

                <p className="mt-1 text-sm text-slate-500">Sales & Billing</p>
              </div>

              <div className="text-right">
                <h1 className="text-3xl font-bold uppercase tracking-wide">
                  Invoice
                </h1>

                <p className="mt-2 text-sm font-semibold">
                  {invoice.invoiceNumber}
                </p>

                <p className="mt-1 text-sm text-slate-600">
                  {invoiceTypeLabel}
                </p>
              </div>
            </div>

            {/* Invoice Details */}
            <div className="mt-6 grid grid-cols-2 gap-8">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Bill To
                </h2>

                <div className="mt-2">
                  <p className="text-base font-bold">
                    {customer?.name || "Unknown customer"}
                  </p>

                  {customer?.email && (
                    <p className="mt-1 text-sm">{customer.email}</p>
                  )}

                  {customer?.phone && (
                    <p className="mt-1 text-sm">{customer.phone}</p>
                  )}

                  {customer?.tin && (
                    <p className="mt-1 text-sm">TIN: {customer.tin}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div>
                  <p className="font-semibold text-slate-500">Invoice Date</p>

                  <p className="mt-1 font-medium">{invoice.issueDate}</p>
                </div>

                <div>
                  <p className="font-semibold text-slate-500">Due Date</p>

                  <p className="mt-1 font-medium">{invoice.dueDate}</p>
                </div>

                <div>
                  <p className="font-semibold text-slate-500">Currency</p>

                  <p className="mt-1 font-medium">{invoice.currency}</p>
                </div>

                <div>
                  <p className="font-semibold text-slate-500">Payment Terms</p>

                  <p className="mt-1 font-medium">{paymentTermsLabel}</p>
                </div>

                {invoice.purchaseOrderNumber && (
                  <div>
                    <p className="font-semibold text-slate-500">
                      Purchase Order
                    </p>

                    <p className="mt-1 font-medium">
                      {invoice.purchaseOrderNumber}
                    </p>
                  </div>
                )}

                {invoice.referenceNumber && (
                  <div>
                    <p className="font-semibold text-slate-500">Reference</p>

                    <p className="mt-1 font-medium">
                      {invoice.referenceNumber}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Items Table */}
            <div className="mt-8">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-y-2 border-slate-900">
                    <th className="py-3 pr-3 text-left font-bold">
                      Description
                    </th>

                    <th className="px-2 py-3 text-left font-bold">Unit</th>

                    <th className="px-2 py-3 text-right font-bold">Qty</th>

                    <th className="px-2 py-3 text-right font-bold">
                      Unit Price
                    </th>

                    <th className="px-2 py-3 text-right font-bold">Discount</th>

                    <th className="px-2 py-3 text-right font-bold">Tax</th>

                    <th className="py-3 pl-2 text-right font-bold">Total</th>
                  </tr>
                </thead>

                <tbody>
                  {invoice.items.map((item) => (
                    <tr key={item.id} className="border-b border-slate-200">
                      <td className="py-3 pr-3">{item.description}</td>

                      <td className="px-2 py-3">{item.unit}</td>

                      <td className="px-2 py-3 text-right">{item.quantity}</td>

                      <td className="px-2 py-3 text-right">
                        {item.unitPrice.toLocaleString()} {invoice.currency}
                      </td>

                      <td className="px-2 py-3 text-right">
                        {item.discount.toLocaleString()} {invoice.currency}
                      </td>

                      <td className="px-2 py-3 text-right">
                        {item.tax.toLocaleString()} {invoice.currency}
                      </td>

                      <td className="py-3 pl-2 text-right font-semibold">
                        {item.total.toLocaleString()} {invoice.currency}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="mt-6 flex justify-end">
              <div className="w-80">
                <div className="flex justify-between border-b border-slate-200 py-2 text-sm">
                  <span>Subtotal</span>

                  <span>
                    {invoice.subtotal.toLocaleString()} {invoice.currency}
                  </span>
                </div>

                <div className="flex justify-between border-b border-slate-200 py-2 text-sm">
                  <span>Discount</span>

                  <span>
                    {invoice.discount.toLocaleString()} {invoice.currency}
                  </span>
                </div>

                <div className="flex justify-between border-b border-slate-200 py-2 text-sm">
                  <span>Tax</span>

                  <span>
                    {invoice.tax.toLocaleString()} {invoice.currency}
                  </span>
                </div>

                <div className="flex justify-between border-b border-slate-200 py-2 text-sm">
                  <span>Withholding Tax</span>

                  <span>
                    {invoice.withholdingTax.toLocaleString()} {invoice.currency}
                  </span>
                </div>

                <div className="flex justify-between border-b border-slate-200 py-2 text-sm">
                  <span>Other Charges</span>

                  <span>
                    {invoice.otherCharges.toLocaleString()} {invoice.currency}
                  </span>
                </div>

                <div className="flex justify-between border-b border-slate-200 py-2 text-sm">
                  <span>Rounding Adjustment</span>

                  <span>
                    {invoice.roundingAdjustment.toLocaleString()}{" "}
                    {invoice.currency}
                  </span>
                </div>

                <div className="mt-2 flex justify-between border-t-2 border-slate-900 pt-3">
                  <span className="text-base font-bold">Grand Total</span>

                  <span className="text-lg font-bold">
                    {invoice.total.toLocaleString()} {invoice.currency}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Status */}
            <div className="mt-8 grid grid-cols-3 gap-6 border-y border-slate-200 py-5 text-sm">
              <div>
                <p className="font-semibold text-slate-500">Invoice Status</p>

                <p className="mt-1 font-semibold">{statusLabel}</p>
              </div>

              <div>
                <p className="font-semibold text-slate-500">Paid Amount</p>

                <p className="mt-1 font-semibold">
                  {Number(invoice.paidAmount || 0).toLocaleString()}{" "}
                  {invoice.currency}
                </p>
              </div>

              <div>
                <p className="font-semibold text-slate-500">Balance Due</p>

                <p className="mt-1 font-semibold">
                  {balance.toLocaleString()} {invoice.currency}
                </p>
              </div>
            </div>

            {/* Notes + Terms */}
            {(invoice.notes || invoice.terms) && (
              <div className="mt-8 grid grid-cols-2 gap-8">
                {invoice.notes && (
                  <div>
                    <h2 className="text-sm font-bold">Notes</h2>

                    <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">
                      {invoice.notes}
                    </p>
                  </div>
                )}

                {invoice.terms && (
                  <div>
                    <h2 className="text-sm font-bold">Terms & Conditions</h2>

                    <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">
                      {invoice.terms}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Signatures */}
            <div className="mt-16 grid grid-cols-2 gap-16">
              <div>
                <div className="border-b border-slate-400" />

                <p className="mt-2 text-center text-xs text-slate-500">
                  Customer Signature
                </p>
              </div>

              <div>
                <div className="border-b border-slate-400" />

                <p className="mt-2 text-center text-xs text-slate-500">
                  Authorized Signature
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-12 border-t pt-4 text-center text-xs text-slate-500">
              <p>Thank you for your business.</p>

              <p className="mt-1">Generated by InvoiceFlow</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
