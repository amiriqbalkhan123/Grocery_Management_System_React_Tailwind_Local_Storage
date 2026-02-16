import React from "react";

export default function EntityList({ items, columns, onEdit, onDelete, onCreate }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={onCreate}
          className="px-3 py-2 rounded-md bg-sky-600 text-white hover:opacity-95"
        >
          + New
        </button>
      </div>

      <div className="bg-gray-800 rounded-xl shadow overflow-hidden">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-900 text-gray-400">
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  className="px-4 py-3 text-left text-sm font-semibold"
                >
                  {c.title}
                </th>
              ))}
              <th className="px-4 py-3 text-right text-sm font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody>
            {items.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  No records
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr
                  key={item.id}
                  className="border-t border-gray-700 hover:bg-gray-900"
                >
                  {columns.map((c) => (
                    <td key={c.key} className="px-4 py-3 text-sm text-gray-200">
                      {c.render ? c.render(item) : item[c.key]}
                    </td>
                  ))}

                  <td className="px-4 py-3 text-sm text-right">
                    <button
                      onClick={() => onEdit(item)}
                      className="px-3 py-1 rounded-md bg-amber-400 text-gray-900 mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(item)}
                      className="px-3 py-1 rounded-md bg-rose-600 text-white"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
