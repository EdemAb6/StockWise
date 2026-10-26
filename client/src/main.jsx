import { StrictMode } from "react";
import { useState } from "react";
import { createRoot } from "react-dom/client";
import Layout from "./components/Layout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Products from "./pages/Products.jsx";
import "./index.css";

function App() {
  const [view, setView] = useState(() => window.location.hash === "#products" ? "products" : "dashboard");

  function navigate(nextView) {
    setView(nextView);
    window.history.replaceState(null, "", nextView === "dashboard" ? "#" : `#${nextView}`);
  }

  const content = view === "products"
    ? <Products />
    : view === "movements"
      ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-card">
          <p className="text-sm font-medium text-brand-600">Inventory</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-950">Movements</h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            The movement history view will be added in the next phase.
          </p>
        </section>
      )
      : <Dashboard />;

  return (
    <Layout currentView={view} onNavigate={navigate}>
      {content}
    </Layout>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
