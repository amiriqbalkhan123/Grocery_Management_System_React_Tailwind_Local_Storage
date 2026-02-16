import React, { useState, useEffect } from "react";

export default function EntityForm({ initial, fields, onCancel, onSave }) {
  const [state, setState] = useState(initial || {});

  useEffect(() => setState(initial || {}), [initial]);

  function change(k, v) {
    setState(s => ({ ...s, [k]: v }));
  }

  return (
    <div className="bg-[#1A1D29] rounded-xl shadow-xl p-6 text-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map(f => (
          <div key={f.key}>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              {f.label}
            </label>

            {f.type === "textarea" ? (
              <textarea
                value={state[f.key] || ""}
                onChange={e => change(f.key, e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-gray-100"
              />
            ) : (
              <input
                value={state[f.key] || ""}
                onChange={e => change(f.key, e.target.value)}
                type={f.type || "text"}
                readOnly={f.readOnly || false}   // We will lock the ID using readOnly
                className={`w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-gray-100 
                  ${f.readOnly ? "opacity-60 cursor-not-allowed" : ""}`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2 justify-end">
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          onClick={() => onSave(state)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500"
        >
          Save
        </button>
      </div>
    </div>
  );
}
