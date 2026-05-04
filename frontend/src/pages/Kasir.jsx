import React from "react";
import { CheckCircle, ChefHat, PlayCircle, XCircle, Clock, AlertCircle } from "lucide-react";

const Kasir = ({ orders = [], setOrders }) => {
  const fmt = (n) => "Rp " + (n || 0).toLocaleString("id-ID");

  // 4 FILTER STATUS
  const pendingPayment = orders.filter(
    (o) => o.status === "pending_payment" || o.status === "pending",
  );
  const paid = orders.filter((o) => o.status === "paid");
  const served = orders.filter((o) => o.status === "served");
  const completed = orders.filter((o) => o.status === "completed");

  // FUNGSI UPDATE LOKAL (BIAR UI INSTAN)
  const updateLocalStatus = (id, newStatus) => {
    setOrders((prevOrders) =>
      prevOrders.map((o) => (o.ID === id ? { ...o, status: newStatus } : o)),
    );
  };

  const handlePayOrder = (id) => {
    fetch(`http://localhost:8080/api/orders/${id}/pay`, { method: "PUT" })
      .then((res) => {
        if (res.ok) updateLocalStatus(id, "paid");
      })
      .catch((err) => console.error(err));
  };

  const handleServeOrder = (id) => {
    fetch(`http://localhost:8080/api/orders/${id}/serve`, { method: "PUT" })
      .then((res) => {
        if (res.ok) updateLocalStatus(id, "served");
      })
      .catch((err) => console.error(err));
  };

  const handleCompleteOrder = (id) => {
    fetch(`http://localhost:8080/api/orders/${id}/complete`, { method: "PUT" })
      .then((res) => {
        if (res.ok) updateLocalStatus(id, "completed");
      })
      .catch((err) => console.error(err));
  };

  const handleCancelOrder = (id) => {
    const isConfirmed = window.confirm(
      "Batalkan pesanan ini? Meja akan otomatis dikosongkan.",
    );
    if (!isConfirmed) return;

    fetch(`http://localhost:8080/api/orders/${id}/cancel`, {
      method: "PUT",
    })
      .then((res) => {
        if (res.ok) {
          updateLocalStatus(id, "cancelled");
        } else {
          alert("Gagal membatalkan pesanan dari server.");
        }
      })
      .catch((err) => console.error("Error jaringan:", err));
  };

  return (
    <div style={{ padding: "20px", color: "#F5EDD6", animation: "fadeIn 0.3s" }}>
      <div style={{ background: "#1A1410", border: "1px solid #C9A84C", borderRadius: "12px", padding: "15px 25px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <h2 style={{ fontFamily: "Playfair Display", color: "#C9A84C", margin: 0 }}>Management Kasir</h2>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#52A870", fontSize: "14px" }}>
          <div className="pulse-dot" style={{ width: "8px", height: "8px", background: "#52A870", borderRadius: "50%" }} /> Live System
        </div>
      </div>

      {/* SEKSI 1: BELUM BAYAR */}
      <section style={{ marginBottom: "30px" }}>
        <div style={{ fontSize: "12px", color: "#E05252", fontWeight: "bold", marginBottom: "15px", letterSpacing: "1px" }}>⚠️ 1. ANTREAN BELUM BAYAR</div>
        {pendingPayment.length === 0 ? <EmptyState msg="Tidak ada antrean pembayaran" /> : 
          pendingPayment.map((order) => (
            <OrderCard key={order.ID} order={order} fmt={fmt} borderColor="#E05252">
              <button onClick={() => handlePayOrder(order.ID)} style={btnStyle("#C9A84C", "#0E0B08")}><CheckCircle size={16} /> Terima Pembayaran</button>
              <button onClick={() => handleCancelOrder(order.ID)} style={btnStyle("transparent", "#E05252", "1px solid #E05252")}><XCircle size={16} /> Batal</button>
            </OrderCard>
          ))
        }
      </section>

      {/* SEKSI 2: SUDAH BAYAR */}
      <section style={{ marginBottom: "30px" }}>
        <div style={{ fontSize: "12px", color: "#4A90E2", fontWeight: "bold", marginBottom: "15px", letterSpacing: "1px" }}>🍳 2. SUDAH BAYAR / DISIAPKAN</div>
        {paid.length === 0 ? <EmptyState msg="Tidak ada pesanan yang sedang disiapkan" /> : 
          paid.map((order) => (
            <OrderCard key={order.ID} order={order} fmt={fmt} borderColor="#4A90E2">
              <button onClick={() => handleServeOrder(order.ID)} style={btnStyle("#4A90E2", "#FFFFFF")}><ChefHat size={16} /> Pesanan Diantar ke Meja</button>
            </OrderCard>
          ))
        }
      </section>

      {/* SEKSI 3: MEJA AKTIF */}
      <section style={{ marginBottom: "40px" }}>
        <div style={{ fontSize: "12px", color: "#52A870", fontWeight: "bold", marginBottom: "15px", letterSpacing: "1px" }}>☕ 3. MEJA AKTIF / SEDANG DINIKMATI</div>
        {served.length === 0 ? <EmptyState msg="Tidak ada meja yang sedang aktif" /> : 
          served.map((order) => (
            <OrderCard key={order.ID} order={order} fmt={fmt} borderColor="#52A870">
              <button onClick={() => handleCompleteOrder(order.ID)} style={btnStyle("#52A870", "#FFFFFF")}><PlayCircle size={16} /> Kosongkan Meja (Selesai)</button>
            </OrderCard>
          ))
        }
      </section>

      {/* SEKSI 4: RIWAYAT */}
      <section>
        <div style={{ fontSize: "12px", color: "#9E8B6E", fontWeight: "bold", marginBottom: "15px", letterSpacing: "1px" }}>✅ 4. RIWAYAT SELESAI HARI INI</div>
        {completed.map((order) => (
          <div key={order.ID} style={{ display: "flex", justifyContent: "space-between", padding: "12px 20px", background: "rgba(26,20,16,0.4)", borderRadius: "8px", marginBottom: "10px", border: "0.5px solid rgba(158,139,110,0.2)", opacity: 0.7 }}>
            <span style={{ fontSize: "14px" }}>#{order.ID} — {order.table_number || "Unknown"}</span>
            <span style={{ fontWeight: "bold", color: "#C9A84C" }}>{fmt(order.total)}</span>
          </div>
        ))}
        {completed.length === 0 && <EmptyState msg="Belum ada transaksi selesai." />}
      </section>
    </div>
  );
};

// --- SUB-COMPONENT: CARD PESANAN DENGAN MONITOR WAKTU ---
const OrderCard = ({ order, fmt, children, borderColor }) => {
  // Fungsi menghitung sisa menit
  const getRemainingTime = (endStr) => {
    if (!endStr) return null;
    const diffMs = new Date(endStr) - new Date();
    return Math.floor(diffMs / 60000); 
  };

  const sisaMenit = getRemainingTime(order.end_time);
  const startTime = order.start_time ? new Date(order.start_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-';
  const endTime = order.end_time ? new Date(order.end_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : null;

  return (
    <div style={{ background: "#1A1410", border: `1px solid ${borderColor}`, borderRadius: "12px", padding: "18px", marginBottom: "15px", transition: "all 0.3s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: "bold", color: "#C9A84C", fontSize: "16px" }}>
            #{order.ID} — {order.table_number || "Unknown"}
          </div>
          <div style={{ fontSize: "13px", color: "#9E8B6E", marginTop: "4px" }}>{order.items}</div>
          
          {/* MONITOR WAKTU BILLIARD */}
          {endTime && (
            <div style={{ marginTop: "15px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {/* Kotak Jadwal */}
              <div style={{ padding: "8px 12px", background: "rgba(201,168,76,0.05)", borderRadius: "8px", borderLeft: "3px solid #C9A84C", display: "flex", alignItems: "center", gap: "8px" }}>
                <Clock size={14} color="#C9A84C" />
                <div>
                  <div style={{ fontSize: "10px", color: "#9E8B6E", textTransform: "uppercase" }}>Jadwal</div>
                  <div style={{ fontSize: "13px", color: "#F5EDD6" }}>{startTime} - {endTime}</div>
                </div>
              </div>

              {/* Kotak Sisa Waktu */}
              <div style={{ 
                padding: "8px 12px", 
                background: sisaMenit <= 0 ? "rgba(224, 82, 82, 0.1)" : "rgba(82, 168, 112, 0.1)", 
                borderRadius: "8px", 
                borderLeft: sisaMenit <= 0 ? "3px solid #E05252" : "3px solid #52A870",
                display: "flex", alignItems: "center", gap: "8px"
              }}>
                {sisaMenit <= 0 ? <AlertCircle size={14} color="#E05252" /> : <Clock size={14} color="#52A870" />}
                <div>
                  <div style={{ fontSize: "10px", color: sisaMenit <= 0 ? "#E05252" : "#52A870", textTransform: "uppercase" }}>Status</div>
                  <div style={{ fontSize: "13px", fontWeight: "bold", color: sisaMenit <= 0 ? "#E05252" : "#F5EDD6" }}>
                    {sisaMenit > 0 ? `${sisaMenit} Menit Lagi` : "WAKTU HABIS"}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontWeight: "bold", fontSize: "16px" }}>{fmt(order.total)}</div>
          <div style={{ fontSize: "11px", color: "#9E8B6E" }}>{startTime}</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: "10px" }}>{children}</div>
    </div>
  );
};

const EmptyState = ({ msg }) => (
  <div style={{ textAlign: "center", padding: "20px", color: "#9E8B6E", fontSize: "13px", border: "1px dashed rgba(158,139,110,0.2)", borderRadius: "10px" }}>{msg}</div>
);

const btnStyle = (bg, col, border = "none") => ({
  flex: 1, background: bg, color: col, border: border, padding: "10px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "13px", transition: "0.2s"
});

export default Kasir;