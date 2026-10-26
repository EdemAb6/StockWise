import { useEffect, useState } from "react";
import { getDashboardStats } from "../services/api.js";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function MetricCard({ label, value, caption, icon, tone }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
        </div>
        <div className={`grid h-11 w-11 place-items-center rounded-xl ${tone}`}>{icon}</div>
      </div>
      <p className="mt-5 text-xs text-slate-400">{caption}</p>
    </div>
  );
}

function MovementType({ type }) {
  const isIncoming = type === "IN";
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${isIncoming ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
      {isIncoming ? "+" : "-"}{type}
    </span>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    getDashboardStats()
      .then((data) => {
        if (active) setStats(data);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      });

    return () => {
      active = false;
    };
  }, []);

  if (error) {
    return (
      <section className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center">
        <h1 className="text-lg font-semibold text-rose-900">Unable to load dashboard</h1>
        <p className="mt-2 text-sm text-rose-700">{error}</p>
      </section>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-8" aria-busy="true">
        <div className="h-12 w-64 animate-pulse rounded-lg bg-slate-200" />
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((item) => <div className="h-40 animate-pulse rounded-2xl bg-slate-200" key={item} />)}
        </div>
        <div className="h-72 animate-pulse rounded-2xl bg-slate-200" />
      </div>
    );
  }

  const movements = stats.recentMovements || [];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-brand-600">Overview</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Good morning, Admin</h1>
        <p className="mt-2 text-slate-500">Here&apos;s what&apos;s happening with your inventory today.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard label="Total Products" value={stats.totalProducts} caption="Active products in catalog" tone="bg-blue-50" icon={<span className="text-xl text-blue-600">▦</span>} />
        <MetricCard label="Inventory Value" value={currencyFormatter.format(stats.totalInventoryValue)} caption="Current stock valuation" tone="bg-violet-50" icon={<span className="text-xl text-violet-600">$</span>} />
        <MetricCard label="Low Stock Alerts" value={stats.lowStockProducts} caption="Products needing attention" tone="bg-amber-50" icon={<span className="text-xl text-amber-600">!</span>} />
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
          <div>
            <h2 className="font-semibold text-slate-900">Recent movements</h2>
            <p className="mt-1 text-sm text-slate-500">The latest changes to your inventory.</p>
          </div>
          <a className="text-sm font-semibold text-brand-600 hover:text-brand-700" href="/movements">View all</a>
        </div>
        {movements.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="font-medium text-slate-700">No inventory movements yet</p>
            <p className="mt-1 text-sm text-slate-500">Movement activity will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Product</th>
                  <th className="px-6 py-4 font-semibold">Type</th>
                  <th className="px-6 py-4 font-semibold">Quantity</th>
                  <th className="px-6 py-4 font-semibold">Reason</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {movements.map((movement) => (
                  <tr className="text-slate-600" key={movement.id}>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800">{movement.productName}</p>
                      <p className="mt-1 text-xs text-slate-400">{movement.sku}</p>
                    </td>
                    <td className="px-6 py-4"><MovementType type={movement.type} /></td>
                    <td className="px-6 py-4 font-medium">{movement.quantity}</td>
                    <td className="px-6 py-4">{movement.reason}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(movement.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
