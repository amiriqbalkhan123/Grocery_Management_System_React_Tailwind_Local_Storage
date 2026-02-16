import { Link, Outlet, useLocation } from "react-router-dom";
export default function Layout() {
  const location = useLocation();

  const menu = [
    { name: "Dashboard", path: "/" },
    { name: "Products", path: "/products" },
    { name: "Categories", path: "/categories" },
    { name: "Suppliers", path: "/suppliers" },
    { name: "Customers", path: "/customers" },
    { name: "Invoices", path: "/invoices" },
    { name: "Bills", path: "/bills" },
  ];

  return (
    <div
      className="min-h-screen flex"
      style={{
        background:
          "radial-gradient(1200px 800px at 10% 10%, rgba(99,102,241,0.14), transparent 8%), radial-gradient(1000px 600px at 90% 90%, rgba(139,92,246,0.12), transparent 8%), linear-gradient(180deg,#05060a 0%, #0b1020 40%, #071028 100%)",
        color: "white",
      }}
    >
      <aside
        className="w-72 p-5 flex flex-col gap-6"
        style={{
          backdropFilter: "blur(10px)",
        }}
      >
        <div
          className="p-4 rounded-2xl"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
            boxShadow: "0 6px 24px rgba(16,24,40,0.6), inset 0 1px 0 rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.03)",
          }}
        >
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ letterSpacing: "-0.5px" }}>
            Grocery MIS
          </h1>
          <div className="mt-1 text-sm text-indigo-200/60">Web • Technologies Sem IV</div>
        </div>

        <nav className="flex-1 space-y-2">
          {menu.map((item, i) => {
            const active = location.pathname === item.path || (item.path === "/" && location.pathname === "/");
            return (
              <Link
                key={i}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                  active
                    ? "bg-gradient-to-r from-indigo-500/40 via-purple-500/30 to-rose-400/25 text-white shadow-[0_8px_30px_rgba(99,102,241,0.12)]"
                    : "text-indigo-100/75 hover:bg-white/3"
                }`}
                style={{ border: active ? "1px solid rgba(255,255,255,0.04)" : "1px solid transparent" }}
              >
                <span className="w-2 h-2 rounded-full" style={{ background: active ? "#7c3aed" : "transparent", boxShadow: active ? "0 6px 18px rgba(124,58,237,0.16)" : "" }} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div
          className="p-3 rounded-xl text-xs"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
            border: "1px solid rgba(255,255,255,0.02)",
          }}
        >
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-[1200px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
