import { StrictMode } from "react";
import { useState } from "react";
import { createRoot } from "react-dom/client";
import Layout from "./components/Layout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Movements from "./pages/Movements.jsx";
import Products from "./pages/Products.jsx";
import "./index.css";

function App() {
  const [view, setView] = useState(() => window.location.hash === "#products" ? "products" : "dashboard");
  const [dashboardVersion, setDashboardVersion] = useState(0);

  function navigate(nextView) {
    setView(nextView);
    window.history.replaceState(null, "", nextView === "dashboard" ? "#" : `#${nextView}`);
  }

  const content = view === "products"
    ? <Products />
    : view === "movements"
      ? <Movements onMovementRecorded={() => setDashboardVersion((version) => version + 1)} />
      : <Dashboard key={dashboardVersion} onNavigate={navigate} />;

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
