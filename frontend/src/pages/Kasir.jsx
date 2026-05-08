import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  ChefHat,
  PlayCircle,
  XCircle,
  Clock,
  UserCheck,
  UserPlus,
  Users,
  Calendar,
  X,
} from "lucide-react";

const Kasir = ({ orders = [], setOrders }) => {
  const [memberInfo, setMemberInfo] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showRegForm, setShowRegForm] = useState(false);
  const [regData, setRegData] = useState({ name: "", phone: "", photo: null });
  const [allMembers, setAllMembers] = useState([]);
  const [showMemberList, setShowMemberList] = useState(false);

  const fmt = (n) => "Rp " + (n || 0).toLocaleString("id-ID");

  // --- 1. AMBIL DATA DARI SERVER ---
  useEffect(() => {
    fetchAllMembers();
  }, []);

  const fetchAllMembers = () => {
    fetch("/api/members")
      .then((res) => res.json())
      .then((data) => setAllMembers(data))
      .catch((err) => console.error("Gagal ambil data member:", err));
  };

  const handleOpenMemberList = () => {
    fetchAllMembers();
    setShowMemberList(true);
  };

  // --- 2. LOGIKA FILTER PESANAN (WAJIB ADA AGAR MUNCUL DI LAYAR) ---
  const verificationQueue = orders.filter(
    (o) => o.status === "pending" && o.items?.includes("[MEMBER:"),
  );

  const pendingPayment = orders.filter(
    (o) =>
      (o.status === "pending_payment" || o.status === "pending") &&
      !o.items?.includes("[MEMBER:"),
  );

  const paid = orders.filter((o) => o.status === "paid");
  const served = orders.filter((o) => o.status === "served");
  const completed = orders.filter((o) => o.status === "completed");

  // --- 3. FUNGSI UPDATE STATUS ---
  const updateLocalStatus = (id, newStatus) => {
    setOrders((prevOrders) =>
      prevOrders.map((o) => (o.ID === id ? { ...o, status: newStatus } : o)),
    );
  };

  const handleRegisterMember = async (e) => {
    e.preventDefault();
    if (!regData.photo) return alert("Foto wajah wajib diunggah!");
    const formData = new FormData();
    formData.append("full_name", regData.name);
    formData.append("phone_number", regData.phone);
    formData.append("photo", regData.photo);

    try {
      const res = await fetch("/api/members", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      if (res.ok) {
        alert("Member Berhasil Didaftarkan!");
        setShowRegForm(false);
        setRegData({ name: "", phone: "", photo: null });
        fetchAllMembers();
      } else {
        alert("Gagal: " + result.error);
      }
    } catch (err) {
      alert("Gagal koneksi ke server.");
    }
  };

  const handleCheckMember = (itemString) => {
    const match = itemString.match(/\[MEMBER: (.*?)\]/);
    if (!match) return alert("Bukan pesanan member!");
    const phone = match[1];
    fetch(`/api/members/${phone}`)
      .then((res) => res.json())
      .then((data) => {
        setMemberInfo(data.member);
        setShowModal(true);
      })
      .catch((err) => alert("Member tidak ditemukan!"));
  };

  const handlePayOrder = (id) => {
    fetch(`/api/orders/${id}/pay`, { method: "PUT" }).then((res) => {
      if (res.ok) updateLocalStatus(id, "paid");
    });
  };

  const handleServeOrder = (id) => {
    fetch(`/api/orders/${id}/serve`, { method: "PUT" }).then((res) => {
      if (res.ok) updateLocalStatus(id, "served");
    });
  };

  const handleCompleteOrder = (id) => {
    fetch(`/api/orders/${id}/complete`, { method: "PUT" }).then((res) => {
      if (res.ok) updateLocalStatus(id, "completed");
    });
  };

  const handleCancelOrder = (id) => {
    if (!window.confirm("Batalkan pesanan ini?")) return;
    fetch(`/api/orders/${id}/cancel`, { method: "PUT" }).then((res) => {
      if (res.ok) updateLocalStatus(id, "cancelled");
    });
  };

  return (
    <div
      style={{ padding: "20px", color: "#F5EDD6", animation: "fadeIn 0.3s" }}
    >
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
        <div>
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
              fontSize: "12px",
              marginTop: "4px",
            }}
          >
            <div
              style={{
                width: "6px",
                height: "6px",
                background: "#52A870",
                borderRadius: "50%",
              }}
            />{" "}
            Live System
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={handleOpenMemberList} style={secondaryBtn}>
            <Users size={18} /> Data Member
          </button>
          <button onClick={() => setShowRegForm(true)} style={primaryBtn}>
            <UserPlus size={18} /> + Member Baru
          </button>
        </div>
      </div>

      {/* SEKSI 0: VERIFIKASI MEMBER */}
      {verificationQueue.length > 0 && (
        <section style={verificationBox}>
          <div style={sectionLabel}>📸 ANTREAN VERIFIKASI WAJAH MEMBER</div>
          {verificationQueue.map((order) => (
            <OrderCard
              key={order.ID}
              order={order}
              fmt={fmt}
              borderColor="#C9A84C"
            >
              <button
                onClick={() => handleCheckMember(order.items)}
                style={btnStyle("#C9A84C", "#0E0B08")}
              >
                <UserCheck size={16} /> Cek Foto Profil
              </button>
              <button
                onClick={() => handlePayOrder(order.ID)}
                style={btnStyle("#52A870", "#FFFFFF")}
              >
                <CheckCircle size={16} /> Wajah Cocok & Bayar
              </button>
            </OrderCard>
          ))}
        </section>
      )}

      {/* SEKSI 1: ANTRIAN BAYAR */}
      <section style={{ marginBottom: "30px" }}>
        <div style={{ ...sectionLabel, color: "#E05252" }}>
          ⚠️ 1. ANTREAN BELUM BAYAR
        </div>
        {pendingPayment.length === 0 ? (
          <EmptyState msg="Tidak ada antrean pembayaran" />
        ) : (
          pendingPayment.map((order) => (
            <OrderCard
              key={order.ID}
              order={order}
              fmt={fmt}
              borderColor="#E05252"
            >
              <button
                onClick={() => handlePayOrder(order.ID)}
                style={btnStyle("#C9A84C", "#0E0B08")}
              >
                <CheckCircle size={16} /> Terima Pembayaran
              </button>
              <button
                onClick={() => handleCancelOrder(order.ID)}
                style={btnStyle("transparent", "#E05252", "1px solid #E05252")}
              >
                <XCircle size={16} /> Batal
              </button>
            </OrderCard>
          ))
        )}
      </section>

      {/* SEKSI 2 & 3: PROSES MASAK & MEJA AKTIF */}
      <section style={{ marginBottom: "30px" }}>
        <div style={{ ...sectionLabel, color: "#4A90E2" }}>
          🍳 2. SUDAH BAYAR / DISIAPKAN
        </div>
        {paid.length === 0 ? (
          <EmptyState msg="Tidak ada pesanan disiapkan" />
        ) : (
          paid.map((order) => (
            <OrderCard
              key={order.ID}
              order={order}
              fmt={fmt}
              borderColor="#4A90E2"
            >
              <button
                onClick={() => handleServeOrder(order.ID)}
                style={btnStyle("#4A90E2", "#FFFFFF")}
              >
                <ChefHat size={16} /> Pesanan Diantar
              </button>
            </OrderCard>
          ))
        )}
      </section>

      <section style={{ marginBottom: "40px" }}>
        <div style={{ ...sectionLabel, color: "#52A870" }}>
          ☕ 3. MEJA AKTIF
        </div>
        {served.length === 0 ? (
          <EmptyState msg="Tidak ada meja aktif" />
        ) : (
          served.map((order) => (
            <OrderCard
              key={order.ID}
              order={order}
              fmt={fmt}
              borderColor="#52A870"
            >
              <button
                onClick={() => handleCompleteOrder(order.ID)}
                style={btnStyle("#52A870", "#FFFFFF")}
              >
                <PlayCircle size={16} /> Selesai
              </button>
            </OrderCard>
          ))
        )}
      </section>

      {/* RIWAYAT */}
      <section>
        <div style={sectionLabel}>✅ 4. RIWAYAT SELESAI HARI INI</div>
        {completed.map((order) => (
          <div key={order.ID} style={historyItemStyle}>
            <span>
              #{order.ID} — {order.table_number}
            </span>
            <span style={{ fontWeight: "bold", color: "#C9A84C" }}>
              {fmt(order.total)}
            </span>
          </div>
        ))}
      </section>

      {/* MODAL-MODAL TETAP SAMA SEPERTI KODE KAMU... */}
      {/* (Gunakan modal-modal yang ada di kode kamu sebelumnya) */}
      {showMemberList && (
        <MemberListModal
          members={allMembers}
          onClose={() => setShowMemberList(false)}
        />
      )}
      {showModal && (
        <VerificationModal
          info={memberInfo}
          onClose={() => setShowModal(false)}
        />
      )}
      {showRegForm && (
        <RegistrationModal
          data={regData}
          setData={setRegData}
          onSubmit={handleRegisterMember}
          onClose={() => setShowRegForm(false)}
        />
      )}
    </div>
  );
};

