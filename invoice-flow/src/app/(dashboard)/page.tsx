"use client";

import { useEffect, useState } from "react";
import { getCustomers, getInvoices, getRecords } from "../../lib/storage/db";
import type { Customer, Invoice, Payment } from "../../types";

export default function Home() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const invoiceRecords = await getInvoices();
        const customerRecords = await getCustomers();
        const paymentRecords = await getRecords("payments");

        setInvoices(invoiceRecords as unknown as Invoice[]);
        setCustomers(customerRecords as unknown as Customer[]);
        setPayments(paymentRecords as unknown as Payment[]);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const totalSales = invoices.reduce((sum, invoice) => {
    if (invoice.status === "cancelled") {
      return sum;
    }

    return sum + invoice.total;
  }, 0);

  const totalPaid = invoices.reduce(
    (sum, invoice) => sum + invoice.paidAmount,
    0,
  );

  const outstanding = invoices.reduce((sum, invoice) => {
    if (invoice.status === "cancelled") {
      return sum;
    }

    return sum + (invoice.total - invoice.paidAmount);
  }, 0);

  const recentInvoices = [...invoices]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);

  const recentPayments = [...payments]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);

  const getCustomerName = (customerId: string) => {
    const customer = customers.find((item) => item.id === customerId);

    return customer?.name ?? "Unknown Customer";
  };

  const getPaymentCustomerName = (invoiceId: string) => {
    const invoice = invoices.find((item) => item.id === invoiceId);

    if (!invoice) {
      return "Unknown Customer";
    }

    return getCustomerName(invoice.customerId);
  };

  const formatCurrency = (amount: number) => {
    return `ETB ${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div>
      <header className="border-b bg-white px-6 py-5">
        <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>

        <p className="mt-1 text-sm text-slate-500">
          Overview of your invoices, payments, and business activity.
        </p>
      </header>

      <div className="p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-slate-500">Total Sales</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {loading ? "Loading..." : formatCurrency(totalSales)}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-slate-500">Paid</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {loading ? "Loading..." : formatCurrency(totalPaid)}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-slate-500">Outstanding</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {loading ? "Loading..." : formatCurrency(outstanding)}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-slate-500">Invoices</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {loading ? "Loading..." : invoices.length}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-xl border bg-white p-8">
          <h3 className="text-lg font-semibold text-slate-900">
            Welcome to InvoiceFlow
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Start by adding your customers, products, and invoices.
          </p>
        </div>

        <div className="mt-6 rounded-xl border bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Recent Invoices
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Your latest invoices.
              </p>
            </div>

            <a
              href="/invoices"
              className="text-sm font-medium text-slate-700 hover:text-slate-900"
            >
              View all
            </a>
          </div>

          {loading ? (
            <p className="mt-6 text-sm text-slate-500">Loading invoices...</p>
          ) : recentInvoices.length === 0 ? (
            <div className="mt-6 rounded-lg border border-dashed p-6 text-center">
              <p className="text-sm font-medium text-slate-700">
                No invoices yet
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Create your first invoice to see it here.
              </p>

              <a
                href="/invoices/new"
                className="mt-4 inline-flex rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
              >
                Create Invoice
              </a>
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {recentInvoices.map((invoice) => (
                <a
                  key={invoice.id}
                  href={`/invoices/${invoice.id}`}
                  className="block rounded-lg border p-4 hover:bg-slate-50"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium text-slate-900">
                        {invoice.invoiceNumber}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {getCustomerName(invoice.customerId)}
                      </p>
                    </div>

                    <div className="sm:text-right">
                      <p className="font-semibold text-slate-900">
                        {formatCurrency(invoice.total)}
                      </p>

                      <div className="mt-1 flex items-center gap-2 sm:justify-end">
                        <span className="text-xs text-slate-500">
                          {invoice.issueDate}
                        </span>

                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize text-slate-600">
                          {invoice.status.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 rounded-xl border bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Recent Payments
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Your latest payments received.
              </p>
            </div>

            <a
              href="/payments"
              className="text-sm font-medium text-slate-700 hover:text-slate-900"
            >
              View all
            </a>
          </div>

          {loading ? (
            <p className="mt-6 text-sm text-slate-500">Loading payments...</p>
          ) : recentPayments.length === 0 ? (
            <div className="mt-6 rounded-lg border border-dashed p-6 text-center">
              <p className="text-sm font-medium text-slate-700">
                No payments yet
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Payments you record will appear here.
              </p>
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {recentPayments.map((payment) => (
                <div key={payment.id} className="rounded-lg border p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium text-slate-900">
                        {payment.receiptNumber}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {getPaymentCustomerName(payment.invoiceId)}
                      </p>
                    </div>

                    <div className="sm:text-right">
                      <p className="font-semibold text-slate-900">
                        {formatCurrency(payment.amount)}
                      </p>

                      <div className="mt-1 flex items-center gap-2 sm:justify-end">
                        <span className="text-xs text-slate-500">
                          {payment.paymentDate}
                        </span>

                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize text-slate-600">
                          {payment.method.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
