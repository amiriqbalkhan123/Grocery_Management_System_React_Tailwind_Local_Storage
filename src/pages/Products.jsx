import React, { useEffect, useState } from "react";
import api from "../services/api";
import bgImage from "/public/prod_back.jpg";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const emptyForm = {
    product_id: "",
    product_name: "",
    category_id: "",
    sales_price: "",
    supplier_id: "",
    current_stock: 0,
    is_active: true,
  };

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    refreshAll();
  }, []);

  async function refreshAll() {
    const p = await api.products.get();
    const c = await api.categories.get();
    const s = await api.suppliers.get();

    setProducts(p || []);
    setCategories(c || []);
    setSuppliers(s || []);

    const max = (p || []).reduce((m, it) => {
      const n = Number(it.product_id || 0);
      return Number.isFinite(n) ? Math.max(m, n) : m;
    }, 0);

    const next = max === 0 ? 1 : max + 1;
    setForm((f) => ({ ...f, product_id: f.product_id ? f.product_id : String(next) }));
  }

  function handleChange(k, v) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  async function handleAddOrUpdate() {
    const payload = {
      ...form,
      product_id: form.product_id,
      sales_price: Number(form.sales_price || 0),
      current_stock: Number(form.current_stock || 0),
      is_active: !!form.is_active,
      created_date: new Date().toISOString(),
    };

    if (editingId) {
      await api.products.update(editingId, payload);
      await refreshAll();
      setForm(emptyForm);
      setEditingId(null);
    } else {
      await api.products.add(payload);
      await refreshAll();
      setForm(emptyForm);
    }
  }

  function handleEdit(item) {
    setEditingId(item.id);
    setForm({
      product_id: item.product_id,
      product_name: item.product_name,
      category_id: item.category_id,
      sales_price: item.sales_price,
      supplier_id: item.supplier_id,
      current_stock: item.current_stock,
      is_active: item.is_active,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id) {
    if (!confirm("Delete product?")) return;
    await api.products.remove(id);
    await refreshAll();
  }

  function handleClear() {
    setForm(emptyForm);
    setEditingId(null);
    refreshAll();
  }

  return (
    <div
      className="p-6 space-y-6 text-gray-200 min-h-screen"
      style={{
        backgroundImage: `url(${bgImage})`,   
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <h2 className="text-3xl font-bold text-gray-200 drop-shadow-lg">Products</h2>

      <div
        className="rounded-xl shadow p-6 grid grid-cols-1 md:grid-cols-3 gap-4 border border-gray-700"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.45)",
          backdropFilter: "blur(4px)",
        }}
      >
        <div>
          <label className="text-xs text-gray-300 mb-1 block">Product ID</label>
          <input
            readOnly
            value={form.product_id}
            className="bg-gray-900/40 border border-gray-700 rounded-md px-3 py-2 text-gray-200 w-full"
          />
        </div>

        <div>
          <label className="text-xs text-gray-300 mb-1 block">Product Name</label>
          <input
            value={form.product_name}
            onChange={(e) => handleChange("product_name", e.target.value)}
            placeholder="Product Name"
            className="bg-gray-900/40 border border-gray-700 rounded-md px-3 py-2 text-gray-200 w-full"
          />
        </div>

        <div>
          <label className="text-xs text-gray-300 mb-1 block">Category</label>
          <select
            value={form.category_id}
            onChange={(e) => handleChange("category_id", e.target.value)}
            className="bg-gray-900/40 border border-gray-700 rounded-md px-3 py-2 text-gray-200 w-full"
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.category_id}>
                {c.category_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-300 mb-1 block">Sales Price</label>
          <input
            value={form.sales_price}
            onChange={(e) => handleChange("sales_price", e.target.value)}
            placeholder="Sales Price"
            type="number"
            className="bg-gray-900/40 border border-gray-700 rounded-md px-3 py-2 text-gray-200 w-full"
          />
        </div>

        <div>
          <label className="text-xs text-gray-300 mb-1 block">Supplier</label>
          <select
            value={form.supplier_id}
            onChange={(e) => handleChange("supplier_id", e.target.value)}
            className="bg-gray-900/40 border border-gray-700 rounded-md px-3 py-2 text-gray-200 w-full"
          >
            <option value="">Select Supplier</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.supplier_id}>
                {s.supplier_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-300 mb-1 block">Current Stock</label>
          <input
            value={form.current_stock}
            onChange={(e) => handleChange("current_stock", e.target.value)}
            type="number"
            placeholder="Stock"
            className="bg-gray-900/40 border border-gray-700 rounded-md px-3 py-2 text-gray-200 w-full"
          />
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-gray-200">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => handleChange("is_active", e.target.checked)}
            />
            Active
          </label>
        </div>

        <div className="md:col-span-3 flex justify-end gap-2 pt-2">
          <button onClick={handleClear} className="px-4 py-2 rounded-md bg-gray-700 text-gray-200">
            Clear
          </button>
          <button onClick={handleAddOrUpdate} className="px-4 py-2 rounded-md bg-sky-600 text-white">
            {editingId ? "Update" : "Add"}
          </button>
        </div>
      </div>

      
      <div
        className="rounded-xl shadow overflow-hidden border border-gray-700"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.45)",
          backdropFilter: "blur(4px)",
        }}
      >
        <table className="min-w-full text-gray-300">
          <thead className="bg-gray-900/40 text-gray-300">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">Price</th>
              <th className="px-4 py-3 text-left">Supplier</th>
              <th className="px-4 py-3 text-left">Stock</th>
              <th className="px-4 py-3 text-left">Active</th>
              <th className="px-4 py-3 text-left">Created</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-gray-700 hover:bg-gray-900/40">
                <td className="px-4 py-3">{p.product_id}</td>
                <td className="px-4 py-3">{p.product_name}</td>
                <td className="px-4 py-3">
                  {categories.find((c) => c.category_id === p.category_id)?.category_name || "-"}
                </td>
                <td className="px-4 py-3">${p.sales_price}</td>
                <td className="px-4 py-3">
                  {suppliers.find((s) => s.supplier_id === p.supplier_id)?.supplier_name || "-"}
                </td>
                <td className="px-4 py-3">{p.current_stock}</td>
                <td className="px-4 py-3">{p.is_active ? "Yes" : "No"}</td>
                <td className="px-4 py-3">
                  {p.created_date ? new Date(p.created_date).toLocaleString() : "-"}
                </td>

                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleEdit(p)}
                    className="px-3 py-1 rounded-md bg-amber-400 text-black mr-2"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(p.id)}
                    className="px-3 py-1 rounded-md bg-rose-500 text-white"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {products.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-400">
                  No products
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
