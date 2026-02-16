import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function Customers() {
  const [customers, setCustomers] = useState([]);

  const empty = {
    customer_id: "",
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    customer_address: "",
  };

  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const data = await api.customers.get();
    setCustomers(data || []);

    const max = (data || []).reduce((m, it) => {
      const n = Number(it.customer_id || 0);
      return Number.isFinite(n) ? Math.max(m, n) : m;
    }, 0);

    const next = max === 0 ? 1 : max + 1;
    setForm((f) => ({ ...f, customer_id: String(next) }));
  }

  function handleChange(k, v) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  async function handleAddOrUpdate() {
    const reserved = editingId ? form.customer_id : String(await api.getNextNumericId("customers"));

    const payload = {
      ...form,
      customer_id: reserved,
      created_date: new Date().toISOString(),
    };

    if (editingId) {
      await api.customers.update(editingId, payload);
      await load();
      setForm(empty);
      setEditingId(null);
    } else {
      await api.customers.add(payload);
      await load();
      setForm(empty);
      setEditingId(null);
    }
  }

  function handleEdit(item) {
    setEditingId(item.id);
    setForm({
      customer_id: item.customer_id,
      customer_name: item.customer_name,
      customer_phone: item.customer_phone,
      customer_email: item.customer_email,
      customer_address: item.customer_address,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleDelete(id) {
    if (!confirm("Delete this customer?")) return;
    api.customers.remove(id).then(load);
  }

  function handleClear() {
    setForm(empty);
    setEditingId(null);
    load();
  }

  return (
    <div
      className="min-h-screen p-6 space-y-6 text-gray-200 bg-cover bg-center"
      style={{ backgroundImage: "url('/cust_back.jpg')" }}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-200 drop-shadow-lg">Customers</h2>
      </div>

      <div className="backdrop-blur-md bg-black/40 border border-gray-700 rounded-xl shadow-xl p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs text-gray-300 mb-1">Customer ID</label>
          <input
            value={form.customer_id}
            readOnly
            className="bg-black/40 border border-gray-700 rounded-md px-3 py-2 text-gray-200 w-full"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-300 mb-1">Customer Name</label>
          <input
            value={form.customer_name}
            onChange={(e) => handleChange("customer_name", e.target.value)}
            placeholder="Customer Name"
            className="bg-black/40 border border-gray-700 rounded-md px-3 py-2 text-gray-200 w-full"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-300 mb-1">Customer Phone</label>
          <input
            value={form.customer_phone}
            onChange={(e) => handleChange("customer_phone", e.target.value)}
            placeholder="Customer Phone"
            className="bg-black/40 border border-gray-700 rounded-md px-3 py-2 text-gray-200 w-full"
          />
        </div>

        <div className="md:col-span-3">
          <label className="block text-xs text-gray-300 mb-1">Customer Email</label>
          <input
            value={form.customer_email}
            onChange={(e) => handleChange("customer_email", e.target.value)}
            placeholder="Customer Email"
            className="bg-black/40 border border-gray-700 rounded-md px-3 py-2 text-gray-200 w-full"
          />
        </div>

        <div className="md:col-span-3">
          <label className="block text-xs text-gray-300 mb-1">Customer Address</label>
          <input
            value={form.customer_address}
            onChange={(e) => handleChange("customer_address", e.target.value)}
            placeholder="Customer Address"
            className="bg-black/40 border border-gray-700 rounded-md px-3 py-2 text-gray-200 w-full"
          />
        </div>

        <div className="md:col-span-3 flex justify-end gap-2">
          <button className="px-4 py-2 rounded-md bg-gray-700 text-gray-200" onClick={handleClear}>
            Clear
          </button>
          <button className="px-4 py-2 rounded-md bg-sky-600 text-white" onClick={handleAddOrUpdate}>
            {editingId ? "Update" : "Add"}
          </button>
        </div>
      </div>

      <div className="backdrop-blur-md bg-black/40 border border-gray-700 rounded-xl shadow-xl overflow-hidden">
        <table className="min-w-full text-gray-300">
          <thead className="bg-black/50 text-gray-400">
            <tr>
              <th className="px-4 py-3">Customer ID</th>
              <th className="px-4 py-3">Customer Name</th>
              <th className="px-4 py-3">Customer Phone</th>
              <th className="px-4 py-3">Customer Email</th>
              <th className="px-4 py-3">Customer Address</th>
              <th className="px-4 py-3">Created Date</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {customers.map((c) => (
              <tr
                key={c.id}
                className="border-t border-gray-700 hover:bg-black/30"
              >
                <td className="px-4 py-3">{c.customer_id}</td>
                <td className="px-4 py-3">{c.customer_name}</td>
                <td className="px-4 py-3">{c.customer_phone}</td>
                <td className="px-4 py-3">{c.customer_email}</td>
                <td className="px-4 py-3">{c.customer_address}</td>
                <td className="px-4 py-3">
                  {c.created_date ? new Date(c.created_date).toLocaleString() : "-"}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleEdit(c)}
                    className="px-3 py-1 rounded-md bg-amber-400 text-black mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="px-3 py-1 rounded-md bg-rose-600 text-white"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {customers.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  No customers
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}