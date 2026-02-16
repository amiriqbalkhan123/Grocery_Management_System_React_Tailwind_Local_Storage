import React, { useEffect, useState } from "react";
import api from "../services/api";
import bgImage from "/public/cat_back.jpg"; 

const UNITS = ["Piece", "Kg", "g", "L", "Box", "mL", "Galoons", "Packs", "m", "cm", "mm", "inch", "lbs"];

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const empty = {
    category_id: "",
    category_name: "",
    description: "",
    unit_of_measure: UNITS[0],
  };
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const data = await api.categories.get();
    setCategories(data || []);

    const max = (data || []).reduce((m, it) => {
      const n = Number(it.category_id || 0);
      return Number.isFinite(n) ? Math.max(m, n) : m;
    }, 0);

    const next = max === 0 ? 1 : max + 1;
    setForm((f) => ({ ...f, category_id: String(next) }));
  }

  function handleChange(k, v) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  async function handleAddOrUpdate() {
    const payload = {
      ...form,
      category_id: editingId ? form.category_id : String(await api.getNextNumericId("categories")),
      created_date: new Date().toISOString(),
    };

    if (editingId) {
      await api.categories.update(editingId, payload);
      await load();
      setForm(empty);
      setEditingId(null);
    } else {
      await api.categories.add(payload);
      await load();
      setForm(empty);
      setEditingId(null);
    }
  }

  function handleEdit(item) {
    setEditingId(item.id);
    setForm({
      category_id: item.category_id,
      category_name: item.category_name,
      description: item.description,
      unit_of_measure: item.unit_of_measure || UNITS[0],
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleDelete(id) {
    if (!confirm("Delete category?")) return;
    api.categories.remove(id).then(load);
  }

  function handleClear() {
    setForm(empty);
    setEditingId(null);
    load();
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
      <h2 className="text-3xl font-bold text-gray-200 drop-shadow-lg">Categories</h2>


      <div
        className="rounded-xl shadow p-6 grid grid-cols-1 md:grid-cols-3 gap-4 border border-gray-700"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.45)",
          backdropFilter: "blur(4px)",
        }}
      >
        <div>
          <label className="text-xs text-gray-300 mb-1 block">Category ID</label>
          <input
            readOnly
            value={form.category_id}
            className="bg-gray-900/40 border border-gray-700 rounded-md px-3 py-2 text-gray-200 w-full"
          />
        </div>

        <div>
          <label className="text-xs text-gray-300 mb-1 block">Category Name</label>
          <input
            value={form.category_name}
            onChange={(e) => handleChange("category_name", e.target.value)}
            placeholder="Category name"
            className="bg-gray-900/40 border border-gray-700 rounded-md px-3 py-2 text-gray-200 w-full"
          />
        </div>

        <div>
          <label className="text-xs text-gray-300 mb-1 block">Unit / Measure</label>
          <select
            value={form.unit_of_measure}
            onChange={(e) => handleChange("unit_of_measure", e.target.value)}
            className="bg-gray-900/40 border border-gray-700 rounded-md px-3 py-2 text-gray-200 w-full"
          >
            {UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-3">
          <label className="text-xs text-gray-300 mb-1 block">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Description"
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
              <th className="px-4 py-3 text-left">Category ID</th>
              <th className="px-4 py-3 text-left">Category Name</th>
              <th className="px-4 py-3 text-left">Description</th>
              <th className="px-4 py-3 text-left">Unit/Measure</th>
              <th className="px-4 py-3 text-left">Created</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-t border-gray-700 hover:bg-gray-900/40">
                <td className="px-4 py-3">{c.category_id}</td>
                <td className="px-4 py-3">{c.category_name}</td>
                <td className="px-4 py-3">{c.description}</td>
                <td className="px-4 py-3">{c.unit_of_measure}</td>
                <td className="px-4 py-3">{c.created_date ? new Date(c.created_date).toLocaleString() : "-"}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleEdit(c)}
                    className="px-3 py-1 rounded-md bg-amber-400 text-black mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="px-3 py-1 rounded-md bg-rose-500 text-white"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {categories.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  No categories
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
