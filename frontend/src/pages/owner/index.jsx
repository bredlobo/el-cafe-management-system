import React, { useState } from "react";
import Dashboard from "./Dashboard";
import LaporanHarian from "./LaporanHarian";

const OwnerIndex = ({ orders = [] }) => {
  // State untuk navigasi tab
  const [activeTab, setActiveTab] = useState("dashboard");

  // Jika orders tidak sengaja terkirim null/undefined, amankan jadi array kosong
  const safeOrders = Array.isArray(orders) ? orders : [];

  return (
    <div style={{ padding: "10px", color: "#F5EDD6" }}>
      {/* TABS NAVIGATION */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "30px",
          flexWrap: "wrap",
        }}
      >
        {["dashboard", "laporan harian"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "10px 24px",
              borderRadius: "10px",
              cursor: "pointer",
              textTransform: "capitalize",
              border: "1px solid #C9A84C",
              background: activeTab === tab ? "#C9A84C" : "transparent",
              color: activeTab === tab ? "#0E0B08" : "#C9A84C",
              fontWeight: "bold",
              transition: "0.3s",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* RENDER KONTEN */}
      {/* Menggunakan safeOrders agar komponen anak tidak error saat map data */}
      {activeTab === "dashboard" && <Dashboard orders={safeOrders} />}
      {activeTab === "laporan harian" && <LaporanHarian orders={safeOrders} />}
    </div>
  );
};

export default OwnerIndex;