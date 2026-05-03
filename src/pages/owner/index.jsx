import React, { useState } from "react";
import Dashboard from "./Dashboard";
import LaporanHarian from "./LaporanHarian";

const OwnerIndex = ({ orders = [] }) => {
  // Hanya tersisa 2 tab: Dashboard dan Laporan Harian
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div style={{ padding: "20px", color: "#F5EDD6" }}>
      {/* TABS NAVIGATION - Transaksi sudah dihapus */}
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

      {/* RENDER KONTEN BERDASARKAN TAB */}
      {activeTab === "dashboard" && <Dashboard orders={orders} />}
      {activeTab === "laporan harian" && <LaporanHarian orders={orders} />}
    </div>
  );
};

export default OwnerIndex;
