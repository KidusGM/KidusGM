const DB_NAME = "invoice-flow-db";
//const DB_VERSION = 1;
const DB_VERSION = 2;

const STORES = {
  customers: "customers",
  products: "products",
  categories: "categories",
  invoices: "invoices",
  payments: "payments",
  expenses: "expenses",
} as const;

export function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORES.customers)) {
        db.createObjectStore(STORES.customers, {
          keyPath: "id",
        });
      }

      if (!db.objectStoreNames.contains(STORES.products)) {
        db.createObjectStore(STORES.products, {
          keyPath: "id",
        });
      }

      if (!db.objectStoreNames.contains(STORES.categories)) {
        db.createObjectStore(STORES.categories, {
          keyPath: "id",
        });
      }

      if (!db.objectStoreNames.contains(STORES.invoices)) {
        db.createObjectStore(STORES.invoices, {
          keyPath: "id",
        });
      }

      if (!db.objectStoreNames.contains(STORES.payments)) {
        db.createObjectStore(STORES.payments, {
          keyPath: "id",
        });
      }

      if (!db.objectStoreNames.contains(STORES.expenses)) {
        db.createObjectStore(STORES.expenses, {
          keyPath: "id",
        });
      }
    };
  });
}

export function addRecord(
  storeName: string,
  data: Record<string, unknown>,
): Promise<void> {
  return openDatabase().then(
    (db) =>
      new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);

        store.add(data);

        transaction.oncomplete = () => {
          db.close();
          resolve();
        };

        transaction.onerror = () => {
          db.close();
          reject(transaction.error);
        };
      }),
  );
}

export function getRecords(
  storeName: string,
): Promise<Record<string, unknown>[]> {
  return openDatabase().then(
    (db) =>
      new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, "readonly");
        const store = transaction.objectStore(storeName);

        const request = store.getAll();

        request.onsuccess = () => {
          db.close();
          resolve(request.result);
        };

        request.onerror = () => {
          db.close();
          reject(request.error);
        };
      }),
  );
}

export async function getCustomers(): Promise<Record<string, unknown>[]> {
  return getRecords("customers");
}

export function updateRecord(
  storeName: string,
  data: Record<string, unknown>,
): Promise<void> {
  return openDatabase().then(
    (db) =>
      new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);

        store.put(data);

        transaction.oncomplete = () => {
          db.close();
          resolve();
        };

        transaction.onerror = () => {
          db.close();
          reject(transaction.error);
        };
      }),
  );
}

// Delete a record from the specified object store by its ID
export function deleteRecord(storeName: string, id: string): Promise<void> {
  return openDatabase().then(
    (db) =>
      new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);

        store.delete(id);

        transaction.oncomplete = () => {
          db.close();
          resolve();
        };

        transaction.onerror = () => {
          db.close();
          reject(transaction.error);
        };
      }),
  );
}

// created a custome code generator for customers, it will generate a unique code for each customer in the format "CUS-00001", "CUS-00002", etc.
export async function generateCustomerCode(): Promise<string> {
  const customers = await getCustomers();

  let highestNumber = 0;

  for (const customer of customers) {
    const code = String(customer.customerCode ?? "");

    if (code.startsWith("CUS-")) {
      const number = Number(code.replace("CUS-", ""));

      if (!Number.isNaN(number) && number > highestNumber) {
        highestNumber = number;
      }
    }
  }

  return `CUS-${String(highestNumber + 1).padStart(5, "0")}`;
}

//generateItemId() → creates ITM-00001, ITM-00002, etc.

//isDuplicateProduct() → prevents the same product/category combination from being added twice.

export async function getProducts(): Promise<Record<string, unknown>[]> {
  return getRecords("products");
}

export async function generateItemId(): Promise<string> {
  const products = await getProducts();

  let highestNumber = 0;

  for (const product of products) {
    const itemId = String(product.itemId ?? "");

    if (itemId.startsWith("ITM-")) {
      const number = Number(itemId.replace("ITM-", ""));

      if (!Number.isNaN(number) && number > highestNumber) {
        highestNumber = number;
      }
    }
  }

  return `ITM-${String(highestNumber + 1).padStart(5, "0")}`;
}

export async function isDuplicateProduct(
  name: string,
  category: string,
  excludeId?: string,
): Promise<boolean> {
  const products = await getProducts();

  const normalizedName = name.trim().toLowerCase();
  const normalizedCategory = category.trim().toLowerCase();

  return products.some((product) => {
    if (excludeId && String(product.id) === excludeId) {
      return false;
    }

    return (
      String(product.name ?? "")
        .trim()
        .toLowerCase() === normalizedName &&
      String(product.category ?? "")
        .trim()
        .toLowerCase() === normalizedCategory
    );
  });
}

// added Invoice number generation

export async function getInvoices(): Promise<Record<string, unknown>[]> {
  return getRecords("invoices");
}

export async function generateInvoiceNumber(): Promise<string> {
  const invoices = await getInvoices();

  let highestNumber = 0;

  for (const invoice of invoices) {
    const invoiceNumber = String(invoice.invoiceNumber ?? "");

    if (invoiceNumber.startsWith("INV-")) {
      const number = Number(invoiceNumber.replace("INV-", ""));

      if (!Number.isNaN(number) && number > highestNumber) {
        highestNumber = number;
      }
    }
  }

  return `INV-${String(highestNumber + 1).padStart(5, "0")}`;
}

export async function generatePaymentReceiptNumber(): Promise<string> {
  const payments = await getRecords("payments");

  let highestNumber = 0;

  for (const payment of payments) {
    const receiptNumber = String(payment.receiptNumber ?? "");

    if (receiptNumber.startsWith("PAY-")) {
      const number = Number(receiptNumber.replace("PAY-", ""));

      if (!Number.isNaN(number) && number > highestNumber) {
        highestNumber = number;
      }
    }
  }

  return `PAY-${String(highestNumber + 1).padStart(5, "0")}`;
}
