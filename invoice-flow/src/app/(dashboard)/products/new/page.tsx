"use client";

import { useEffect, useState } from "react";
import {
  addRecord,
  generateItemId,
  getRecords,
  isDuplicateProduct,
} from "../../../../lib/storage/db";

const units = [
  "Piece",
  "Kilogram",
  "Gram",
  "Liter",
  "Milliliter",
  "Meter",
  "Centimeter",
  "Square Meter",
  "Cubic Meter",
  "Box",
  "Pack",
  "Bag",
  "Carton",
  "Roll",
  "Set",
  "Hour",
  "Day",
  "Month",
  "Service",
  "Other",
];

export default function NewProductPage() {
  useEffect(() => {
    getRecords("categories").then(setCategories);
  }, []);

  const [itemId, setItemId] = useState("");
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<Record<string, unknown>[]>([]);
  const [unit, setUnit] = useState("Piece");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  const [error, setError] = useState("");

  useEffect(() => {
    generateItemId().then(setItemId);
  }, []);

  async function handleAddProduct(event: React.FormEvent) {
    event.preventDefault();

    setError("");

    if (!name.trim()) {
      setError("Product name is required.");
      return;
    }

    if (!categoryId.trim()) {
      setError("Category is required.");
      return;
    }

    if (!price || Number(price) < 0) {
      setError("Please enter a valid price.");
      return;
    }

    const selectedCategory = categories.find(
      (item) => String(item.id) === categoryId,
    );

    if (!selectedCategory) {
      setError("Category is required.");
      return;
    }

    const categoryName = String(selectedCategory.name).trim();

    const duplicate = await isDuplicateProduct(name, categoryName);

    if (duplicate) {
      setError("This product already exists in this category.");
      return;
    }

    const newItemId = await generateItemId();

    await addRecord("products", {
      id: crypto.randomUUID(),
      itemId: newItemId,
      name: name.trim(),
      categoryId: categoryId.trim(),
      unit,
      description: description.trim(),
      price: Number(price),
      createdAt: new Date().toISOString(),
    });

    window.location.href = "/products";
  }

  return (
    <main className="p-6">
      <div className="mx-auto max-w-4xl">
        <div>
          <p className="text-sm font-medium text-slate-400">
            Products & Services
          </p>

          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            Add Product
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Add a product or service to your billing catalog.
          </p>
        </div>

        <form
          onSubmit={handleAddProduct}
          className="mt-6 rounded-xl border bg-white p-6"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">
                Item ID
              </label>

              <input
                value={itemId}
                readOnly
                className="mt-1 w-full rounded-lg border bg-slate-50 px-4 py-2.5 text-slate-500"
              />

              <p className="mt-1 text-xs text-slate-400">
                Automatically generated.
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Product Name
              </label>

              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Product or service name"
                className="mt-1 w-full rounded-lg border px-4 py-2.5"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Category
              </label>

              <select
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
                className="w-full rounded-lg border bg-white px-4 py-2.5 text-sm"
                required
              >
                <option value="">Select a category</option>

                {categories.map((item) => (
                  <option key={String(item.id)} value={String(item.id)}>
                    {String(item.name)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Unit of Measurement
              </label>

              <select
                value={unit}
                onChange={(event) => setUnit(event.target.value)}
                className="mt-1 w-full rounded-lg border px-4 py-2.5"
              >
                {units.map((unitOption) => (
                  <option key={unitOption} value={unitOption}>
                    {unitOption}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Unit Price
              </label>

              <div className="relative mt-1">
                <input
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full rounded-lg border px-4 py-2.5 pr-16"
                  required
                />

                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                  Birr
                </span>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-slate-700">
                Description
              </label>

              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Describe the product or service..."
                rows={4}
                className="mt-1 w-full rounded-lg border px-4 py-2.5"
              />
            </div>
          </div>

          {error && (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <a
              href="/products"
              className="rounded-lg border px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </a>

            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              Add Product
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
