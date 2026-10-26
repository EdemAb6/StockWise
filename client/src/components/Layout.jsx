import { useState } from "react";

const navigation = [
  {
    label: "Dashboard",
    view: "dashboard",
    href: "/",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: "Products",
    view: "products",
    href: "/products",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="m3 7 9-4 9 4-9 4-9-4Z" />
        <path d="m3 12 9 4 9-4M3 17l9 4 9-4" />
      </svg>
    ),
  },
  {
    label: "Movements",
    view: "movements",
    href: "/movements",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M7 7h12l-3-3M17 17H5l3 3" />
        <path d="M19 7a7 7 0 0 0-12-5M5 17a7 7 0 0 0 12 5" />
      </svg>
    ),
  },
];

function Sidebar({ currentView, onNavigate }) {
  return (
    <aside className="flex h-full w-72 flex-col bg-slate-950 px-5 py-6 text-slate-300">
      <div className="flex items-center gap-3 px-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500 font-bold text-white">
          S
        </div>
        <div>
          <p className="text-lg font-bold tracking-tight text-white">StockWise</p>
          <p className="text-xs text-slate-500">Inventory workspace</p>
        </div>
      </div>

      <nav className="mt-10 space-y-2" aria-label="Main navigation">
        {navigation.map((item) => (
          <button
            className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
              currentView === item.view
                ? "bg-brand-500/15 text-blue-300"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
            key={item.label}
            onClick={() => onNavigate(item.view)}
            type="button"
          >
            <span className="h-5 w-5">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Workspace
        </p>
        <p className="mt-2 text-sm text-slate-300">Keep your stock accurate and your business moving.</p>
      </div>
    </aside>
  );
}

export default function Layout({ children, currentView, onNavigate }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900">
      <div className={`fixed inset-0 z-30 bg-slate-950/50 transition lg:hidden ${sidebarOpen ? "block" : "hidden"}`} onClick={() => setSidebarOpen(false)} />
      <div className={`fixed inset-y-0 left-0 z-40 transform transition-transform lg:static lg:block lg:w-64 lg:flex-shrink-0 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <Sidebar
          currentView={currentView}
          onNavigate={(view) => {
            onNavigate(view);
            setSidebarOpen(false);
          }}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-20 flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white/90 px-5 backdrop-blur sm:px-8">
          <button
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation"
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-800">Inventory Admin</p>
              <p className="text-xs text-slate-500">Workspace overview</p>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-full bg-brand-100 font-semibold text-brand-700">
              IA
            </div>
          </div>
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl p-5 sm:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
