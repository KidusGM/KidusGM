"use client";

import { useState } from "react";
import { addRecord, generateCustomerCode } from "../../../../lib/storage/db";

export default function NewCustomerPage() {
  const [customerType, setCustomerType] = useState<"individual" | "company">(
    "individual",
  );

  const [name, setName] = useState("");
  const [tin, setTin] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("Ethiopia");
  const [contactPerson, setContactPerson] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [notes, setNotes] = useState("");

  async function handleAddCustomer(event: React.FormEvent) {
    event.preventDefault();

    if (!name.trim()) {
      return;
    }

    if (customerType === "company" && !tin.trim()) {
      return;
    }

    const customerCode = await generateCustomerCode();

    await addRecord("customers", {
      id: crypto.randomUUID(),
      customerCode,
      customerType,
      name: name.trim(),
      tin: tin.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      city: city.trim(),
      country: country.trim(),
      contactPerson: contactPerson.trim(),
      contactPhone: contactPhone.trim(),
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
    });

    window.location.href = "/customers";
  }

  return (
    <main className="p-6">
      <div className="mx-auto max-w-4xl">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Add Customer</h1>

          <p className="mt-1 text-sm text-slate-500">
            Create a new individual or company customer.
          </p>
        </div>

        <form
          onSubmit={handleAddCustomer}
          className="mt-6 rounded-xl border bg-white p-6"
        >
          <div>
            <label className="text-sm font-medium text-slate-700">
              Customer Type
            </label>

            <select
              value={customerType}
              onChange={(event) =>
                setCustomerType(event.target.value as "individual" | "company")
              }
              className="mt-1 w-full rounded-lg border px-4 py-2.5"
            >
              <option value="individual">Individual</option>
              <option value="company">Company</option>
            </select>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">
                {customerType === "company" ? "Company Name" : "Full Name"}
              </label>

              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={
                  customerType === "company" ? "Company name" : "Full name"
                }
                className="mt-1 w-full rounded-lg border px-4 py-2.5"
                required
              />
            </div>

            {customerType === "company" && (
              <div>
                <label className="text-sm font-medium text-slate-700">
                  TIN Number
                </label>

                <input
                  value={tin}
                  onChange={(event) => setTin(event.target.value)}
                  placeholder="TIN number"
                  className="mt-1 w-full rounded-lg border px-4 py-2.5"
                  required
                />
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-slate-700">
                Email
              </label>

              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email address"
                type="email"
                className="mt-1 w-full rounded-lg border px-4 py-2.5"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Phone
              </label>

              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="Phone number"
                className="mt-1 w-full rounded-lg border px-4 py-2.5"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">City</label>

              <input
                value={city}
                onChange={(event) => setCity(event.target.value)}
                placeholder="City"
                className="mt-1 w-full rounded-lg border px-4 py-2.5"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Country
              </label>

              <input
                value={country}
                onChange={(event) => setCountry(event.target.value)}
                placeholder="Country"
                className="mt-1 w-full rounded-lg border px-4 py-2.5"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-slate-700">
                Address
              </label>

              <input
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                placeholder="Street / detailed address"
                className="mt-1 w-full rounded-lg border px-4 py-2.5"
              />
            </div>

            {customerType === "company" && (
              <>
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Contact Person
                  </label>

                  <input
                    value={contactPerson}
                    onChange={(event) => setContactPerson(event.target.value)}
                    placeholder="Contact person's name"
                    className="mt-1 w-full rounded-lg border px-4 py-2.5"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Contact Phone
                  </label>

                  <input
                    value={contactPhone}
                    onChange={(event) => setContactPhone(event.target.value)}
                    placeholder="Contact person's phone"
                    className="mt-1 w-full rounded-lg border px-4 py-2.5"
                  />
                </div>
              </>
            )}

            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-slate-700">
                Notes
              </label>

              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Additional notes"
                rows={4}
                className="mt-1 w-full rounded-lg border px-4 py-2.5"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <a
              href="/customers"
              className="rounded-lg border px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </a>

            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              Add Customer
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
