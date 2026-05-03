import React from "react";
import { CheckCircle, PlayCircle, Archive, XCircle } from "lucide-react";

const Kasir = ({ orders = [], setOrders }) => {
  const fmt = (n) => "Rp " + n.toLocaleString("id-ID");

  // Filter Data berdasarkan 3 Seksi
  const pendingPayment = orders.filter((o) => o.status === "pending_payment");
  const processing = orders.filter((o) => o.status === "processed");
  const completed = orders.filter((o) => o.status === "completed");

  // Fungsi Transisi Status
  const updateStatus = (id, newStatus) => {
    setOrders(
      orders.map((order) =>
        order.id === id ? { ...order, status: newStatus } : order,
      ),
    );
  };

  const deleteOrder = (id) => {
    setOrders(orders.filter((order) => order.id !== id));
  };

  return (
    <div style={{ padding: "20px", color: "#F5EDD6" }}>
      {/* HEADER */}
      <div
        style={{
          background: "#1A1410",
          border: "1px solid #C9A84C",
          borderRadius: "12px",
          padding: "15px 25px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <h2
          style={{
            fontFamily: "Playfair Display",
            color: "#C9A84C",
            margin: 0,
          }}
        >
          Management Kasir
        </h2>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "#52A870",
            fontSize: "14px",
          }}
        >
          <div
            className="pulse-dot"
            style={{
              width: "8px",
              height: "8px",
              background: "#52A870",
              borderRadius: "50%",
            }}
          />{" "}
          Live System
        </div>
      </div>

      {/* SEKSI 1: BUTUH KONFIRMASI (BELUM BAYAR) */}
      <section style={{ marginBottom: "40px" }}>
        <div
          style={{
            fontSize: "12px",
            color: "#E05252",
            fontWeight: "bold",
            marginBottom: "15px",
            letterSpacing: "1px",
          }}
        >
          ⚠️ BUTUH KONFIRMASI PEMBAYARAN
        </div>
        {pendingPayment.length === 0 ? (
          <EmptyState msg="Tidak ada antrean pembayaran" />
        ) : (
          pendingPayment.map((order) => (
            <OrderCard key={order.id} order={order} fmt={fmt} type="pending">
              <button
                onClick={() => updateStatus(order.id, "processed")}
                style={btnStyle("#C9A84C", "#0E0B08")}
              >
                <CheckCircle size={16} /> Konfirmasi Bayar
              </button>
              <button
                onClick={() => deleteOrder(order.id)}
                style={btnStyle("transparent", "#E05252", "1px solid #E05252")}
              >
                <XCircle size={16} />
              </button>
            </OrderCard>
          ))
        )}
      </section>

      {/* SEKSI 2: DALAM PROSES (SUDAH BAYAR) */}
      <section style={{ marginBottom: "40px" }}>
        <div
          style={{
            fontSize: "12px",
            color: "#52A870",
            fontWeight: "bold",
            marginBottom: "15px",
            letterSpacing: "1px",
          }}
        >
          ☕ DALAM PROSES / MEJA AKTIF
        </div>
        {processing.length === 0 ? (
          <EmptyState msg="Tidak ada pesanan yang sedang diproses" />
        ) : (
          processing.map((order) => (
            <OrderCard key={order.id} order={order} fmt={fmt} type="processing">
              <button
                onClick={() => updateStatus(order.id, "completed")}
                style={btnStyle("#52A870", "#FFFFFF")}
              >
                <PlayCircle size={16} /> Selesaikan Pesanan
              </button>
            </OrderCard>
          ))
        )}
      </section>

      {/* SEKSI 3: SELESAI */}
      <section>
        <div
          style={{
            fontSize: "12px",
            color: "#9E8B6E",
            fontWeight: "bold",
            marginBottom: "15px",
            letterSpacing: "1px",
          }}
        >
          ✅ SELESAI HARI INI
        </div>
        {completed.map((order) => (
          <div
            key={order.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "12px 20px",
              background: "rgba(26,20,16,0.4)",
              borderRadius: "8px",
              marginBottom: "10px",
              border: "0.5px solid rgba(158,139,110,0.2)",
              opacity: 0.7,
            }}
          >
            <span style={{ fontSize: "14px" }}>
              #{order.id.toString().slice(-3)} — {order.table}
            </span>
            <span style={{ fontWeight: "bold", color: "#C9A84C" }}>
              {fmt(order.total)}
            </span>
          </div>
        ))}
      </section>
    </div>
  );
};

// --- SUB-COMPONENTS & STYLES ---

const OrderCard = ({ order, fmt, children, type }) => (
  <div
    style={{
      background: "#1A1410",
      border: `1px solid ${type === "pending" ? "#E05252" : "#C9A84C"}`,
      borderRadius: "12px",
      padding: "18px",
      marginBottom: "15px",
    }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "12px",
      }}
    >
      <div>
        <div style={{ fontWeight: "bold", color: "#C9A84C", fontSize: "16px" }}>
          #{order.id.toString().slice(-3)} — {order.table}
        </div>
        <div style={{ fontSize: "13px", color: "#9E8B6E", marginTop: "4px" }}>
          {order.items}
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontWeight: "bold", fontSize: "16px" }}>
          {fmt(order.total)}
        </div>
        <div style={{ fontSize: "11px", color: "#9E8B6E" }}>{order.time}</div>
      </div>
    </div>
    <div style={{ display: "flex", gap: "10px" }}>{children}</div>
  </div>
);

const EmptyState = ({ msg }) => (
  <div
    style={{
      textAlign: "center",
      padding: "20px",
      color: "#9E8B6E",
      fontSize: "13px",
      border: "1px dashed rgba(158,139,110,0.2)",
      borderRadius: "10px",
    }}
  >
    {msg}
  </div>
);

const btnStyle = (bg, col, border = "none") => ({
  flex: 1,
  background: bg,
  color: col,
  border: border,
  padding: "10px",
  borderRadius: "6px",
  fontWeight: "bold",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  fontSize: "13px",
});

export default Kasir;