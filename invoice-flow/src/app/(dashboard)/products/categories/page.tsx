"use client";

import { useEffect, useState } from "react";
import {
  addRecord,
  deleteRecord,
  getProducts,
  getRecords,
  updateRecord,
} from "../../../../lib/storage/db";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Record<string, unknown>[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function loadCategories() {
    const records = await getRecords("categories");
    setCategories(records);
  }

  useEffect(() => {
    loadCategories();
  }, []);

  async function handleSaveCategory() {
    const name = categoryName.trim();

    if (!name) {
      setError("Category name is required.");
      return;
    }

    const duplicate = categories.some((category) => {
      if (editingId && String(category.id) === editingId) {
        return false;
      }

      return (
        String(category.name ?? "")
          .trim()
          .toLowerCase() === name.toLowerCase()
      );
    });

    if (duplicate) {
      setError("This category already exists.");
      return;
    }

    if (editingId) {
      await updateRecord("categories", {
        id: editingId,
        name,
        createdAt:
          categories.find((category) => String(category.id) === editingId)
            ?.createdAt ?? new Date().toISOString(),
      });
    } else {
      await addRecord("categories", {
        id: crypto.randomUUID(),
        name,
        createdAt: new Date().toISOString(),
      });
    }

    setCategoryName("");
    setEditingId(null);
    setError("");

    await loadCategories();
  }

  function handleEditCategory(category: Record<string, unknown>) {
    setEditingId(String(category.id));
    setCategoryName(String(category.name ?? ""));
    setError("");
  }

  async function handleDeleteCategory(id: string) {
    const category = categories.find((item) => String(item.id) === id);

    if (!category) {
      return;
    }

    const products = await getProducts();

    const productsUsingCategory = products.filter(
      (product) =>
        String(product.category ?? "")
          .trim()
          .toLowerCase() ===
        String(category.name ?? "")
          .trim()
          .toLowerCase(),
    );

    if (productsUsingCategory.length > 0) {
      window.alert(
        `This category cannot be deleted because ${productsUsingCategory.length} product${
          productsUsingCategory.length === 1 ? "" : "s"
        } use it.`,
      );

      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${String(category.name)}"?`,
    );

    if (!confirmed) {
      return;
    }

    await deleteRecord("categories", id);

    if (editingId === id) {
      setEditingId(null);
      setCategoryName("");
    }

    await loadCategories();
  }

  function handleCancelEdit() {
    setEditingId(null);
    setCategoryName("");
    setError("");
  }

  return (
    <main className="p-6">
      <div className="mx-auto max-w-4xl">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Product Categories
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Create and manage categories used by your products and services.
          </p>
        </div>

        <div className="mt-6 rounded-xl border bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            {editingId ? "Edit Category" : "Add Category"}
          </h2>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={categoryName}
              onChange={(event) => setCategoryName(event.target.value)}
              placeholder="Enter category name"
              className="flex-1 rounded-lg border px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 outline-none focus:border-slate-400"
            />

            <button
              type="button"
              onClick={handleSaveCategory}
              className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              {editingId ? "Update Category" : "Add Category"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="rounded-lg border px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            )}
          </div>

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </div>

        <div className="mt-6 rounded-xl border bg-white">
          <div className="border-b px-6 py-4">
            <h2 className="font-semibold text-slate-900">Categories</h2>
          </div>

          {categories.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-slate-500">
                No categories have been created yet.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {categories.map((category) => (
                <div
                  key={String(category.id)}
                  className="flex items-center justify-between gap-4 px-6 py-4"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {String(category.name)}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Created{" "}
                      {new Date(
                        String(category.createdAt),
                      ).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditCategory(category)}
                      className="rounded-lg border px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(String(category.id))}
                      className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6">
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
