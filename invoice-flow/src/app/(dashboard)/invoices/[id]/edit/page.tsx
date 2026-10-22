"use client";

import { useEffect, useState } from "react";
import { getRecords, updateRecord } from "../../../../../lib/storage/db";
import type {
  Customer,
  Invoice,
  InvoiceItem,
  PaymentTerms,
  Product,
} from "../../../../../types";

type EditInvoiceItem = {
  id: string;
  productId: string;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxRate: number;
};

export default function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [customerId, setCustomerId] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [currency, setCurrency] = useState("ETB");

  const [purchaseOrderNumber, setPurchaseOrderNumber] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");

  const [paymentTerms, setPaymentTerms] =
    useState<PaymentTerms>("due_on_receipt");

  const [discount, setDiscount] = useState("");
  const [withholdingTax, setWithholdingTax] = useState("");
  const [otherCharges, setOtherCharges] = useState("");
  const [roundingAdjustment, setRoundingAdjustment] = useState("");

  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("");

  const [items, setItems] = useState<EditInvoiceItem[]>([]);

  useEffect(() => {
    async function loadInvoice() {
      try {
        const { id } = await params;

        const [invoiceRecords, customerRecords, productRecords] =
          await Promise.all([
            getRecords("invoices"),
            getRecords("customers"),
            getRecords("products"),
          ]);

        const foundInvoice = invoiceRecords.find(
          (item) => String(item.id) === String(id),
        ) as Invoice | undefined;

        if (!foundInvoice) {
          setError("Invoice not found.");
          return;
        }

        if (foundInvoice.status !== "draft") {
          setError("Only draft invoices can be edited.");
          return;
        }

        setInvoice(foundInvoice);

        setCustomers(customerRecords as Customer[]);
        setProducts(productRecords as Product[]);

        setCustomerId(foundInvoice.customerId);
        setIssueDate(foundInvoice.issueDate);
        setDueDate(foundInvoice.dueDate);
        setCurrency(foundInvoice.currency);

        setPurchaseOrderNumber(foundInvoice.purchaseOrderNumber);
        setReferenceNumber(foundInvoice.referenceNumber);

        setPaymentTerms(foundInvoice.paymentTerms);

        setNotes(foundInvoice.notes);
        setTerms(foundInvoice.terms);

        /*
         * Existing invoices store the calculated tax amount,
         * while the edit form needs the VAT rate.
         *
         * We calculate the rate from the existing values.
         */
        const loadedItems: EditInvoiceItem[] = foundInvoice.items.map(
          (item) => {
            const taxableAmount =
              item.quantity * item.unitPrice - item.discount;

            const calculatedTaxRate =
              taxableAmount > 0 ? (item.tax / taxableAmount) * 100 : 0;

            return {
              id: item.id,
              productId: item.productId,
              description: item.description,
              unit: item.unit,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discount: item.discount,
              taxRate: Number(calculatedTaxRate.toFixed(2)),
            };
          },
        );

        setItems(loadedItems);

        /*
         * Invoice.discount is stored as an amount, not a percentage.
         * Convert it back into the percentage for editing.
         */
        const originalSubtotal = foundInvoice.items.reduce(
          (sum, item) => sum + item.quantity * item.unitPrice,
          0,
        );

        const originalItemDiscount = foundInvoice.items.reduce(
          (sum, item) => sum + item.discount,
          0,
        );

        const amountBeforeOverallDiscount =
          originalSubtotal - originalItemDiscount;

        const calculatedDiscountRate =
          amountBeforeOverallDiscount > 0
            ? (foundInvoice.discount / amountBeforeOverallDiscount) * 100
            : 0;

        setDiscount(
          calculatedDiscountRate > 0
            ? String(Number(calculatedDiscountRate.toFixed(2)))
            : "",
        );

        /*
         * Withholding tax is stored as an amount.
         * Convert it back to a percentage for editing.
         */
        const amountAfterDiscount =
          amountBeforeOverallDiscount - foundInvoice.discount;

        const calculatedWithholdingRate =
          amountAfterDiscount > 0
            ? (foundInvoice.withholdingTax / amountAfterDiscount) * 100
            : 0;

        setWithholdingTax(
          calculatedWithholdingRate > 0
            ? String(Number(calculatedWithholdingRate.toFixed(2)))
            : "",
        );

        setOtherCharges(
          foundInvoice.otherCharges ? String(foundInvoice.otherCharges) : "",
        );

        setRoundingAdjustment(
          foundInvoice.roundingAdjustment
            ? String(foundInvoice.roundingAdjustment)
            : "",
        );
      } catch (loadError) {
        console.error("Failed to load invoice:", loadError);
        setError("Unable to load the invoice.");
      } finally {
        setLoading(false);
      }
    }

    loadInvoice();
  }, [params]);

  const handleProductChange = (id: string, productId: string) => {
    const selectedProduct = products.find(
      (product) => String(product.id) === String(productId),
    );

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id
          ? {
              ...item,
              productId,
              description: selectedProduct?.name ?? item.description,
              unit: selectedProduct?.unit ?? item.unit,
              unitPrice:
                typeof selectedProduct?.price === "number"
                  ? selectedProduct.price
                  : item.unitPrice,
            }
          : item,
      ),
    );
  };

  const handleItemChange = (
    id: string,
    field: keyof EditInvoiceItem,
    value: string,
  ) => {
    setItems((currentItems) =>
      currentItems.map((item) => {
        if (item.id !== id) {
          return item;
        }

        if (field === "description" || field === "unit") {
          return {
            ...item,
            [field]: value,
          };
        }

        const numberValue = Number(value);

        return {
          ...item,
          [field]: Number.isNaN(numberValue) ? 0 : numberValue,
        };
      }),
    );
  };

  const handleAddItem = () => {
    setItems((currentItems) => [
      ...currentItems,
      {
        id: crypto.randomUUID(),
        productId: "",
        description: "",
        unit: "Piece",
        quantity: 1,
        unitPrice: 0,
        discount: 0,
        taxRate: 15,
      },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length === 1) {
      setError("An invoice must have at least one item.");
      return;
    }

    setItems((currentItems) => currentItems.filter((item) => item.id !== id));

    setError("");
  };

  const calculateItemTax = (item: EditInvoiceItem) => {
    const taxableItemAmount = item.quantity * item.unitPrice - item.discount;

    return taxableItemAmount * (item.taxRate / 100);
  };

  const calculateItemTotal = (item: EditInvoiceItem) => {
    return (
      item.quantity * item.unitPrice - item.discount + calculateItemTax(item)
    );
  };

  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );

  const itemDiscount = items.reduce((sum, item) => sum + item.discount, 0);

  const itemTax = items.reduce((sum, item) => sum + calculateItemTax(item), 0);

  const discountRate = Number(discount) || 0;

  const taxableAmountBeforeOverallDiscount = subtotal - itemDiscount;

  const overallDiscount =
    taxableAmountBeforeOverallDiscount * (discountRate / 100);

  const taxableAmount = taxableAmountBeforeOverallDiscount - overallDiscount;

  const withholdingTaxRate = Number(withholdingTax) || 0;

  const withholdingTaxAmount = taxableAmount * (withholdingTaxRate / 100);

  const otherChargesAmount = Number(otherCharges) || 0;

  const roundingAmount = Number(roundingAdjustment) || 0;

  const calculatedTotal =
    taxableAmount +
    itemTax -
    withholdingTaxAmount +
    otherChargesAmount +
    roundingAmount;

  const total =
    invoice?.invoiceType === "credit_note" ? -calculatedTotal : calculatedTotal;

  const handleSaveInvoice = async () => {
    if (!invoice) {
      return;
    }

    setError("");

    if (!customerId) {
      setError("Please select a customer.");
      return;
    }

    if (!issueDate) {
      setError("Please select an issue date.");
      return;
    }

    if (!dueDate) {
      setError("Please select a due date.");
      return;
    }

    if (dueDate < issueDate) {
      setError("Due date cannot be earlier than issue date.");
      return;
    }

    if (items.length === 0) {
      setError("Please add at least one invoice item.");
      return;
    }

    for (const item of items) {
      if (!item.productId) {
        setError("Please select a product for every item.");
        return;
      }

      if (!item.description.trim()) {
        setError("Every invoice item must have a description.");
        return;
      }

      if (item.quantity <= 0) {
        setError("Item quantity must be greater than zero.");
        return;
      }

      if (item.unitPrice < 0) {
        setError("Unit price cannot be negative.");
        return;
      }

      if (item.discount < 0) {
        setError("Item discount cannot be negative.");
        return;
      }

      if (item.discount > item.quantity * item.unitPrice) {
        setError("Item discount cannot be greater than the item amount.");
        return;
      }

      if (item.taxRate < 0) {
        setError("VAT rate cannot be negative.");
        return;
      }
    }

    if (discountRate < 0) {
      setError("Overall discount cannot be negative.");
      return;
    }

    if (discountRate > 100) {
      setError("Overall discount cannot exceed 100%.");
      return;
    }

    if (withholdingTaxRate < 0) {
      setError("Withholding tax cannot be negative.");
      return;
    }

    try {
      setSaving(true);

      const invoiceItems: InvoiceItem[] = items.map((item) => ({
        id: item.id,
        productId: item.productId,
        description: item.description.trim(),
        unit: item.unit,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        tax: calculateItemTax(item),
        total: calculateItemTotal(item),
      }));

      const updatedInvoice: Invoice = {
        ...invoice,

        customerId,

        issueDate,
        dueDate,
        currency,

        purchaseOrderNumber: purchaseOrderNumber.trim(),

        referenceNumber: referenceNumber.trim(),

        items: invoiceItems,

        subtotal,

        discount: overallDiscount,

        tax: itemTax,

        withholdingTax: withholdingTaxAmount,

        otherCharges: otherChargesAmount,

        roundingAdjustment: roundingAmount,

        total,

        paymentTerms,

        notes: notes.trim(),
        terms: terms.trim(),
      };

      await updateRecord("invoices", updatedInvoice);

      setInvoice(updatedInvoice);

      window.location.href = `/invoices/${updatedInvoice.id}`;
    } catch (saveError) {
      console.error("Failed to update invoice:", saveError);

      setError("Failed to save the invoice changes.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="p-6">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm text-slate-500">Loading invoice...</p>
        </div>
      </main>
    );
  }

  if (error && !invoice) {
    return (
      <main className="p-6">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-xl border border-red-200 bg-red-50 p-5">
            <h1 className="font-semibold text-red-800">
              Unable to Edit Invoice
            </h1>

            <p className="mt-1 text-sm text-red-700">{error}</p>

            <a
              href="/invoices"
              className="mt-4 inline-block text-sm font-medium text-red-800 underline"
            >
              Back to Invoices
            </a>
          </div>
        </div>
      </main>
    );
  }

  if (!invoice) {
    return null;
  }

  return (
    <main className="p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <p className="text-sm font-medium text-slate-400">
              Sales & Billing
            </p>

            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              Edit Invoice {invoice.invoiceNumber}
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Update the draft invoice information.
            </p>
          </div>

          <a
            href={`/invoices/${invoice.id}`}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </a>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        )}

        {/* Invoice Information */}
        <section className="mt-6 rounded-xl border bg-white p-5">
          <h2 className="font-semibold text-slate-900">Invoice Information</h2>

          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Customer
              </label>

              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              >
                <option value="">Select customer</option>

                {customers.map((customer) => (
                  <option key={String(customer.id)} value={String(customer.id)}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Invoice Type
              </label>

              <input
                type="text"
                value={invoice.invoiceType
                  .replace("_", " ")
                  .replace(/\b\w/g, (letter) => letter.toUpperCase())}
                disabled
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Currency
              </label>

              <input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Issue Date
              </label>

              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Due Date
              </label>

              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Payment Terms
              </label>

              <select
                value={paymentTerms}
                onChange={(e) =>
                  setPaymentTerms(e.target.value as PaymentTerms)
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              >
                <option value="due_on_receipt">Due on Receipt</option>

                <option value="7_days">7 Days</option>

                <option value="15_days">15 Days</option>

                <option value="30_days">30 Days</option>

                <option value="60_days">60 Days</option>

                <option value="custom">Custom</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Purchase Order Number
              </label>

              <input
                type="text"
                value={purchaseOrderNumber}
                onChange={(e) => setPurchaseOrderNumber(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Reference Number
              </label>

              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500"
              />
            </div>
          </div>
        </section>

        {/* Items */}
        <section className="mt-6 rounded-xl border bg-white">
          <div className="flex flex-col justify-between gap-3 border-b p-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-semibold text-slate-900">Invoice Items</h2>

              <p className="mt-1 text-sm text-slate-500">
                Add, remove, or change products and quantities.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddItem}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              + Add Item
            </button>
          </div>

          <div className="space-y-5 p-5">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="rounded-xl border border-slate-200 p-4"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-medium text-slate-900">
                    Item {index + 1}
                  </h3>

                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-sm font-medium text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="lg:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Product
                    </label>

                    <select
                      value={item.productId}
                      onChange={(e) =>
                        handleProductChange(item.id, e.target.value)
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                    >
                      <option value="">Select product</option>

                      {products.map((product) => (
                        <option
                          key={String(product.id)}
                          value={String(product.id)}
                        >
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Unit
                    </label>

                    <input
                      type="text"
                      value={item.unit}
                      onChange={(e) =>
                        handleItemChange(item.id, "unit", e.target.value)
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Quantity
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(item.id, "quantity", e.target.value)
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Description / Item Name
                    </label>

                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) =>
                        handleItemChange(item.id, "description", e.target.value)
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Unit Price
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={item.unitPrice}
                      onChange={(e) =>
                        handleItemChange(item.id, "unitPrice", e.target.value)
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Discount
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={item.discount}
                      onChange={(e) =>
                        handleItemChange(item.id, "discount", e.target.value)
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      VAT (%)
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={item.taxRate}
                      onChange={(e) =>
                        handleItemChange(item.id, "taxRate", e.target.value)
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Item Total
                    </label>

                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900">
                      {calculateItemTotal(item).toLocaleString()} {currency}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Financial Summary */}
        <section className="mt-6 grid gap-6 md:grid-cols-2">
          <section className="rounded-xl border bg-white p-5">
            <h2 className="font-semibold text-slate-900">Additional Charges</h2>

            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Overall Discount (%)
                </label>

                <input
                  type="number"
                  min="0"
                  max="100"
                  step="any"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Withholding Tax (%)
                </label>

                <input
                  type="number"
                  min="0"
                  step="any"
                  value={withholdingTax}
                  onChange={(e) => setWithholdingTax(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Other Charges ({currency})
                </label>

                <input
                  type="number"
                  min="0"
                  step="any"
                  value={otherCharges}
                  onChange={(e) => setOtherCharges(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Rounding Adjustment ({currency})
                </label>

                <input
                  type="number"
                  step="any"
                  value={roundingAdjustment}
                  onChange={(e) => setRoundingAdjustment(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500"
                />
              </div>
            </div>
          </section>

          <section className="rounded-xl border bg-white p-5">
            <h2 className="font-semibold text-slate-900">Financial Summary</h2>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal</span>

                <span className="font-medium">
                  {subtotal.toLocaleString()} {currency}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Item Discounts</span>

                <span>
                  {itemDiscount.toLocaleString()} {currency}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Overall Discount</span>

                <span>
                  {overallDiscount.toLocaleString()} {currency}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Tax</span>

                <span>
                  {itemTax.toLocaleString()} {currency}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Withholding Tax</span>

                <span>
                  {withholdingTaxAmount.toLocaleString()} {currency}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Other Charges</span>

                <span>
                  {otherChargesAmount.toLocaleString()} {currency}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Rounding Adjustment</span>

                <span>
                  {roundingAmount.toLocaleString()} {currency}
                </span>
              </div>

              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-900">
                    Grand Total
                  </span>

                  <span className="text-lg font-bold text-slate-900">
                    {total.toLocaleString()} {currency}
                  </span>
                </div>
              </div>
            </div>
          </section>
        </section>

        {/* Notes */}
        <section className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border bg-white p-5">
            <h2 className="font-semibold text-slate-900">Notes</h2>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500"
            />
          </div>

          <div className="rounded-xl border bg-white p-5">
            <h2 className="font-semibold text-slate-900">Terms & Conditions</h2>

            <textarea
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              rows={5}
              className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500"
            />
          </div>
        </section>

        {/* Save */}
        <div className="mt-6 flex justify-end gap-3">
          <a
            href={`/invoices/${invoice.id}`}
            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </a>

          <button
            type="button"
            onClick={handleSaveInvoice}
            disabled={saving}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </main>
  );
}
