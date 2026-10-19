"use client";

import { useEffect, useState } from "react";
import { deleteRecord, getRecords } from "../../../lib/storage/db";

export default function ProductsPage() {
  const [products, setProducts] = useState<Record<string, unknown>[]>([]);
  const [categories, setCategories] = useState<Record<string, unknown>[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    Promise.all([getRecords("products"), getRecords("categories")]).then(
      ([productRecords, categoryRecords]) => {
        setProducts(productRecords);
        setCategories(categoryRecords);
      },
    );
  }, []);

  const filteredProducts = products.filter((product) => {
    const search = searchTerm.toLowerCase();

    const category = categories.find(
      (item) => String(item.id) === String(product.categoryId),
    );

    const categoryName = category
      ? String(category.name)
      : String(product.category ?? "");

    return (
      String(product.itemId ?? "")
        .toLowerCase()
        .includes(search) ||
      String(product.name ?? "")
        .toLowerCase()
        .includes(search) ||
      categoryName.toLowerCase().includes(search) ||
      String(product.description ?? "")
        .toLowerCase()
        .includes(search)
    );
  });

  async function handleDeleteProduct(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?",
    );

    if (!confirmed) {
      return;
    }

    await deleteRecord("products", id);

    const updatedProducts = await getRecords("products");
    setProducts(updatedProducts);
  }

  return (
    <main className="p-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Products & Services
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage the products and services used on your invoices.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href="/products/categories"
              className="inline-flex w-fit rounded-lg border px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Manage Categories
            </a>

            <a
              href="/products/new"
              className="inline-flex w-fit rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              Add Product
            </a>
          </div>
        </div>

        <div className="mt-6">
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search products or services..."
            className="w-full rounded-lg border bg-white px-4 py-3"
          />
        </div>

        {filteredProducts.length === 0 ? (
          <div className="mt-6 rounded-xl border bg-white p-8">
            {products.length === 0 ? (
              <>
                <h2 className="text-lg font-semibold text-slate-900">
                  No products or services yet
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Add your first product or service to start creating invoices.
                </p>

                <a
                  href="/products/new"
                  className="mt-5 inline-flex rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
                >
                  Add Your First Product
                </a>
              </>
            ) : (
              <>
                <h2 className="text-lg font-semibold text-slate-900">
                  No products found
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Try a different product or service name.
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => {
              const category = categories.find(
                (item) => String(item.id) === String(product.categoryId),
              );

              const categoryName = category
                ? String(category.name)
                : String(product.category ?? "No category");

              return (
                <div
                  key={String(product.id)}
                  className="rounded-xl border bg-white p-5"
                >
                  <a href={`/products/${String(product.id)}`}>
                    <p className="text-xs font-medium text-slate-400">
                      {String(product.itemId || "No Item ID")}
                    </p>

                    <h2 className="mt-1 font-semibold text-slate-900 hover:text-slate-700">
                      {String(product.name)}
                    </h2>
                  </a>

                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between gap-4">
                      <span className="text-slate-500">Category</span>

                      <span className="font-medium text-slate-700">
                        {categoryName}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4">
                      <span className="text-slate-500">Unit</span>

                      <span className="font-medium text-slate-700">
                        {String(product.unit || "-")}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4">
                      <span className="text-slate-500">Price</span>

                      <span className="font-semibold text-slate-900">
                        {Number(product.price).toLocaleString()} Birr
                      </span>
                    </div>
                  </div>

                  <p className="mt-4 text-sm text-slate-500">
                    {String(product.description || "No description")}
                  </p>

                  <div className="mt-5 flex gap-2">
                    <a
                      href={`/products/${String(product.id)}`}
                      className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
                    >
                      View
                    </a>

                    <a
                      href={`/products/${String(product.id)}/edit`}
                      className="rounded-lg border px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Edit
                    </a>

                    <button
                      type="button"
                      onClick={() => handleDeleteProduct(String(product.id))}
                      className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
