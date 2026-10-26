import { useEffect, useState } from "react";

const initialForm = {
  productId: "",
  type: "IN",
  quantity: "",
  reason: "",
};

function validateForm(form) {
  const errors = {};

  if (!form.productId) errors.productId = "Select a product.";
  if (form.type !== "IN" && form.type !== "OUT") errors.type = "Select a valid movement type.";
  if (!Number.isInteger(Number(form.quantity)) || Number(form.quantity) <= 0) {
    errors.quantity = "Quantity must be a positive integer.";
  }
  if (!form.reason.trim()) errors.reason = "Reason is required.";

  return errors;
}

export default function MovementModal({ error, onClose, onSubmit, products, saving }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setErrors({});
  }, [error]);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setErrors((current) => ({ ...current, [event.target.name]: undefined }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateForm(form);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    onSubmit(form.productId, {
      type: form.type,
      quantity: Number(form.quantity),
      reason: form.reason.trim(),
    });
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4" role="dialog" aria-modal="true" aria-labelledby="movement-modal-title">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 id="movement-modal-title" className="text-xl font-bold text-slate-900">Record stock movement</h2>
            <p className="mt-1 text-sm text-slate-500">Update inventory and keep an audit trail.</p>
          </div>
          <button className="rounded-lg p-2 text-xl text-slate-400 hover:bg-slate-100" onClick={onClose} type="button" aria-label="Close modal">×</button>
        </div>

        <form className="space-y-5 p-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              <p className="font-semibold">{error.message}</p>
              {error.status === 409 && error.availableQuantity !== undefined && (
                <p className="mt-1">
                  Available: {error.availableQuantity}. Requested: {error.requestedQuantity}.
                </p>
              )}
            </div>
          )}

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Product</span>
            <select className={`mt-2 w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 ${errors.productId ? "border-rose-400" : "border-slate-200"}`} name="productId" onChange={updateField} value={form.productId}>
              <option value="">Select a product</option>
              {products.map((product) => <option key={product.id} value={product.id}>{product.name} ({product.sku}) — {product.quantity} in stock</option>)}
            </select>
            {errors.productId && <span className="mt-1 block text-xs text-rose-600">{errors.productId}</span>}
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Movement type</span>
              <select className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" name="type" onChange={updateField} value={form.type}>
                <option value="IN">Stock in</option>
                <option value="OUT">Stock out</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Quantity</span>
              <input className={`mt-2 w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 ${errors.quantity ? "border-rose-400" : "border-slate-200"}`} min="1" name="quantity" onChange={updateField} step="1" type="number" value={form.quantity} />
              {errors.quantity && <span className="mt-1 block text-xs text-rose-600">{errors.quantity}</span>}
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Reason</span>
            <textarea className={`mt-2 min-h-24 w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 ${errors.reason ? "border-rose-400" : "border-slate-200"}`} name="reason" onChange={updateField} placeholder="e.g. Supplier delivery or customer order" value={form.reason} />
            {errors.reason && <span className="mt-1 block text-xs text-rose-600">{errors.reason}</span>}
          </label>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50" onClick={onClose} type="button">Cancel</button>
            <button className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60" disabled={saving} type="submit">{saving ? "Recording..." : "Record movement"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
