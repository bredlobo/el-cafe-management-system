import React, { useState } from "react";
import Pengunjung from "./pages/Pengunjung";
import Kasir from "./pages/Kasir";
import Login from "./pages/Login";
import Owner from "./pages/owner/index";

function App() {
  const [view, setView] = useState("pengunjung");
  // State untuk menampung semua pesanan yang masuk
  const [orders, setOrders] = useState([]);

  // Fungsi untuk menambah pesanan baru dari Pengunjung
  const addOrder = (newOrder) => {
    setOrders((prev) => [
      ...prev,
      { ...newOrder, id: Date.now(), status:"pending_payment" },
    ]);
  };

  return (
    <div
      style={{ minHeight: "100vh", background: "#0E0B08", color: "#F5EDD6" }}
    >
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "12px" }}>
        {/* NAVBAR */}
        <nav
          style={{
            padding: "20px",
            background: "#1A1410",
            border: "0.5px solid rgba(201,168,76,0.3)",
            borderRadius: "12px",
            marginBottom: "16px",
            textAlign: "center",
            position: "relative",
          }}
        >
          <div
            style={{
              fontFamily: "Playfair Display",
              fontSize: "22px",
              color: "#C9A84C",
            }}
          >
            EL CAFÉ{" "}
            <span style={{ fontSize: "14px", opacity: 0.7, color: "#F5EDD6" }}>
              & Billiard
            </span>
          </div>
          <button
            onClick={() =>
              setView(view === "pengunjung" ? "login" : "pengunjung")
            }
            style={{
              position: "absolute",
              right: "20px",
              opacity: 0.1,
              background: "none",
              border: "none",
              color: "#F5EDD6",
              cursor: "pointer",
            }}
           >
            🔑
          </button>
        </nav>

        {/* TAMPILAN DINAMIS */}
        {view === "pengunjung" && <Pengunjung onPlaceOrder={addOrder} />}
        {view === "login" && <Login onLoginSuccess={(role) => setView(role)} />}
        {view === "kasir" && <Kasir orders={orders} setOrders={setOrders} />}
        {view === "owner" && <Owner />}
      </div>
    </div>
  );
}

export default App;
