
const PREFIX = "gm:";
const KEY = (name) => `${PREFIX}${name}`;
const COUNTER_KEY = (name) => `${PREFIX}counter:${name}`;

function read(name) {
  const raw = localStorage.getItem(KEY(name));
  return raw ? JSON.parse(raw) : [];
}
function write(name, arr) {
  localStorage.setItem(KEY(name), JSON.stringify(arr));
}

function getCounter(kind) {
  const v = localStorage.getItem(COUNTER_KEY(kind));
  return v ? Number(v) : 0;
}
function setCounter(kind, val) {
  localStorage.setItem(COUNTER_KEY(kind), String(val));
}
function incCounter(kind) {
  const cur = getCounter(kind);
  const next = cur + 1;
  // allow large counters for invoices/bills; only earlier UI had 1000 limit
  setCounter(kind, next);
  return next;
}

// initialize containers if missing
function ensure(name, defaults = []) {
  const cur = read(name);
  if (!cur || cur.length === 0) {
    write(name, defaults);
    return defaults;
  }
  return cur;
}

function makeId() {
  return `id_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

function makeEntity(name) {
  return {
    get: () => Promise.resolve(read(name)),
    add: (payload) =>
      new Promise((res) => {
        const arr = read(name);
        const item = { ...payload, id: payload.id || makeId() };
        arr.push(item);
        write(name, arr);
        res(item);
      }),
    update: (id, payload) =>
      new Promise((res) => {
        const arr = read(name);
        const idx = arr.findIndex((i) => i.id === id);
        if (idx === -1) return res(null);
        arr[idx] = { ...arr[idx], ...payload };
        write(name, arr);
        res(arr[idx]);
      }),
    remove: (id) =>
      new Promise((res) => {
        let arr = read(name);
        arr = arr.filter((i) => i.id !== id);
        write(name, arr);
        res(true);
      }),
  };
}

// Stock helpers
function findProductIndex(products, product_id) {
  return products.findIndex((p) => p.product_id === product_id);
}

function applyProductStockChange(product_id, qtyDelta) {
  const products = read("products");
  const idx = findProductIndex(products, product_id);
  if (idx === -1) return;
  const cur = Number(products[idx].current_stock || 0);
  let next = cur + Number(qtyDelta || 0);
  if (next < 0) next = 0;
  products[idx].current_stock = next;
  write("products", products);
}

// process invoice add (decrease stock)
function processInvoiceAndSave(invoice) {
  const products = read("products");
  (invoice.items || []).forEach((line) => {
    const idx = findProductIndex(products, line.product_id);
    if (idx === -1) return;
    const qty = Number(line.quantity) || 0;
    products[idx].current_stock = Number(products[idx].current_stock || 0) - qty;
    if (products[idx].current_stock < 0) products[idx].current_stock = 0;
  });
  write("products", products);

  const invoices = read("invoices");
  const item = { ...invoice, id: invoice.id || makeId() };
  invoices.push(item);
  write("invoices", invoices);
  return Promise.resolve(item);
}

// process bill add (increase stock)
function processBillAndSave(bill) {
  const products = read("products");
  (bill.items || []).forEach((line) => {
    const idx = findProductIndex(products, line.product_id);
    if (idx === -1) return;
    const qty = Number(line.quantity) || 0;
    products[idx].current_stock = Number(products[idx].current_stock || 0) + qty;
  });
  write("products", products);

  const bills = read("bills");
  const item = { ...bill, id: bill.id || makeId() };
  bills.push(item);
  write("bills", bills);
  return Promise.resolve(item);
}

// initialize simple defaults (safe if already present)
ensure("categories", []);
ensure("suppliers", []);
ensure("customers", []);
ensure("products", []);
ensure("invoices", []);
ensure("bills", []);

// Public API
const api = {
  // numeric id management for several kinds
  // kind can be 'customers' | 'suppliers' | 'categories' | 'invoices' | 'bills'
  getNextNumericId(kind) {
    if (!["customers", "suppliers", "categories", "invoices", "bills"].includes(kind)) {
      throw new Error("Invalid counter kind");
    }
    // if counter not set, try to initialize from existing max
    let cur = getCounter(kind);
    if (cur === 0) {
      const arr = read(kind);
      // determine field name used in the records (e.g. customer_id, invoice_id)
      let field;
      if (kind === "invoices") field = "invoice_id";
      else if (kind === "bills") field = "bill_id";
      else field = kind.slice(0, -1) + "_id"; // e.g. customer_id
      const max = arr.reduce((m, it) => {
        const raw = it[field] || "";
        // extract trailing digits if prefixed like INV123 or BILL45
        const digits = ("" + raw).match(/(\d+)$/);
        const n = digits ? Number(digits[0]) : Number(raw);
        return Number.isFinite(n) ? Math.max(m, n) : m;
      }, 0);
      if (max > 0) setCounter(kind, max);
    }
    return incCounter(kind);
  },

  // Entities
  products: makeEntity("products"),
  categories: makeEntity("categories"),
  suppliers: makeEntity("suppliers"),
  customers: makeEntity("customers"),

  // invoices with stock-delta-aware update/remove
  invoices: {
    get: () => Promise.resolve(read("invoices")),
    add: (invoice) => processInvoiceAndSave(invoice),
    update: (id, payload) =>
      new Promise((res) => {
        const inv = read("invoices");
        const idx = inv.findIndex((i) => i.id === id);
        if (idx === -1) return res(null);
        const old = inv[idx];
        const newInv = { ...old, ...payload };

        // compute qty per product for old and new
        const oldMap = {};
        (old.items || []).forEach((l) => {
          oldMap[l.product_id] = (oldMap[l.product_id] || 0) + Number(l.quantity || 0);
        });
        const newMap = {};
        (newInv.items || []).forEach((l) => {
          newMap[l.product_id] = (newMap[l.product_id] || 0) + Number(l.quantity || 0);
        });

        // For invoices: stock change = oldQty - newQty (because invoice decreases stock)
        // But easier: delta = newQty - oldQty; apply product.current_stock -= delta
        const products = read("products");
        const allKeys = Array.from(new Set([...Object.keys(oldMap), ...Object.keys(newMap)]));
        allKeys.forEach((pid) => {
          const oldQ = oldMap[pid] || 0;
          const newQ = newMap[pid] || 0;
          const delta = newQ - oldQ;
          const pidx = findProductIndex(products, pid);
          if (pidx === -1) return;
          products[pidx].current_stock = Number(products[pidx].current_stock || 0) - delta;
          if (products[pidx].current_stock < 0) products[pidx].current_stock = 0;
        });
        write("products", products);

        inv[idx] = newInv;
        write("invoices", inv);
        res(inv[idx]);
      }),
    remove: (id) =>
      new Promise((res) => {
        let inv = read("invoices");
        const idx = inv.findIndex((i) => i.id === id);
        if (idx === -1) return res(false);
        const item = inv[idx];
        // revert stock: since invoice decreased stock, we should increase stock by item quantities
        const products = read("products");
        (item.items || []).forEach((l) => {
          const pidx = findProductIndex(products, l.product_id);
          if (pidx === -1) return;
          products[pidx].current_stock = Number(products[pidx].current_stock || 0) + Number(l.quantity || 0);
        });
        write("products", products);

        inv = inv.filter((i) => i.id !== id);
        write("invoices", inv);
        res(true);
      }),
  },

  // bills with stock-delta-aware update/remove
  bills: {
    get: () => Promise.resolve(read("bills")),
    add: (bill) => processBillAndSave(bill),
    update: (id, payload) =>
      new Promise((res) => {
        const arr = read("bills");
        const idx = arr.findIndex((i) => i.id === id);
        if (idx === -1) return res(null);
        const old = arr[idx];
        const newBill = { ...old, ...payload };

        const oldMap = {};
        (old.items || []).forEach((l) => {
          oldMap[l.product_id] = (oldMap[l.product_id] || 0) + Number(l.quantity || 0);
        });
        const newMap = {};
        (newBill.items || []).forEach((l) => {
          newMap[l.product_id] = (newMap[l.product_id] || 0) + Number(l.quantity || 0);
        });

        // For bills: bills increase stock. delta = newQty - oldQty; apply product.current_stock += delta
        const products = read("products");
        const allKeys = Array.from(new Set([...Object.keys(oldMap), ...Object.keys(newMap)]));
        allKeys.forEach((pid) => {
          const oldQ = oldMap[pid] || 0;
          const newQ = newMap[pid] || 0;
          const delta = newQ - oldQ;
          const pidx = findProductIndex(products, pid);
          if (pidx === -1) return;
          products[pidx].current_stock = Number(products[pidx].current_stock || 0) + delta;
          if (products[pidx].current_stock < 0) products[pidx].current_stock = 0;
        });
        write("products", products);

        arr[idx] = newBill;
        write("bills", arr);
        res(arr[idx]);
      }),
    remove: (id) =>
      new Promise((res) => {
        let arr = read("bills");
        const idx = arr.findIndex((i) => i.id === id);
        if (idx === -1) return res(false);
        const item = arr[idx];
        // revert stock: since bill increased stock, deleting should decrease stock
        const products = read("products");
        (item.items || []).forEach((l) => {
          const pidx = findProductIndex(products, l.product_id);
          if (pidx === -1) return;
          products[pidx].current_stock = Number(products[pidx].current_stock || 0) - Number(l.quantity || 0);
          if (products[pidx].current_stock < 0) products[pidx].current_stock = 0;
        });
        write("products", products);

        arr = arr.filter((i) => i.id !== id);
        write("bills", arr);
        res(true);
      }),
  },
};

export default api;
