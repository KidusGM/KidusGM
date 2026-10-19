"use client";

import { useEffect, useState } from "react";
import { deleteRecord, getCustomers } from "../../../lib/storage/db";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Record<string, unknown>[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    getCustomers().then(setCustomers);
  }, []);

  const filteredCustomers = customers.filter((customer) => {
    const search = searchTerm.toLowerCase();

    return (
      String(customer.name).toLowerCase().includes(search) ||
      String(customer.customerCode).toLowerCase().includes(search) ||
      String(customer.tin ?? "")
        .toLowerCase()
        .includes(search) ||
      String(customer.phone).toLowerCase().includes(search)
    );
  });

  async function handleDeleteCustomer(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this customer?",
    );

    if (!confirmed) {
      return;
    }

    await deleteRecord("customers", id);

    const updatedCustomers = await getCustomers();
    setCustomers(updatedCustomers);
  }

  return (
    <main className="p-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Customers</h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage individuals, companies, and their billing information.
            </p>
          </div>

          <a
            href="/customers/new"
            className="inline-flex w-fit rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            Add Customer
          </a>
        </div>

        <div className="mt-6">
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by name, code, TIN, or phone..."
            className="w-full rounded-lg border bg-white px-4 py-3"
          />
        </div>

        {filteredCustomers.length === 0 ? (
          <div className="mt-6 rounded-xl border bg-white p-8">
            {customers.length === 0 ? (
              <>
                <h2 className="text-lg font-semibold text-slate-900">
                  No customers yet
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Add your first customer to start creating invoices.
                </p>

                <a
                  href="/customers/new"
                  className="mt-5 inline-flex rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
                >
                  Add Your First Customer
                </a>
              </>
            ) : (
              <>
                <h2 className="text-lg font-semibold text-slate-900">
                  No customers found
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Try a different name, customer code, TIN, or phone number.
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {filteredCustomers.map((customer) => (
              <div
                key={String(customer.id)}
                className="rounded-xl border bg-white p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <a
                      href={`/customers/${String(customer.id)}`}
                      className="block"
                    >
                      <h2 className="font-semibold text-slate-900 hover:text-slate-700">
                        {String(customer.name)}
                      </h2>

                      <p className="mt-1 text-xs text-slate-400">
                        {String(customer.customerCode)}
                      </p>
                    </a>
                  </div>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-600">
                    {String(customer.customerType)}
                  </span>
                </div>

                {customer.customerType === "company" && (
                  <p className="mt-3 text-sm text-slate-600">
                    TIN: {String(customer.tin)}
                  </p>
                )}

                <p className="mt-2 text-sm text-slate-500">
                  {String(customer.email)}
                </p>

                <p className="text-sm text-slate-500">
                  {String(customer.phone)}
                </p>

                <p className="text-sm text-slate-500">
                  {String(customer.city)}, {String(customer.country)}
                </p>

                <button
                  type="button"
                  onClick={() => handleDeleteCustomer(String(customer.id))}
                  className="mt-4 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