// --- KOMPONEN HELPER ---
const OrderCard = ({ order, fmt, children, borderColor }) => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { startTime, targetDate } = React.useMemo(
    () => ({
      startTime: order.start_time
        ? new Date(order.start_time).toLocaleTimeString("id-ID")
        : "-",
      targetDate: order.end_time ? new Date(order.end_time) : null,
    }),
    [order.start_time, order.end_time],
  );

  const diffMs = targetDate ? targetDate - now : null;
  const timeStatus = targetDate
    ? {
        min: Math.floor(diffMs / 60000),
        sec: Math.floor((diffMs % 60000) / 1000),
        isOver: diffMs <= 0,
      }
    : null;

  return (
    <div
      style={{
        background: "#1A1410",
        border: `1px solid ${borderColor}`,
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
          <div style={{ fontWeight: "bold", color: "#C9A84C" }}>
            #{order.ID} — {order.table_number}
          </div>
          <div style={{ fontSize: "13px", color: "#9E8B6E" }}>
            {order.items}
          </div>
          {timeStatus && (
            <div
              style={{
                marginTop: "10px",
                fontSize: "12px",
                color: timeStatus.isOver ? "#E05252" : "#F5EDD6",
              }}
            >
              <Clock size={12} />{" "}
              {timeStatus.isOver
                ? "WAKTU HABIS"
                : `${timeStatus.min}m ${timeStatus.sec}s lagi`}
            </div>
          )}
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontWeight: "bold" }}>{fmt(order.total)}</div>
          <div style={{ fontSize: "11px", color: "#9E8B6E" }}>{startTime}</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: "10px" }}>{children}</div>
    </div>
  );
};

