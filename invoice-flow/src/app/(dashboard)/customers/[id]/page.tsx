"use client";

import { useEffect, useState } from "react";
import { getCustomers } from "../../../../lib/storage/db";

export default function CustomerDetailsPage() {
  const [customer, setCustomer] = useState<Record<string, unknown> | null>(
    null,
  );

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const customerId = window.location.pathname.split("/").pop();

    if (!customerId) {
      setLoading(false);
      return;
    }

    getCustomers().then((customers) => {
      const foundCustomer = customers.find(
        (item) => String(item.id) === customerId,
      );

      setCustomer(foundCustomer ?? null);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <main className="p-6">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm text-slate-500">Loading customer...</p>
        </div>
      </main>
    );
  }

  if (!customer) {
    return (
      <main className="p-6">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-2xl font-bold text-slate-900">
            Customer Not Found
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            The customer you are looking for does not exist.
          </p>

          <a
            href="/customers"
            className="mt-5 inline-flex rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white"
          >
            Back to Customers
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6">
      <div className="mx-auto max-w-4xl">
        <div>
          <p className="text-sm text-slate-400">
            {String(customer.customerCode)}
          </p>

          <div className="mt-2 flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">
              {String(customer.name)}
            </h1>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-600">
              {String(customer.customerType)}
            </span>
          </div>
        </div>

        <div className="mt-6 rounded-xl border bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Contact Information
          </h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase text-slate-400">
                Email
              </p>

              <p className="mt-1 text-sm text-slate-700">
                {String(customer.email || "-")}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-slate-400">
                Phone
              </p>

              <p className="mt-1 text-sm text-slate-700">
                {String(customer.phone || "-")}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-slate-400">
                City
              </p>

              <p className="mt-1 text-sm text-slate-700">
                {String(customer.city || "-")}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-slate-400">
                Country
              </p>

              <p className="mt-1 text-sm text-slate-700">
                {String(customer.country || "-")}
              </p>
            </div>

            <div className="sm:col-span-2">
              <p className="text-xs font-medium uppercase text-slate-400">
                Address
              </p>

              <p className="mt-1 text-sm text-slate-700">
                {String(customer.address || "-")}
              </p>
            </div>
          </div>
        </div>

        {customer.customerType === "company" && (
          <div className="mt-6 rounded-xl border bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Company Information
            </h2>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase text-slate-400">
                  TIN
                </p>

                <p className="mt-1 text-sm text-slate-700">
                  {String(customer.tin || "-")}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase text-slate-400">
                  Contact Person
                </p>

                <p className="mt-1 text-sm text-slate-700">
                  {String(customer.contactPerson || "-")}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase text-slate-400">
                  Contact Phone
                </p>

                <p className="mt-1 text-sm text-slate-700">
                  {String(customer.contactPhone || "-")}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 rounded-xl border bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Notes</h2>

          <p className="mt-3 text-sm text-slate-600">
            {String(customer.notes || "No notes available.")}
          </p>
        </div>

        <div className="mt-6 flex gap-3">
          <a
            href={`/customers/${String(customer.id)}/edit`}
            className="inline-flex rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            Edit Customer
          </a>

          <a
            href="/customers"
            className="inline-flex rounded-lg border px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Back to Customers
          </a>
        </div>
      </div>
    </main>
  );
}
