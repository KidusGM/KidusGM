"use client";

import { useEffect, useMemo, useState } from "react";
import { getRecords } from "../../../../lib/storage/db";
import type { Expense } from "../../../../types";

export default function ExpenseReportPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    loadExpenses();
  }, []);

  async function loadExpenses() {
    try {
      setError("");

      const records = await getRecords("expenses");

      setExpenses(records as unknown as Expense[]);
    } catch (error) {
      console.error("Failed to load expenses:", error);
      setError("Failed to load expense report.");
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

  const categories = useMemo(() => {
    return Array.from(
      new Set(
        expenses
          .map((expense) => expense.category)
          .filter((category) => category.trim() !== ""),
      ),
    ).sort();
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return expenses.filter((expense) => {
      const matchesSearch =
        !normalizedSearch ||
        expense.description.toLowerCase().includes(normalizedSearch) ||
        expense.category.toLowerCase().includes(normalizedSearch) ||
        expense.notes.toLowerCase().includes(normalizedSearch);

      const matchesCategory =
        categoryFilter === "all" || expense.category === categoryFilter;

      const matchesFromDate = !fromDate || expense.expenseDate >= fromDate;

      const matchesToDate = !toDate || expense.expenseDate <= toDate;

      return (
        matchesSearch && matchesCategory && matchesFromDate && matchesToDate
      );
    });
  }, [expenses, search, categoryFilter, fromDate, toDate]);

  const totalExpenses = useMemo(() => {
    return filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [filteredExpenses]);

  const categorySummary = useMemo(() => {
    const summary = new Map<string, number>();

    for (const expense of filteredExpenses) {
      const currentTotal = summary.get(expense.category) ?? 0;

      summary.set(expense.category, currentTotal + expense.amount);
    }

    return Array.from(summary.entries())
      .map(([category, total]) => ({
        category,
        total,
      }))
      .sort((a, b) => b.total - a.total);
  }, [filteredExpenses]);

  const hasActiveFilters =
    search || categoryFilter !== "all" || fromDate || toDate;

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Expense Report</h1>

          <p className="mt-1 text-sm text-slate-600">
            Review recorded business expenses and spending history.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
            {error}
          </div>
        )}

        {/* Summary */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Total Expenses</p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {formatCurrency(totalExpenses)} ETB
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Based on current filters
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Number of Expenses
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {filteredExpenses.length}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Matching expense entries
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Report Filters
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Search, filter by category, or select a date range.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Search */}
            <div>
              <label
                htmlFor="search"
                className="mb-2 block text-sm font-medium text-slate-800"
              >
                Search
              </label>

              <input
                id="search"
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search item, category, or notes..."
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            {/* Category */}
            <div>
              <label
                htmlFor="categoryFilter"
                className="mb-2 block text-sm font-medium text-slate-800"
              >
                Category
              </label>

              <select
                id="categoryFilter"
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              >
                <option value="all">All Categories</option>

                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* From Date */}
            <div>
              <label
                htmlFor="fromDate"
                className="mb-2 block text-sm font-medium text-slate-800"
              >
                From Date
              </label>

              <input
                id="fromDate"
                type="date"
                value={fromDate}
                max={toDate || undefined}
                onChange={(event) => setFromDate(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            {/* To Date */}
            <div>
              <label
                htmlFor="toDate"
                className="mb-2 block text-sm font-medium text-slate-800"
              >
                To Date
              </label>

              <input
                id="toDate"
                type="date"
                value={toDate}
                min={fromDate || undefined}
                onChange={(event) => setToDate(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>
          </div>

          {hasActiveFilters && (
            <div className="mt-4 flex items-center justify-between gap-4 border-t border-slate-200 pt-4">
              <p className="text-sm text-slate-600">
                Showing{" "}
                <span className="font-semibold text-slate-900">
                  {filteredExpenses.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-900">
                  {expenses.length}
                </span>{" "}
                expenses.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCategoryFilter("all");
                  setFromDate("");
                  setToDate("");
                }}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Category Summary */}
        <div className="mb-6 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Expenses by Category
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Total spending grouped by expense category.
            </p>
          </div>

          {categorySummary.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <p className="text-sm font-semibold text-slate-700">
                No category data available.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                    <th className="px-6 py-3 font-medium">Category</th>

                    <th className="px-6 py-3 font-medium">
                      Number of Expenses
                    </th>

                    <th className="px-6 py-3 text-right font-medium">
                      Total Amount
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {categorySummary.map((item) => {
                    const expenseCount = filteredExpenses.filter(
                      (expense) => expense.category === item.category,
                    ).length;

                    return (
                      <tr
                        key={item.category}
                        className="border-b border-slate-100 last:border-0"
                      >
                        <td className="px-6 py-4 font-semibold text-slate-900">
                          {item.category}
                        </td>

                        <td className="px-6 py-4 text-slate-700">
                          {expenseCount}
                        </td>

                        <td className="px-6 py-4 text-right font-semibold text-slate-900">
                          {formatCurrency(item.total)} ETB
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Expense History */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Expense History
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {filteredExpenses.length} expense
              {filteredExpenses.length === 1 ? "" : "s"} shown.
            </p>
          </div>

          {filteredExpenses.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm font-semibold text-slate-700">
                No matching expenses found.
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Try changing your search, category, or date filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                    <th className="px-6 py-3 font-medium">Date</th>
                    <th className="px-6 py-3 font-medium">Item / Expense</th>
                    <th className="px-6 py-3 font-medium">Category</th>
                    <th className="px-6 py-3 font-medium">Amount</th>
                    <th className="px-6 py-3 font-medium">Notes</th>
                  </tr>
                </thead>

                <tbody>
                  {[...filteredExpenses]
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
