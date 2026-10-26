import { useEffect, useMemo, useState } from "react";
import ProductModal from "../components/ProductModal.jsx";
import { createProduct, deleteProduct, getProducts, updateProduct } from "../services/api.js";

const currencyFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export default function Products() {
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({ search: "", category: "", stockStatus: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const categories = useMemo(
    () => [...new Set(products?.map((product) => product.category) || [])].sort(),
    [products],
  );

  async function loadProducts() {
    setLoading(true);
    setError("");
    try {
      const data = await getProducts(filters);
      setProducts(Array.isArray(data) ? data : []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(loadProducts, 250);
    return () => clearTimeout(timer);
  }, [filters.search, filters.category, filters.stockStatus]);

  function updateFilter(event) {
    setFilters((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function saveProduct(data) {
    setSaving(true);
    setError("");
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, data);
        setNotice("Product updated successfully.");
      } else {
        await createProduct(data);
        setNotice("Product created successfully.");
      }
      setModalOpen(false);
      setEditingProduct(null);
      await loadProducts();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function removeProduct(product) {
    if (!window.confirm(`Delete "${product.name}"? This will also remove its movement history.`)) return;
    try {
      await deleteProduct(product.id);
      setNotice("Product deleted successfully.");
      await loadProducts();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-brand-600">Catalog</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Products</h1>
          <p className="mt-2 text-slate-500">Manage your catalog and monitor stock levels.</p>
        </div>
        <button className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700" onClick={() => { setEditingProduct(null); setModalOpen(true); }}>+ Create product</button>
      </div>

      {notice && <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"><span>{notice}</span><button onClick={() => setNotice("")} type="button">×</button></div>}
      {error && <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"><span>{error}</span><button onClick={() => setError("")} type="button">×</button></div>}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row">
          <input className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" name="search" onChange={updateFilter} placeholder="Search by name or SKU..." value={filters.search} />
          <select className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-600 outline-none focus:border-brand-500" name="category" onChange={updateFilter} value={filters.category}>
            <option value="">All categories</option>
            {categories?.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
          <select className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-600 outline-none focus:border-brand-500" name="stockStatus" onChange={updateFilter} value={filters.stockStatus}>
            <option value="">All stock levels</option>
            <option value="low">Low stock</option>
            <option value="normal">Normal stock</option>
          </select>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
        {loading ? (
          <div className="space-y-3 p-6">{[1, 2, 3, 4].map((item) => <div className="h-14 animate-pulse rounded-lg bg-slate-100" key={item} />)}</div>
        ) : products?.length === 0 ? (
          <div className="px-6 py-20 text-center"><p className="font-semibold text-slate-700">No products found</p><p className="mt-1 text-sm text-slate-500">Try changing your filters or create a new product.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500"><tr>{["Product", "SKU", "Category", "Price", "Quantity", "Minimum", "Status", "Actions"].map((heading) => <th className="px-5 py-4 font-semibold" key={heading}>{heading}</th>)}</tr></thead>
              <tbody className="divide-y divide-slate-100">
                {products?.map((product) => {
                  const lowStock = product.quantity <= product.minimumStock;
                  return <tr className="text-slate-600" key={product.id}>
                    <td className="px-5 py-4"><p className="font-semibold text-slate-800">{product.name}</p><p className="mt-1 max-w-xs truncate text-xs text-slate-400">{product.description || "No description"}</p></td>
                    <td className="px-5 py-4 font-mono text-xs">{product.sku}</td>
                    <td className="px-5 py-4">{product.category}</td>
                    <td className="px-5 py-4">{currencyFormatter.format(product.price)}</td>
                    <td className="px-5 py-4 font-semibold">{product.quantity}</td>
                    <td className="px-5 py-4">{product.minimumStock}</td>
                    <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${lowStock ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>{lowStock ? "Low stock" : "Normal"}</span></td>
                    <td className="px-5 py-4"><div className="flex gap-2"><button className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-brand-600 hover:bg-brand-50" onClick={() => { setEditingProduct(product); setModalOpen(true); }}>Edit</button><button className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50" onClick={() => removeProduct(product)}>Delete</button></div></td>
                  </tr>;
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
      {modalOpen && <ProductModal onClose={() => { setModalOpen(false); setEditingProduct(null); }} onSubmit={saveProduct} product={editingProduct} saving={saving} />}
    </div>
  );
}
