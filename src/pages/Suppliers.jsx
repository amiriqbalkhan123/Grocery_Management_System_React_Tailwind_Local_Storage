import React, { useEffect, useState } from "react";
import api from "../services/api";
import bgImage from "/public/supp_back.jpg";

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const empty = {
    supplier_id: "",
    supplier_name: "",
    supplier_phone: "",
    supplier_email: "",
    supplier_address: "",
    created_date: "",
  };
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    const data = await api.suppliers.get();
    setSuppliers(data || []);
    const max = (data || []).reduce((m, it) => {
      const n = Number(it.supplier_id || 0);
      return Number.isFinite(n) ? Math.max(m, n) : m;
    }, 0);
    const next = max === 0 ? 1 : max + 1;
    setForm((f) => ({ ...f, supplier_id: String(next) }));
  }

  function handleChange(k, v) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  async function handleAddOrUpdate() {
    const reserved = editingId ? form.supplier_id : String(await api.getNextNumericId("suppliers"));
    const payload = {
      supplier_id: reserved,
      supplier_name: form.supplier_name,
      supplier_phone: form.supplier_phone,
      supplier_email: form.supplier_email,
      supplier_address: form.supplier_address,
      created_date: new Date().toISOString(),
    };

    if (editingId) {
      await api.suppliers.update(editingId, payload);
      await loadAll();
      setEditingId(null);
      setForm(empty);
    } else {
      await api.suppliers.add(payload);
      await loadAll();
      setForm(empty);
    }
  }

  function handleEdit(item) {
    setEditingId(item.id);
    setForm({
      supplier_id: item.supplier_id,
      supplier_name: item.supplier_name,
      supplier_phone: item.supplier_phone,
      supplier_email: item.supplier_email,
      supplier_address: item.supplier_address,
      created_date: item.created_date || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id) {
    if (!confirm("Delete supplier?")) return;
    await api.suppliers.remove(id);
    await loadAll();
  }

  function handleClear() {
    const max = (suppliers || []).reduce((m, it) => {
      const n = Number(it.supplier_id || 0);
      return Number.isFinite(n) ? Math.max(m, n) : m;
    }, 0);
    const next = max === 0 ? 1 : max + 1;
    setForm({ ...empty, supplier_id: String(next) });
    setEditingId(null);
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
      <h2 className="text-3xl font-bold text-gray-200 drop-shadow-lg">Suppliers</h2>

      <div className="rounded-xl shadow p-6 grid grid-cols-1 md:grid-cols-3 gap-4 border border-gray-700"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.45)",
          backdropFilter: "blur(4px)",
        }}
      >
        <div>
          <label className="text-xs text-gray-300 mb-1 block">Supplier ID</label>
          <input
            readOnly
            value={form.supplier_id}
            className="bg-gray-900/40 border border-gray-700 rounded-md px-3 py-2 text-gray-200 w-full"
          />
        </div>

        <div>
          <label className="text-xs text-gray-300 mb-1 block">Name</label>
          <input
            value={form.supplier_name}
            onChange={(e) => handleChange("supplier_name", e.target.value)}
            placeholder="Supplier name"
            className="bg-gray-900/40 border border-gray-700 rounded-md px-3 py-2 text-gray-200 w-full"
          />
        </div>

        <div>
          <label className="text-xs text-gray-300 mb-1 block">Phone</label>
          <input
            value={form.supplier_phone}
            onChange={(e) => handleChange("supplier_phone", e.target.value)}
            placeholder="Phone"
            className="bg-gray-900/40 border border-gray-700 rounded-md px-3 py-2 text-gray-200 w-full"
          />
        </div>

        <div>
          <label className="text-xs text-gray-300 mb-1 block">Email</label>
          <input
            value={form.supplier_email}
            onChange={(e) => handleChange("supplier_email", e.target.value)}
            placeholder="Email"
            className="bg-gray-900/40 border border-gray-700 rounded-md px-3 py-2 text-gray-200 w-full"
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-xs text-gray-300 mb-1 block">Address</label>
          <input
            value={form.supplier_address}
            onChange={(e) => handleChange("supplier_address", e.target.value)}
            placeholder="Address"
            className="bg-gray-900/40 border border-gray-700 rounded-md px-3 py-2 text-gray-200 w-full"
          />
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
              <th className="px-4 py-3 text-left">Supplier ID</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Phone</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Address</th>
              <th className="px-4 py-3 text-left">Created</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {suppliers.map((s) => (
              <tr key={s.id} className="border-t border-gray-700 hover:bg-gray-900/40">
                <td className="px-4 py-3">{s.supplier_id}</td>
                <td className="px-4 py-3">{s.supplier_name}</td>
                <td className="px-4 py-3">{s.supplier_phone}</td>
                <td className="px-4 py-3">{s.supplier_email}</td>
                <td className="px-4 py-3">{s.supplier_address}</td>
                <td className="px-4 py-3">
                  {s.created_date ? new Date(s.created_date).toLocaleString() : "-"}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleEdit(s)}
                    className="px-3 py-1 rounded-md bg-amber-400 text-black mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="px-3 py-1 rounded-md bg-rose-500 text-white"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {suppliers.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  No suppliers
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
