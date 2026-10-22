"use client";

import { useEffect, useState } from "react";
import {
  addRecord,
  generateInvoiceNumber,
  getRecords,
} from "../../../../lib/storage/db";
import type {
  Customer,
  Product,
  InvoiceItem,
  InvoiceType,
  PaymentTerms,
} from "../../../../types";

type InvoiceFormItem = {
  id: string;
  productId: string;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxRate: number;
};

export default function NewInvoicePage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [invoices, setInvoices] = useState<Record<string, unknown>[]>([]);

  const [invoiceType, setInvoiceType] = useState<InvoiceType>("sales");

  const [customerId, setCustomerId] = useState("");
  const [referenceInvoiceId, setReferenceInvoiceId] = useState("");

  const [issueDate, setIssueDate] = useState(
    new Date().toISOString().split("T")[0],
  );

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

  const [error, setError] = useState("");

  const [items, setItems] = useState<InvoiceFormItem[]>([
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

  useEffect(() => {
    Promise.all([
      getRecords("customers"),
      getRecords("products"),
      getRecords("invoices"),
    ]).then(([customerRecords, productRecords, invoiceRecords]) => {
      setCustomers(customerRecords as Customer[]);
      setProducts(productRecords as Product[]);
      setInvoices(invoiceRecords);
    });
  }, []);

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
    setItems((currentItems) => {
      if (currentItems.length === 1) {
        return currentItems;
      }

      return currentItems.filter((item) => item.id !== id);
    });
  };

  const handleProductChange = (id: string, productId: string) => {
    const selectedProduct = products.find(
      (product) => String(product.id) === productId,
    );

    setItems((currentItems) =>
      currentItems.map((item) => {
        if (item.id !== id) {
          return item;
        }

        if (!selectedProduct) {
          return {
            ...item,
            productId,
          };
        }

        return {
          ...item,
          productId,
          description: selectedProduct.description,
          unit: selectedProduct.unit,
          unitPrice: Number(selectedProduct.price) || 0,
        };
      }),
    );
  };

  const handleQuantityChange = (id: string, value: string) => {
    const quantity = Number(value);

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: Number.isNaN(quantity) ? 0 : quantity,
            }
          : item,
      ),
    );
  };

  const handlePriceChange = (id: string, value: string) => {
    const price = Number(value);

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id
          ? {
              ...item,
              unitPrice: Number.isNaN(price) ? 0 : price,
            }
          : item,
      ),
    );
  };

  const handleDescriptionChange = (id: string, value: string) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id
          ? {
              ...item,
              description: value,
            }
          : item,
      ),
    );
  };

  const handleUnitChange = (id: string, value: string) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id
          ? {
              ...item,
              unit: value,
            }
          : item,
      ),
    );
  };

  const handleItemDiscountChange = (id: string, value: string) => {
    const discountValue = Number(value);

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id
          ? {
              ...item,
              discount: Number.isNaN(discountValue) ? 0 : discountValue,
            }
          : item,
      ),
    );
  };

  const handleItemTaxRateChange = (id: string, value: string) => {
    const taxRate = Number(value);

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id
          ? {
              ...item,
              taxRate: Number.isNaN(taxRate) ? 0 : taxRate,
            }
          : item,
      ),
    );
  };

  const calculateItemTax = (item: InvoiceFormItem) => {
    const taxableItemAmount = item.quantity * item.unitPrice - item.discount;

    return taxableItemAmount * (item.taxRate / 100);
  };

  const calculateItemTotal = (item: InvoiceFormItem) => {
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
    invoiceType === "credit_note" ? -calculatedTotal : calculatedTotal;

  const referenceInvoices = invoices.filter(
    (invoice) => String(invoice.invoiceType ?? "sales") === "sales",
  );

  const handleSaveInvoice = async () => {
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
      setError("Due date cannot be earlier than the issue date.");
      return;
    }

    if (
      (invoiceType === "credit_note" || invoiceType === "debit_note") &&
      !referenceInvoiceId
    ) {
      setError(
        "Please select the original invoice for this credit or debit note.",
      );
      return;
    }

    if (items.length === 0) {
      setError("An invoice must contain at least one item.");
      return;
    }

    for (const item of items) {
      if (!item.productId) {
        setError("Please select a product for every invoice item.");
        return;
      }

      if (item.quantity <= 0) {
        setError("Item quantity must be greater than zero.");
        return;
      }

      if (item.unitPrice < 0) {
        setError("Item price cannot be negative.");
        return;
      }

      if (item.discount < 0) {
        setError("Item discount cannot be negative.");
        return;
      }

      if (item.taxRate < 0) {
        setError("VAT rate cannot be negative.");
        return;
      }
    }

    try {
      const invoiceNumber = await generateInvoiceNumber();

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

      const newInvoice = {
        id: crypto.randomUUID(),
        invoiceNumber,
        invoiceType,
        customerId,
        referenceInvoiceId: invoiceType === "sales" ? "" : referenceInvoiceId,
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
        paidAmount: 0,
        status: "draft",
        paymentTerms,
        notes: notes.trim(),
        terms: terms.trim(),
        createdAt: new Date().toISOString(),
      };

      await addRecord("invoices", newInvoice);

      window.location.href = "/invoices";
    } catch (saveError) {
      console.error("Failed to save invoice:", saveError);

      setError("Failed to save the invoice. Please try again.");
    }
  };

  return (
    <main className="p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <p className="text-sm font-medium text-slate-400">Sales & Billing</p>

          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            Create Invoice
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Create a sales invoice, credit note, or debit note.
          </p>
        </div>

        <div className="space-y-6">
          <section className="rounded-xl border bg-white p-6">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-slate-900">
                Invoice Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Enter the main information for this transaction.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Invoice Type
                </label>

                <select
                  value={invoiceType}
                  onChange={(event) =>
                    setInvoiceType(event.target.value as InvoiceType)
                  }
                  className="w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-400"
                >
                  <option value="sales">Sales Invoice</option>
                  <option value="credit_note">Credit Note</option>
                  <option value="debit_note">Debit Note</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Customer
                </label>

                <select
                  value={customerId}
                  onChange={(event) => setCustomerId(event.target.value)}
                  className="w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-400"
                >
                  <option value="">Select customer</option>

                  {customers.map((customer) => (
                    <option key={customer.id} value={String(customer.id)}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Currency
                </label>

                <select
                  value={currency}
                  onChange={(event) => setCurrency(event.target.value)}
                  className="w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-400"
                >
                  <option value="ETB">Ethiopian Birr (ETB)</option>
                  <option value="USD">US Dollar (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Issue Date
                </label>

                <input
                  type="date"
                  value={issueDate}
                  onChange={(event) => setIssueDate(event.target.value)}
                  className="w-full rounded-lg border px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Due Date
                </label>

                <input
                  type="date"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                  className="w-full rounded-lg border px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Payment Terms
                </label>

                <select
                  value={paymentTerms}
                  onChange={(event) =>
                    setPaymentTerms(event.target.value as PaymentTerms)
                  }
                  className="w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-400"
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
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Purchase Order Number
                </label>

                <input
                  type="text"
                  value={purchaseOrderNumber}
                  onChange={(event) =>
                    setPurchaseOrderNumber(event.target.value)
                  }
                  placeholder="Optional"
                  className="w-full rounded-lg border px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Reference Number
                </label>

                <input
                  type="text"
                  value={referenceNumber}
                  onChange={(event) => setReferenceNumber(event.target.value)}
                  placeholder="Optional"
                  className="w-full rounded-lg border px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 outline-none focus:border-slate-400"
                />
              </div>

              {(invoiceType === "credit_note" ||
                invoiceType === "debit_note") && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Reference Invoice
                  </label>

                  <select
                    value={referenceInvoiceId}
                    onChange={(event) =>
                      setReferenceInvoiceId(event.target.value)
                    }
                    className="w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-400"
                  >
                    <option value="">Select original invoice</option>

                    {referenceInvoices.map((invoice) => (
                      <option
                        key={String(invoice.id)}
                        value={String(invoice.id)}
                      >
                        {String(invoice.invoiceNumber ?? "")}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </section>

          <section className="rounded-xl border bg-white p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Invoice Items
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Add the products or services being billed.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddItem}
                className="rounded-lg border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                + Add Item
              </button>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="rounded-lg border bg-slate-50 p-4"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-800">
                      Item {index + 1}
                    </h3>

                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-sm font-medium text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Product / Service
                      </label>

                      <select
                        value={item.productId}
                        onChange={(event) =>
                          handleProductChange(item.id, event.target.value)
                        }
                        className="w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-400"
                      >
                        <option value="">Select product</option>

                        {products.map((product) => (
                          <option key={product.id} value={String(product.id)}>
                            {product.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Description
                      </label>

                      <input
                        type="text"
                        value={item.description}
                        onChange={(event) =>
                          handleDescriptionChange(item.id, event.target.value)
                        }
                        className="w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 outline-none focus:border-slate-400"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Unit
                      </label>

                      <input
                        type="text"
                        value={item.unit}
                        onChange={(event) =>
                          handleUnitChange(item.id, event.target.value)
                        }
                        className="w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 outline-none focus:border-slate-400"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Quantity
                      </label>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.quantity}
                        onChange={(event) =>
                          handleQuantityChange(item.id, event.target.value)
                        }
                        className="w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-400"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Unit Price
                      </label>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(event) =>
                          handlePriceChange(item.id, event.target.value)
                        }
                        className="w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-400"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Item Discount
                      </label>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.discount}
                        onChange={(event) =>
                          handleItemDiscountChange(item.id, event.target.value)
                        }
                        className="w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-400"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Item Tax
                      </label>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.taxRate}
                        onChange={(event) =>
                          handleItemTaxRateChange(item.id, event.target.value)
                        }
                        className="w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-400"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Item Total
                      </label>

                      <div className="rounded-lg border bg-white px-3 py-2.5 text-sm font-semibold text-slate-900">
                        {calculateItemTotal(item).toLocaleString()} {currency}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border bg-white p-6">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-slate-900">
                Financial Summary
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Review discounts, taxes, charges, and the final invoice amount.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Overall Discount (%)
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={discount}
                    onChange={(event) => setDiscount(event.target.value)}
                    className="w-full rounded-lg border px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-400"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Withholding Tax (%)
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={withholdingTax}
                    onChange={(event) => setWithholdingTax(event.target.value)}
                    className="w-full rounded-lg border px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-400"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Other Charges
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={otherCharges}
                    onChange={(event) => setOtherCharges(event.target.value)}
                    className="w-full rounded-lg border px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-400"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Rounding Adjustment
                  </label>

                  <input
                    type="number"
                    step="0.01"
                    value={roundingAdjustment}
                    onChange={(event) =>
                      setRoundingAdjustment(event.target.value)
                    }
                    className="w-full rounded-lg border px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-5">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Subtotal</span>

                    <span className="font-medium text-slate-900">
                      {subtotal.toLocaleString()} {currency}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Item Discounts</span>

                    <span className="font-medium text-slate-900">
                      {itemDiscount.toLocaleString()} {currency}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Overall Discount (%)</span>

                    <span className="font-medium text-slate-900">
                      {overallDiscount.toLocaleString()} {currency}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">VAT %</span>

                    <span className="font-medium text-slate-900">
                      {itemTax.toLocaleString()} {currency}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Withholding Tax (%)</span>

                    <span className="font-medium text-slate-900">
                      {withholdingTaxAmount.toLocaleString()} {currency}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Other Charges</span>

                    <span className="font-medium text-slate-900">
                      {otherChargesAmount.toLocaleString()} {currency}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">
                      Rounding Adjustment (ETB)
                    </span>

                    <span className="font-medium text-slate-900">
                      {roundingAmount.toLocaleString()} {currency}
                    </span>
                  </div>

                  <div className="mt-4 border-t pt-4">
                    <div className="flex justify-between gap-4">
                      <span className="text-base font-semibold text-slate-900">
                        Grand Total
                      </span>

                      <span className="text-xl font-bold text-slate-900">
                        {total.toLocaleString()} {currency}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-xl border bg-white p-6">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-slate-900">
                Additional Information
              </h2>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Notes
                </label>

                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={5}
                  placeholder="Additional notes for the customer..."
                  className="w-full rounded-lg border px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Terms & Conditions
                </label>

                <textarea
                  value={terms}
                  onChange={(event) => setTerms(event.target.value)}
                  rows={5}
                  placeholder="Payment terms, delivery terms, or other conditions..."
                  className="w-full rounded-lg border px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 outline-none focus:border-slate-400"
                />
              </div>
            </div>
          </section>

          <section className="rounded-xl border bg-white p-6">
            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <a
                href="/invoices"
                className="rounded-lg border px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </a>

              <button
                type="button"
                onClick={handleSaveInvoice}
                className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
              >
                Save Invoice
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
