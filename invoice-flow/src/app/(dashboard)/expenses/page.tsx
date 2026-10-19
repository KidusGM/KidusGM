"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  addRecord,
  deleteRecord,
  getRecords,
  updateRecord,
} from "../../../lib/storage/db";
import type { Expense } from "../../../types";

const EXPENSE_ITEMS = [
  "Office Supplies",
  "Stationery",
  "Printer / Toner",
  "Computer Equipment",
  "Furniture",
  "Fuel",
  "Transportation",
  "Electricity",
  "Water",
  "Internet",
  "Telephone",
  "Rent",
  "Maintenance",
  "Repair",
  "Cleaning",
  "Advertising",
  "Professional Service",
  "Bank Charge",
  "Service Charge",
  "Government Fee",
  "Other",
];

const EXPENSE_CATEGORIES = [
  "Office Supplies",
  "Equipment",
  "Furniture",
  "Transportation",
  "Utilities",
  "Rent",
  "Maintenance",
  "Services",
  "Banking",
  "Taxes & Government Fees",
  "Marketing",
  "Other",
];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const [itemName, setItemName] = useState("");
  const [customItemName, setCustomItemName] = useState("");

  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");

  const [amount, setAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState("");
  const [notes, setNotes] = useState("");

  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadExpenses();
  }, []);

  async function loadExpenses() {
    try {
      const records = await getRecords("expenses");
      setExpenses(records as unknown as Expense[]);
    } catch (error) {
      console.error("Failed to load expenses:", error);
      setError("Failed to load expenses.");
    }
  }

  function formatCurrency(value: number) {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  function formatDate(date: string) {
    if (!date) {
      return "-";
    }

    return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  const finalItemName =
    itemName === "custom" ? customItemName.trim() : itemName;

  const finalCategory =
    category === "custom" ? customCategory.trim() : category;

  function resetForm() {
    setItemName("");
    setCustomItemName("");
    setCategory("");
    setCustomCategory("");
    setAmount("");
    setExpenseDate("");
    setNotes("");
    setEditingExpenseId(null);
  }

  function handleEdit(expense: Expense) {
    setMessage("");
    setError("");

    const isCustomItem = !EXPENSE_ITEMS.includes(expense.description);
    const isCustomCategory = !EXPENSE_CATEGORIES.includes(expense.category);

    if (isCustomItem) {
      setItemName("custom");
      setCustomItemName(expense.description);
    } else {
      setItemName(expense.description);
      setCustomItemName("");
    }

    if (isCustomCategory) {
      setCategory("custom");
      setCustomCategory(expense.category);
    } else {
      setCategory(expense.category);
      setCustomCategory("");
    }

    setAmount(String(expense.amount));
    setExpenseDate(expense.expenseDate);
    setNotes(expense.notes);

    setEditingExpenseId(expense.id);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleDelete(expense: Expense) {
    setMessage("");
    setError("");

    const confirmed = window.confirm(
      `Are you sure you want to delete "${expense.description}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteRecord("expenses", expense.id);

      setExpenses((currentExpenses) =>
        currentExpenses.filter((item) => item.id !== expense.id),
      );

      if (editingExpenseId === expense.id) {
        resetForm();
      }

      setMessage("Expense deleted successfully.");
    } catch (error) {
      console.error("Failed to delete expense:", error);
      setError("Failed to delete expense. Please try again.");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setError("");

    const numericAmount = Number(amount);

    if (!finalItemName) {
      setError("Please select or enter an item / expense name.");
      return;
    }

    if (!finalCategory) {
      setError("Please select or enter an expense category.");
      return;
    }

    if (!amount || Number.isNaN(numericAmount) || numericAmount <= 0) {
      setError("Please enter a valid expense amount greater than 0.");
      return;
    }

    if (!expenseDate) {
      setError("Please select an expense date.");
      return;
    }

    try {
      if (editingExpenseId) {
        const existingExpense = expenses.find(
          (expense) => expense.id === editingExpenseId,
        );

        if (!existingExpense) {
          setError("The expense you are trying to edit could not be found.");
          return;
        }

        const updatedExpense: Expense = {
          ...existingExpense,
          description: finalItemName,
          amount: numericAmount,
          category: finalCategory,
          expenseDate,
          notes: notes.trim(),
        };

        await updateRecord(
          "expenses",
          updatedExpense as unknown as Record<string, unknown>,
        );

        setExpenses((currentExpenses) =>
          currentExpenses.map((expense) =>
            expense.id === editingExpenseId ? updatedExpense : expense,
          ),
        );

        resetForm();
        setMessage("Expense updated successfully.");
      } else {
        const expense: Expense = {
          id: crypto.randomUUID(),
          description: finalItemName,
          amount: numericAmount,
          category: finalCategory,
          expenseDate,
          notes: notes.trim(),
          createdAt: new Date().toISOString(),
        };

        await addRecord("expenses", expense);

        setExpenses((currentExpenses) => [expense, ...currentExpenses]);

        resetForm();
        setMessage("Expense saved successfully.");
      }
    } catch (error) {
      console.error("Failed to save expense:", error);
      setError("Failed to save expense. Please try again.");
    }
  }

  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [expenses]);

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Expenses</h1>

          <p className="mt-1 text-sm text-slate-600">
            Record and track business expenses.
          </p>
        </div>

        {/* Summary */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Total Expenses</p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {formatCurrency(totalExpenses)} ETB
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Total recorded expenses
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Number of Expenses
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {expenses.length}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Recorded expense entries
            </p>
          </div>
        </div>

        {/* Messages */}
        {message && (
          <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
            {error}
          </div>
        )}

        {/* Add / Edit Expense */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900">
              {editingExpenseId ? "Edit Expense" : "Add Expense"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {editingExpenseId
                ? "Update the expense details below."
                : "Enter the details of a business expense."}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-5 md:grid-cols-2">
              {/* Item / Expense Name */}
              <div>
                <label
                  htmlFor="itemName"
                  className="mb-2 block text-sm font-medium text-slate-800"
                >
                  Item / Expense Name
                </label>

                <select
                  id="itemName"
                  value={itemName}
                  onChange={(event) => {
                    setItemName(event.target.value);

                    if (event.target.value !== "custom") {
                      setCustomItemName("");
                    }
                  }}
                  disabled={itemName === "custom"}
                  className={`w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 ${
                    itemName === "custom"
                      ? "cursor-not-allowed bg-slate-100 text-slate-500"
                      : "bg-white text-slate-900"
                  }`}
                >
                  <option value="">Select an item / expense...</option>

                  {EXPENSE_ITEMS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}

                  <option value="custom">Custom / Not Listed</option>
                </select>

                {itemName === "custom" && (
                  <div className="mt-3">
                    <input
                      type="text"
                      value={customItemName}
                      onChange={(event) =>
                        setCustomItemName(event.target.value)
                      }
                      placeholder="Enter item / expense name"
                      autoFocus
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                    />

                    <button
                      type="button"
                      onClick={() => {
                        setItemName("");
                        setCustomItemName("");
                      }}
                      className="mt-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                    >
                      ← Choose from list
                    </button>
                  </div>
                )}
              </div>

              {/* Category */}
              <div>
                <label
                  htmlFor="category"
                  className="mb-2 block text-sm font-medium text-slate-800"
                >
                  Category
                </label>

                <select
                  id="category"
                  value={category}
                  onChange={(event) => {
                    setCategory(event.target.value);

                    if (event.target.value !== "custom") {
                      setCustomCategory("");
                    }
                  }}
                  disabled={category === "custom"}
                  className={`w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 ${
                    category === "custom"
                      ? "cursor-not-allowed bg-slate-100 text-slate-500"
                      : "bg-white text-slate-900"
                  }`}
                >
                  <option value="">Select a category...</option>

                  {EXPENSE_CATEGORIES.map((expenseCategory) => (
                    <option key={expenseCategory} value={expenseCategory}>
                      {expenseCategory}
                    </option>
                  ))}

                  <option value="custom">Custom / Not Listed</option>
                </select>

                {category === "custom" && (
                  <div className="mt-3">
                    <input
                      type="text"
                      value={customCategory}
                      onChange={(event) =>
                        setCustomCategory(event.target.value)
                      }
                      placeholder="Enter expense category"
                      autoFocus
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                    />

                    <button
                      type="button"
                      onClick={() => {
                        setCategory("");
                        setCustomCategory("");
                      }}
                      className="mt-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                    >
                      ← Choose from list
                    </button>
                  </div>
                )}
              </div>

              {/* Amount */}
              <div>
                <label
                  htmlFor="amount"
                  className="mb-2 block text-sm font-medium text-slate-800"
                >
                  Amount
                </label>

                <div className="flex">
                  <input
                    id="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-l-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  />

                  <span className="flex items-center rounded-r-lg border border-l-0 border-slate-300 bg-slate-50 px-4 text-sm font-medium text-slate-600">
                    ETB
                  </span>
                </div>
              </div>

              {/* Expense Date */}
              <div>
                <label
                  htmlFor="expenseDate"
                  className="mb-2 block text-sm font-medium text-slate-800"
                >
                  Expense Date
                </label>

                <input
                  id="expenseDate"
                  type="date"
                  value={expenseDate}
                  onChange={(event) => setExpenseDate(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
              </div>

              {/* Notes */}
              <div className="md:col-span-2">
                <label
                  htmlFor="notes"
                  className="mb-2 block text-sm font-medium text-slate-800"
                >
                  Notes
                </label>

                <textarea
                  id="notes"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Optional notes about this expense..."
                  rows={4}
                  className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
              </div>
            </div>

            {/* Form Buttons */}
            <div className="mt-6 flex justify-end gap-3">
              {editingExpenseId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
              )}

              <button
                type="submit"
                className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                {editingExpenseId ? "Update Expense" : "Save Expense"}
              </button>
            </div>
          </form>
        </div>

        {/* Expense History */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Expense History
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {expenses.length} expense
              {expenses.length === 1 ? "" : "s"} recorded.
            </p>
          </div>

          {expenses.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm font-semibold text-slate-700">
                No expenses recorded yet.
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Saved expenses will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                    <th className="px-6 py-3 font-medium">Date</th>
                    <th className="px-6 py-3 font-medium">Item / Expense</th>
                    <th className="px-6 py-3 font-medium">Category</th>
                    <th className="px-6 py-3 font-medium">Amount</th>
                    <th className="px-6 py-3 font-medium">Notes</th>
                    <th className="px-6 py-3 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {[...expenses]
                    .sort(
                      (a, b) =>
                        new Date(b.expenseDate).getTime() -
                        new Date(a.expenseDate).getTime(),
                    )
                    .map((expense) => (
                      <tr
                        key={expense.id}
                        className="border-b border-slate-100 last:border-0"
                      >
                        <td className="px-6 py-4 text-slate-700">
                          {formatDate(expense.expenseDate)}
                        </td>

                        <td className="px-6 py-4 font-semibold text-slate-900">
                          {expense.description}
                        </td>

                        <td className="px-6 py-4 text-slate-700">
                          {expense.category}
                        </td>

                        <td className="px-6 py-4 font-semibold text-slate-900">
                          {formatCurrency(expense.amount)} ETB
                        </td>

                        <td className="px-6 py-4 text-slate-600">
                          {expense.notes || "-"}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleEdit(expense)}
                              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(expense)}
                              className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
