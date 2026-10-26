import { useEffect, useState } from "react";

const emptyForm = {
  name: "",
  sku: "",
  description: "",
  category: "",
  price: "",
  quantity: "",
  minimumStock: "",
};

function validateForm(form, isEditing) {
  const errors = {};

  if (!form.name.trim()) errors.name = "Name is required.";
  if (!form.sku.trim()) errors.sku = "SKU is required.";
  if (!form.category.trim()) errors.category = "Category is required.";
  if (form.price === "" || Number(form.price) < 0) errors.price = "Price must be 0 or greater.";
  if (!isEditing && (form.quantity === "" || !Number.isInteger(Number(form.quantity)) || Number(form.quantity) < 0)) {
    errors.quantity = "Quantity must be a non-negative integer.";
  }
  if (form.minimumStock === "" || !Number.isInteger(Number(form.minimumStock)) || Number(form.minimumStock) < 0) {
    errors.minimumStock = "Minimum stock must be a non-negative integer.";
  }

  return errors;
}

export default function ProductModal({ product, saving, onClose, onSubmit }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const isEditing = Boolean(product);

  useEffect(() => {
    setForm(product ? {
      name: product.name,
      sku: product.sku,
      description: product.description || "",
      category: product.category,
      price: String(product.price),
      quantity: String(product.quantity),
      minimumStock: String(product.minimumStock),
    } : emptyForm);
    setErrors({});
  }, [product]);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setErrors((current) => ({ ...current, [event.target.name]: undefined }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateForm(form, isEditing);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const data = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      description: form.description.trim(),
      category: form.category.trim(),
      price: Number(form.price),
      minimumStock: Number(form.minimumStock),
    };

    if (!isEditing) data.quantity = Number(form.quantity);
    onSubmit(data);
  }

  const fields = [
    ["name", "Name", "text"],
    ["sku", "SKU", "text"],
    ["category", "Category", "text"],
    ["price", "Price", "number"],
    ["minimumStock", "Minimum stock", "number"],
  ];

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4" role="dialog" aria-modal="true" aria-labelledby="product-modal-title">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 id="product-modal-title" className="text-xl font-bold text-slate-900">{isEditing ? "Edit product" : "Create product"}</h2>
            <p className="mt-1 text-sm text-slate-500">{isEditing ? "Update product details." : "Add a new product to your catalog."}</p>
          </div>
          <button className="rounded-lg p-2 text-xl text-slate-400 hover:bg-slate-100" onClick={onClose} type="button" aria-label="Close modal">×</button>
        </div>
        <form className="space-y-5 p-6" onSubmit={handleSubmit}>
          <div className="grid gap-5 sm:grid-cols-2">
            {fields.map(([name, label, type]) => (
              <label className="block" key={name}>
                <span className="text-sm font-medium text-slate-700">{label}</span>
                <input
                  className={`mt-2 w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 ${errors[name] ? "border-rose-400" : "border-slate-200"}`}
                  min={type === "number" ? "0" : undefined}
                  name={name}
                  onChange={updateField}
                  step={name === "price" ? "0.01" : "1"}
                  type={type}
                  value={form[name]}
                />
                {errors[name] && <span className="mt-1 block text-xs text-rose-600">{errors[name]}</span>}
              </label>
            ))}
            {!isEditing && (
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Quantity</span>
                <input className={`mt-2 w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 ${errors.quantity ? "border-rose-400" : "border-slate-200"}`} min="0" name="quantity" onChange={updateField} step="1" type="number" value={form.quantity} />
                {errors.quantity && <span className="mt-1 block text-xs text-rose-600">{errors.quantity}</span>}
              </label>
            )}
          </div>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Description</span>
            <textarea className="mt-2 min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" name="description" onChange={updateField} value={form.description} />
          </label>
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50" onClick={onClose} type="button">Cancel</button>
            <button className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60" disabled={saving} type="submit">{saving ? "Saving..." : isEditing ? "Save changes" : "Create product"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
