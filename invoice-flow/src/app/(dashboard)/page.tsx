import DatabaseTest from "../../components/storage/DatabaseTest";
export default function Home() {
  return (
    <div>
      <header className="border-b bg-white px-6 py-5">
        <h2 className="text-2xl font-bold text-slate-900">
          Dashboard
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Overview of your invoices, payments, and business activity.
        </p>
      </header>

      <div className="p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-slate-500">Total Sales</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              ETB 0.00
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-slate-500">Paid</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              ETB 0.00
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-slate-500">Outstanding</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              ETB 0.00
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-slate-500">Invoices</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              0
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-xl border bg-white p-8">
          <h3 className="text-lg font-semibold text-slate-900">
            Welcome to InvoiceFlow
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Start by adding your customers, products, and invoices.
          </p>
        </div>
        <DatabaseTest />
      </div>
    </div>
  );
}