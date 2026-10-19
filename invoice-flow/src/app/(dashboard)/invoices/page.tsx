"use client";

import { useEffect, useState } from "react";
import { getRecords } from "../../../lib/storage/db";
import type { Customer } from "../../../types";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Record<string, unknown>[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    Promise.all([getRecords("invoices"), getRecords("customers")]).then(
      ([invoiceRecords, customerRecords]) => {
        setInvoices(invoiceRecords);
        setCustomers(customerRecords as Customer[]);
      },
    );
  }, []);

  return (
    <main className="p-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-400">
              Sales & Billing
            </p>

            <h1 className="mt-1 text-2xl font-bold text-slate-900">Invoices</h1>

            <p className="mt-1 text-sm text-slate-500">
              Create, manage, and track customer invoices.
            </p>
          </div>

          <a
            href="/invoices/new"
            className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            + Create Invoice
          </a>
        </div>

        {invoices.length === 0 ? (
          <div className="mt-6 rounded-xl border bg-white p-10 text-center">
            <h2 className="text-lg font-semibold text-slate-900">
              No invoices yet
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Create your first invoice to start tracking sales and payments.
            </p>

            <a
              href="/invoices/new"
              className="mt-5 inline-block rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              Create Invoice
            </a>
          </div>
        ) : (
          <div className="mt-6 rounded-xl border bg-white">
            <div className="border-b px-5 py-4">
              <h2 className="font-semibold text-slate-900">Invoice List</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-slate-50">
                  <tr>
                    <th className="px-5 py-3 font-medium text-slate-500">
                      Invoice
                    </th>
                    <th className="px-5 py-3 font-medium text-slate-500">
                      Customer
                    </th>
                    <th className="px-5 py-3 font-medium text-slate-500">
                      Type
                    </th>
                    <th className="px-5 py-3 font-medium text-slate-500">
                      Issue Date
                    </th>
                    <th className="px-5 py-3 font-medium text-slate-500">
                      Due Date
                    </th>
                    <th className="px-5 py-3 font-medium text-slate-500">
                      Total
                    </th>
                    <th className="px-5 py-3 font-medium text-slate-500">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {[...invoices]
                    .sort(
                      (a, b) =>
                        Number(
                          String(b.invoiceNumber || "").replace("INV-", ""),
                        ) -
                        Number(
                          String(a.invoiceNumber || "").replace("INV-", ""),
                        ),
                    )
                    .map((invoice) => {
                      const customer = customers.find(
                        (item) =>
                          String(item.id) === String(invoice.customerId),
                      );

                      const customerName = customer
                        ? customer.name
                        : "Unknown customer";

                      return (
                        <tr
                          key={String(invoice.id)}
                          className="border-b last:border-b-0"
                        >
                          <td className="px-5 py-4 font-medium text-slate-900">
                            <a
                              href={`/invoices/${String(invoice.id)}`}
                              className="text-blue-600 hover:underline"
                            >
                              {String(invoice.invoiceNumber || "")}
                            </a>
                          </td>

                          <td className="px-5 py-4 text-slate-600">
                            {customerName}
                          </td>

                          <td className="px-5 py-4 text-slate-600">
                            {String(invoice.invoiceType || "sales")
                              .replace("_", " ")
                              .replace(/\b\w/g, (letter) =>
                                letter.toUpperCase(),
                              )}
                          </td>

                          <td className="px-5 py-4 text-slate-600">
                            {String(invoice.issueDate || "-")}
                          </td>

                          <td className="px-5 py-4 text-slate-600">
                            {String(invoice.dueDate || "-")}
                          </td>

                          <td className="px-5 py-4 font-medium text-slate-900">
                            {Number(invoice.total || 0).toLocaleString()}{" "}
                            {String(invoice.currency || "ETB")}
                          </td>

                          <td className="px-5 py-4">
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                              {String(invoice.status || "Draft")}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
