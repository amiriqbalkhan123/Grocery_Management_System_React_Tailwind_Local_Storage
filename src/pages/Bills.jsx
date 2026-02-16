import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function Bills() {
  const [bills, setBills] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const emptyLine = { product_id: "", quantity: 1, unit_price: 0, subtotal: 0 };
  const empty = {
    bill_id: "",
    supplier_id: "",
    user_id: "u1",
    bill_date: "",
    status: "active",
    items: [emptyLine],
    total_amount: 0,
    created_date: "",
  };

  const [form, setForm] = useState(empty);
  const [nextBillNumDisplay, setNextBillNumDisplay] = useState(null);

  useEffect(() => {
    refreshAll();
  }, []);

  function readLocal(name) {
    const raw = localStorage.getItem(`gm:${name}`);
    return raw ? JSON.parse(raw) : [];
  }

  function refreshAll() {
    api.bills.get().then(setBills);
    api.suppliers.get().then(setSuppliers);
    api.products.get().then(setProducts);

    const bs = readLocal("bills");

    const max = (bs || []).reduce((m, it) => {
      const digits = ("" + (it.bill_id || "")).match(/(\d+)$/);
      const n = digits ? Number(digits[0]) : Number(it.bill_id || 0);
      return Number.isFinite(n) ? Math.max(m, n) : m;
    }, 0);

    const next = max === 0 ? 1 : max + 1;
    setNextBillNumDisplay(`${next}`);
    setForm((f) => ({ ...f, bill_id: f.bill_id || `${next}` }));
  }

  function handleChange(k, v) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  function lineChangeWrapper(idx, key, value) {
    setForm((s) => {
      const items = [...s.items];
      items[idx] = { ...items[idx], [key]: value };
      const q = Number(items[idx].quantity || 0);
      const up = Number(items[idx].unit_price || 0);
      items[idx].subtotal = parseFloat((q * up).toFixed(2));
      const total = items.reduce((m, it) => m + Number(it.subtotal || 0), 0);
      return { ...s, items, total_amount: parseFloat(total.toFixed(2)) };
    });
  }

  function addLine() {
    setForm((s) => ({ ...s, items: [...s.items, { ...emptyLine }] }));
  }

  function removeLine(idx) {
    setForm((s) => {
      const items = s.items.filter((_, i) => i !== idx);
      const total = items.reduce((m, it) => m + Number(it.subtotal || 0), 0);
      return { ...s, items, total_amount: parseFloat(total.toFixed(2)) };
    });
  }

  async function handleAddOrUpdate() {
    if (editingId) {
      const payload = {
        ...form,
        bill_id: form.bill_id,
        created_date: new Date().toISOString(),
      };
      payload.items = payload.items.map((ln) => ({
        ...ln,
        quantity: Number(ln.quantity || 0),
        unit_price: Number(ln.unit_price || 0),
        subtotal: Number(ln.subtotal || 0),
      }));
      payload.total_amount = payload.items.reduce(
        (m, it) => m + Number(it.subtotal || 0),
        0
      );

      await api.bills.update(editingId, payload);
      refreshAll();
      setForm(empty);
      setEditingId(null);
    } else {
      const n = await api.getNextNumericId("bills");
      const payload = {
        ...form,
        bill_id: form.bill_id || `BILL${n}`,
        created_date: new Date().toISOString(),
      };
      payload.items = payload.items.map((ln) => ({
        ...ln,
        quantity: Number(ln.quantity || 0),
        unit_price: Number(ln.unit_price || 0),
        subtotal: Number(ln.subtotal || 0),
      }));
      payload.total_amount = payload.items.reduce(
        (m, it) => m + Number(it.subtotal || 0),
        0
      );

      await api.bills.add(payload);
      refreshAll();
      setForm(empty);
    }
  }

  function handleEdit(item) {
    setEditingId(item.id);
    setForm({
      bill_id: item.bill_id,
      supplier_id: item.supplier_id,
      user_id: item.user_id,
      bill_date: item.bill_date,
      status: item.status,
      items: item.items || [{ ...emptyLine }],
      total_amount: item.total_amount || 0,
      created_date: item.created_date,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleDelete(id) {
    if (!confirm("Delete bill?")) return;
    api.bills.remove(id).then(refreshAll);
  }

  function handleClear() {
    setForm(empty);
    setEditingId(null);
    refreshAll();
  }

  return (
    <div
      className="min-h-screen p-6 space-y-6 text-gray-200 bg-cover bg-center"
      style={{ backgroundImage: "url('/bill_back.jpg')" }}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-200 drop-shadow-lg">
          Bills
        </h2>
      </div>

      <div className="backdrop-blur-md bg-black/40 border border-gray-700 rounded-xl shadow-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-gray-300 block mb-1">Bill ID</label>
            <input
              value={form.bill_id || nextBillNumDisplay || ""}
              readOnly
              className="bg-black/40 border border-gray-700 rounded-md px-3 py-2 text-gray-200 w-full"
            />
          </div>

          <div>
            <label className="text-xs text-gray-300 block mb-1">Supplier</label>
            <select
              value={form.supplier_id}
              onChange={(e) => handleChange("supplier_id", e.target.value)}
              className="bg-black/40 border border-gray-700 rounded-md px-3 py-2 text-gray-200 w-full"
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
            <label className="text-xs text-gray-300 block mb-1">User</label>
            <select
              value={form.user_id}
              onChange={(e) => handleChange("user_id", e.target.value)}
              className="bg-black/40 border border-gray-700 rounded-md px-3 py-2 text-gray-200 w-full"
            >
              <option value="u1">Admin</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-300 block mb-1">
              Bill Date
            </label>
            <input
              type="datetime-local"
              value={form.bill_date}
              onChange={(e) => handleChange("bill_date", e.target.value)}
              className="bg-black/40 border border-gray-700 rounded-md px-3 py-2 text-gray-200 w-full"
            />
          </div>

          <div>
            <label className="text-xs text-gray-300 block mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => handleChange("status", e.target.value)}
              className="bg-black/40 border border-gray-700 rounded-md px-3 py-2 text-gray-200 w-full"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex items-end gap-2">
            <button
              onClick={handleClear}
              className="px-4 py-2 rounded-md bg-gray-700 text-gray-200"
            >
              Clear
            </button>

            <button
              onClick={handleAddOrUpdate}
              className="px-4 py-2 rounded-md bg-sky-600 text-white"
            >
              {editingId ? "Update" : "Add"}
            </button>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <h3 className="text-lg font-semibold text-gray-200">Items</h3>

          {form.items.map((line, idx) => (
            <div
              key={idx}
              className="grid grid-cols-12 gap-2 items-center bg-black/30 p-3 rounded-lg border border-gray-700"
            >
              <div className="col-span-5">
                <select
                  value={line.product_id}
                  onChange={(e) => {
                    const pid = e.target.value;
                    const prod = products.find(
                      (p) => p.product_id === pid
                    );
                    lineChangeWrapper(idx, "product_id", pid);
                    if (prod) {
                      lineChangeWrapper(idx, "unit_price", prod.sales_price);
                    }
                  }}
                  className="w-full bg-black/40 border border-gray-700 rounded-md px-3 py-2 text-gray-200"
                >
                  <option value="">Select Product</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.product_id}>
                      {p.product_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <input
                  type="number"
                  value={line.quantity}
                  onChange={(e) =>
                    lineChangeWrapper(idx, "quantity", e.target.value)
                  }
                  className="w-full bg-black/40 border border-gray-700 rounded-md px-3 py-2 text-gray-200"
                />
              </div>

              <div className="col-span-2">
                <input
                  type="number"
                  value={line.unit_price}
                  onChange={(e) =>
                    lineChangeWrapper(idx, "unit_price", e.target.value)
                  }
                  className="w-full bg-black/40 border border-gray-700 rounded-md px-3 py-2 text-gray-200"
                />
              </div>

              <div className="col-span-2 text-right px-3">
                <div className="text-sm text-gray-400">Subtotal</div>
                <div className="font-medium text-gray-200">
                  ${line.subtotal?.toFixed(2) || "0.00"}
                </div>
              </div>

              <div className="col-span-1 text-right">
                <button
                  onClick={() => removeLine(idx)}
                  className="px-3 py-1 rounded-md bg-rose-600 text-white"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          <div className="flex justify-between items-center">
            <button
              onClick={addLine}
              className="px-4 py-2 rounded-md bg-gray-700 text-gray-200"
            >
              Add Another Product
            </button>

            <div className="text-lg font-semibold text-gray-200">
              Total: ${form.total_amount?.toFixed(2) || "0.00"}
            </div>
          </div>
        </div>
      </div>

      <div className="backdrop-blur-md bg-black/40 border border-gray-700 rounded-xl shadow-xl overflow-hidden">
        <table className="min-w-full text-gray-300">
          <thead className="bg-black/50 text-gray-400">
            <tr>
              <th className="px-4 py-3">Bill ID</th>
              <th className="px-4 py-3">Supplier ID</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Created Date</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {bills.map((b) => (
              <tr
                key={b.id}
                className="border-t border-gray-700 hover:bg-black/30"
              >
                <td className="px-4 py-3">{b.bill_id}</td>
                <td className="px-4 py-3">{b.supplier_id}</td>
                <td className="px-4 py-3">{(b.items || []).length}</td>
                <td className="px-4 py-3">
                  ${(b.total_amount || 0).toFixed(2)}
                </td>
                <td className="px-4 py-3">
                  {b.created_date
                    ? new Date(b.created_date).toLocaleString()
                    : "-"}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleEdit(b)}
                    className="px-3 py-1 rounded-md bg-amber-400 text-black mr-2"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(b.id)}
                    className="px-3 py-1 rounded-md bg-rose-600 text-white"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {bills.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-gray-400"
                >
                  No bills
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
