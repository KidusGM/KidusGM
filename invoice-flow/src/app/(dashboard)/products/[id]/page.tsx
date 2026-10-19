"use client";

import { useEffect, useState } from "react";
import { getProducts, getRecords } from "../../../../lib/storage/db";

export default function ProductDetailsPage() {
  const [product, setProduct] = useState<Record<string, unknown> | null>(null);
  const [categoryName, setCategoryName] = useState("-");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const pathParts = window.location.pathname.split("/");
    const productId = pathParts[pathParts.length - 1];

    if (!productId) {
      setLoading(false);
      return;
    }

    Promise.all([getProducts(), getRecords("categories")]).then(
      ([products, categories]) => {
        const foundProduct = products.find(
          (item) => String(item.id) === productId,
        );

        if (foundProduct) {
          const category = categories.find(
            (item) => String(item.id) === String(foundProduct.categoryId),
          );

          setCategoryName(
            category ? String(category.name) : "Unknown Category",
          );
        }

        setProduct(foundProduct ?? null);
        setLoading(false);
      },
    );
  }, []);

  if (loading) {
    return (
      <main className="p-6">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm text-slate-500">Loading product...</p>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="p-6">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-2xl font-bold text-slate-900">
            Product Not Found
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            The product you are looking for does not exist.
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
      <div className="mx-auto max-w-4xl">
        <div>
          <p className="text-sm text-slate-400">{String(product.itemId)}</p>

          <h1 className="mt-2 text-2xl font-bold text-slate-900">
            {String(product.name)}
          </h1>
        </div>

        <div className="mt-6 rounded-xl border bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Product Information
          </h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase text-slate-400">
                Item ID
              </p>

              <p className="mt-1 text-sm text-slate-700">
                {String(product.itemId || "-")}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-slate-400">
                Category
              </p>

              <p className="mt-1 text-sm text-slate-700">{categoryName}</p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-slate-400">
                Unit
              </p>

              <p className="mt-1 text-sm text-slate-700">
                {String(product.unit || "-")}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-slate-400">
                Unit Price
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                {Number(product.price).toLocaleString()} Birr
              </p>
            </div>

            <div className="sm:col-span-2">
              <p className="text-xs font-medium uppercase text-slate-400">
                Description
              </p>

              <p className="mt-1 text-sm text-slate-700">
                {String(product.description || "No description")}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <a
            href={`/products/${String(product.id)}/edit`}
            className="inline-flex rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            Edit Product
          </a>

          <a
            href="/products"
            className="inline-flex rounded-lg border px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Back to Products
          </a>
        </div>
      </div>
    </main>
  );
}
