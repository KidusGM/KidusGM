"use client";

import { useEffect, useState } from "react";
import {
  getProducts,
  getRecords,
  isDuplicateProduct,
  updateRecord,
} from "../../../../../lib/storage/db";

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

export default function EditProductPage() {
  const [productId, setProductId] = useState("");
  const [itemId, setItemId] = useState("");
  const [createdAt, setCreatedAt] = useState("");

  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [unit, setUnit] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  const [categories, setCategories] = useState<Record<string, unknown>[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const pathParts = window.location.pathname.split("/");
    const id = pathParts[pathParts.length - 2];

    if (!id) {
      setLoading(false);
      return;
    }

    setProductId(id);

    Promise.all([getProducts(), getRecords("categories")]).then(
      ([products, categoryRecords]) => {
        const product = products.find((item) => String(item.id) === id);

        setCategories(categoryRecords);

        if (!product) {
          setLoading(false);
          return;
        }

        setItemId(String(product.itemId ?? ""));
        setCreatedAt(String(product.createdAt ?? ""));
        setName(String(product.name ?? ""));
        setCategoryId(String(product.categoryId ?? ""));
        setUnit(String(product.unit ?? ""));
        setDescription(String(product.description ?? ""));
        setPrice(String(product.price ?? ""));

        setLoading(false);
      },
    );
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Product name is required.");
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

    if (!unit) {
      setError("Unit of measurement is required.");
      return;
    }

    if (!price || Number(price) < 0) {
      setError("Please enter a valid price.");
      return;
    }

    const duplicate = await isDuplicateProduct(
      trimmedName,
      categoryName,
      productId,
    );

    if (duplicate) {
      setError("A product with the same name and category already exists.");
      return;
    }

    await updateRecord("products", {
      id: productId,
      itemId,
      name: trimmedName,
      categoryId,
      unit,
      description: description.trim(),
      price: Number(price),
      createdAt,
    });

    window.location.href = `/products/${productId}`;
  }

  if (loading) {
    return (
      <main className="p-6">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm text-slate-500">Loading product...</p>
        </div>
      </main>
    );
  }

  if (!productId || !itemId) {
    return (
      <main className="p-6">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-2xl font-bold text-slate-900">
            Product Not Found
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            The product you are trying to edit does not exist.
          </p>

          <a
            href="/products"
            className="mt-5 inline-flex rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white"
          >
            Back to Products
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6">
      <div className="mx-auto max-w-3xl">
        <div>
          <p className="text-sm text-slate-400">{itemId}</p>

          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            Edit Product
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Update the product information below.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
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
                className="mt-2 w-full rounded-lg border bg-slate-100 px-4 py-2.5 text-sm text-slate-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Product Name
              </label>

              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-2 w-full rounded-lg border px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-500"
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
                className="mt-2 w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-slate-900"
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
                className="mt-2 w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-slate-900"
                required
              >
                <option value="">Select a unit</option>

                {units.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Price
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                className="mt-2 w-full rounded-lg border px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-500"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-slate-700">
                Description
              </label>

              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={4}
                className="mt-2 w-full rounded-lg border px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-500"
              />
            </div>
          </div>

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

          <div className="mt-6 flex gap-3">
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              Save Changes
            </button>

            <a
              href={`/products/${productId}`}
              className="rounded-lg border px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </a>
          </div>
        </form>
      </div>
    </main>
  );
}
