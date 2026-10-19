"use client";

import { useState } from "react";
import { addRecord, getRecords } from "../../lib/storage/db";

export default function DatabaseTest() {
  const [status, setStatus] = useState("Ready");
  const [customers, setCustomers] = useState<Record<string, unknown>[]>([]);

  async function testAddCustomer() {
    try {
      await addRecord("customers", {
        id: crypto.randomUUID(),
        name: "Test Customer",
        email: "test@example.com",
        phone: "0912345678",
        address: "Addis Ababa",
        createdAt: new Date().toISOString(),
      });

      setStatus("Customer saved successfully!");
    } catch (error) {
      console.error(error);
      setStatus("Failed to save customer");
    }
  }

  async function testGetCustomers() {
    try {
      const records = await getRecords("customers");

      setCustomers(records);
      setStatus(`${records.length} customer(s) found.`);
    } catch (error) {
      console.error(error);
      setStatus("Failed to read customers");
    }
  }

  return (
    <div className="mt-6 rounded-xl border bg-white p-5">
      <h2 className="font-semibold text-slate-900">
        Database Test
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        {status}
      </p>

      <div className="mt-4 flex gap-3">
        <button
          onClick={testAddCustomer}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Add Test Customer
        </button>

        <button
          onClick={testGetCustomers}
          className="rounded-lg border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Load Customers
        </button>
      </div>

      {customers.length > 0 && (
        <div className="mt-5 space-y-3">
          {customers.map((customer) => (
            <div
              key={String(customer.id)}
              className="rounded-lg border p-4"
            >
              <p className="font-medium text-slate-900">
                {String(customer.name)}
              </p>

              <p className="text-sm text-slate-500">
                {String(customer.email)}
              </p>

              <p className="text-sm text-slate-500">
                {String(customer.phone)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}