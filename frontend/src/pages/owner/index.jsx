import React, { useState } from "react";
import Dashboard from "./Dashboard";
// Import LaporanHarian dihapus karena tidak digunakan lagi

const OwnerIndex = ({ orders = [] }) => {
  // Kita kunci ke "dashboard", state tetap ada buat jaga-jaga kalau kamu mau tambah tab lain nanti
  const [activeTab, setActiveTab] = useState("dashboard");

  // Jika orders tidak sengaja terkirim null/undefined, amankan jadi array kosong (DIPERTAHANKAN)
  const safeOrders = Array.isArray(orders) ? orders : [];

  return (
    <div style={{ padding: "10px", color: "#F5EDD6" }}>
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "30px",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            padding: "10px 24px",
            borderRadius: "10px",
            border: "1px solid #C9A84C",
            background: "#C9A84C", 
            color: "#0E0B08",
            fontWeight: "bold",
            textTransform: "capitalize",
            fontFamily: "Playfair Display"
          }}
        >
          Dashboard
        </div>
      </div>
      {activeTab === "dashboard" && <Dashboard orders={safeOrders} />}
    </div>
  );
};

export default OwnerIndex;