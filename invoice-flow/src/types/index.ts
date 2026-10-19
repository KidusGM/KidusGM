export type CustomerType = "individual" | "company";

export type Customer = {
  id: string;
  customerCode: string;
  customerType: CustomerType;
  name: string;
  tin: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  contactPerson: string;
  contactPhone: string;
  notes: string;
  createdAt: string;
};

export type Product = {
  id: string;
  itemId: string;
  name: string;
  categoryId: string;
  unit: string;
  description: string;
  price: number;
  createdAt: string;
};

export type Category = {
  id: string;
  name: string;
  createdAt: string;
};

export type InvoiceType = "sales" | "credit_note" | "debit_note";

export type InvoiceStatus =
  | "draft"
  | "submitted"
  | "pending_approval"
  | "approved"
  | "issued"
  | "unpaid"
  | "partial"
  | "paid"
  | "overdue"
  | "rejected"
  | "cancelled";

export type PaymentTerms =
  | "due_on_receipt"
  | "7_days"
  | "15_days"
  | "30_days"
  | "60_days"
  | "custom";

export type InvoiceItem = {
  id: string;
  productId: string;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  total: number;
};

export type Invoice = {
  id: string;
  invoiceNumber: string;
  invoiceType: InvoiceType;

  customerId: string;
  referenceInvoiceId: string;

  issueDate: string;
  dueDate: string;

  currency: string;

  purchaseOrderNumber: string;
  referenceNumber: string;

  items: InvoiceItem[];

  subtotal: number;
  discount: number;
  tax: number;
  withholdingTax: number;
  otherCharges: number;
  roundingAdjustment: number;
  total: number;

  paidAmount: number;

  status: InvoiceStatus;
  paymentTerms: PaymentTerms;

  notes: string;
  terms: string;

  createdAt: string;
};

export type Payment = {
  id: string;
  receiptNumber: string;
  invoiceId: string;
  amount: number;
  paymentDate: string;
  method: "cash" | "bank" | "mobile" | "other";
  notes: string;
  createdAt: string;
};

export type Expense = {
  id: string;
  description: string;
  amount: number;
  category: string;
  expenseDate: string;
  notes: string;
  createdAt: string;
};