const EmptyState = ({ msg }) => (
  <div
    style={{
      textAlign: "center",
      padding: "20px",
      color: "#9E8B6E",
      border: "1px dashed rgba(158,139,110,0.2)",
      borderRadius: "10px",
    }}
  >
    {msg}
  </div>
);

// --- STYLES ---
const sectionLabel = {
  fontSize: "12px",
  color: "#9E8B6E",
  fontWeight: "bold",
  marginBottom: "15px",
  letterSpacing: "1px",
};
const verificationBox = {
  marginBottom: "30px",
  padding: "20px",
  background: "rgba(201,168,76,0.05)",
  border: "1px dashed #C9A84C",
  borderRadius: "12px",
};
const btnStyle = (bg, col, border = "none") => ({
  flex: 1,
  background: bg,
  color: col,
  border,
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
const secondaryBtn = {
  background: "transparent",
  color: "#C9A84C",
  border: "1px solid #C9A84C",
  padding: "10px 18px",
  borderRadius: "8px",
  fontWeight: "bold",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "8px",
};
const primaryBtn = {
  background: "#C9A84C",
  color: "#0E0B08",
  border: "none",
  padding: "10px 18px",
  borderRadius: "8px",
  fontWeight: "bold",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "8px",
};
const historyItemStyle = {
  display: "flex",
  justifyContent: "space-between",
  padding: "12px 20px",
  background: "rgba(26,20,16,0.4)",
  borderRadius: "8px",
  marginBottom: "10px",
  opacity: 0.7,
};

export default Kasir;
