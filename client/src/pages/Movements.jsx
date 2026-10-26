import { useEffect, useState } from "react";
import MovementModal from "../components/MovementModal.jsx";
import { createMovement, getMovements, getProducts } from "../services/api.js";

function MovementType({ type }) {
  const incoming = type === "IN";
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${incoming ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
      {incoming ? "+" : "-"}{type}
    </span>
  );
}

export default function Movements({ onMovementRecorded }) {
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({ productId: "", type: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalError, setModalError] = useState(null);
  const [notice, setNotice] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  async function loadMovements() {
    setLoading(true);
    setError(null);
    try {
      const data = await getMovements(filters);
      setMovements(Array.isArray(data) ? data : []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadProducts() {
    try {
      const data = await getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    loadMovements();
  }, [filters.productId, filters.type]);

  function updateFilter(event) {
    setFilters((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function saveMovement(productId, movementData) {
    setSaving(true);
    setModalError(null);
    try {
      await createMovement(productId, movementData);
      setModalOpen(false);
      setNotice("Stock movement recorded successfully.");
      await Promise.all([loadMovements(), loadProducts()]);
      onMovementRecorded();
    } catch (requestError) {
      setModalError(requestError);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-brand-600">Inventory</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Movements</h1>
          <p className="mt-2 text-slate-500">Track every addition and removal from your inventory.</p>
        </div>
        <button className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700" onClick={() => { setModalError(null); setModalOpen(true); }}>+ Record movement</button>
      </div>

      {notice && <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"><span>{notice}</span><button onClick={() => setNotice("")} type="button">×</button></div>}
      {error && <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"><span>{error}</span><button onClick={() => setError(null)} type="button">×</button></div>}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <select className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-600 outline-none focus:border-brand-500" name="productId" onChange={updateFilter} value={filters.productId}>
            <option value="">All products</option>
            {products?.map((product) => <option key={product.id} value={product.id}>{product.name} ({product.sku})</option>)}
          </select>
          <select className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-600 outline-none focus:border-brand-500" name="type" onChange={updateFilter} value={filters.type}>
            <option value="">All movement types</option>
            <option value="IN">Stock in</option>
            <option value="OUT">Stock out</option>
          </select>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
        {loading ? (
          <div className="space-y-3 p-6">{[1, 2, 3, 4].map((item) => <div className="h-14 animate-pulse rounded-lg bg-slate-100" key={item} />)}</div>
        ) : movements?.length === 0 ? (
          <div className="px-6 py-20 text-center"><p className="font-semibold text-slate-700">No movements found</p><p className="mt-1 text-sm text-slate-500">Record a stock addition or removal to see it here.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500"><tr>{["Date", "Product", "Type", "Quantity", "Reason"].map((heading) => <th className="px-6 py-4 font-semibold" key={heading}>{heading}</th>)}</tr></thead>
              <tbody className="divide-y divide-slate-100">
                {movements?.map((movement) => <tr className="text-slate-600" key={movement.id}>
                  <td className="whitespace-nowrap px-6 py-4">{new Date(movement.createdAt).toLocaleString()}</td>
                  <td className="px-6 py-4"><p className="font-semibold text-slate-800">{movement.productName}</p><p className="mt-1 text-xs text-slate-400">{movement.sku}</p></td>
                  <td className="px-6 py-4"><MovementType type={movement.type} /></td>
                  <td className="px-6 py-4 font-semibold">{movement.quantity}</td>
                  <td className="px-6 py-4">{movement.reason}</td>
                </tr>)}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {modalOpen && <MovementModal error={modalError} onClose={() => { setModalOpen(false); setModalError(null); }} onSubmit={saveMovement} products={products ?? []} saving={saving} />}
    </div>
  );
}
