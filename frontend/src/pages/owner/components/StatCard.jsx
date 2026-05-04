import React from "react";

const StatCard = ({ label, value, sub }) => (
  <div
    style={{
      background: "#1A1410",
      border: "1px solid rgba(201,168,76,0.3)",
      padding: "20px",
      borderRadius: "16px",
    }}
  >
    <div style={{ color: "#9E8B6E", fontSize: "13px", marginBottom: "8px" }}>
      {label}
    </div>
    <div
      style={{
        fontSize: "24px",
        fontWeight: "bold",
        color: "#C9A84C",
        marginBottom: "4px",
      }}
    >
      {value}
    </div>
    <div style={{ color: "#52A870", fontSize: "11px" }}>{sub}</div>
  </div>
);

export default StatCard;
