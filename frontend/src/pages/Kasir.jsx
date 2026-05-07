import React, { useState, useEffect } from "react"; // Tambah useEffect untuk ambil data
import {
  CheckCircle,
  ChefHat,
  PlayCircle,
  XCircle,
  Clock,
  AlertCircle,
  UserCheck,
  UserPlus,
  Users, // Icon baru
  Calendar, // Icon baru
  X,
} from "lucide-react";

const Kasir = ({ orders = [], setOrders }) => {
  // --- STATE LAMA (DIPERTAHANKAN) ---
  const [memberInfo, setMemberInfo] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // --- STATE BARU (DITAMBAHKAN) ---
  const [showRegForm, setShowRegForm] = useState(false);
  const [regData, setRegData] = useState({ name: "", phone: "", photo: null });

  // --- STATE DATA MEMBER (DITAMBAHKAN UNTUK LIHAT DAFTAR) ---
  const [allMembers, setAllMembers] = useState([]);
  const [showMemberList, setShowMemberList] = useState(false);

  const fmt = (n) => "Rp " + (n || 0).toLocaleString("id-ID");

  // --- FUNGSI AMBIL SEMUA DATA MEMBER (DITAMBAHKAN) ---
  const fetchAllMembers = () => {
    fetch("http://localhost:8080/api/members")
      .then((res) => res.json())
      .then((data) => setAllMembers(data))
      .catch((err) => console.error("Gagal ambil data member:", err));
  };

  const handleOpenMemberList = () => {
    fetchAllMembers();
    setShowMemberList(true);
  };

  // --- LOGIKA FILTER (DIPERTAHANKAN) ---
  const verificationQueue = orders.filter(
    (o) => o.status === "pending" && o.items.includes("[MEMBER:"),
  );

  const pendingPayment = orders.filter(
    (o) =>
      (o.status === "pending_payment" || o.status === "pending") &&
      !o.items.includes("[MEMBER:"),
  );

  const paid = orders.filter((o) => o.status === "paid");
  const served = orders.filter((o) => o.status === "served");
  const completed = orders.filter((o) => o.status === "completed");

  // --- FUNGSI UPDATE (DIPERTAHANKAN) ---
  const updateLocalStatus = (id, newStatus) => {
    setOrders((prevOrders) =>
      prevOrders.map((o) => (o.ID === id ? { ...o, status: newStatus } : o)),
    );
  };

  // --- HANDLER REGISTRASI MEMBER (DIPERTAHANKAN) ---
  const handleRegisterMember = async (e) => {
    e.preventDefault();
    if (!regData.photo) return alert("Foto wajah wajib diunggah!");

    const formData = new FormData();
    formData.append("full_name", regData.name);
    formData.append("phone_number", regData.phone);
    formData.append("photo", regData.photo);

    try {
      const res = await fetch("http://localhost:8080/api/members", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (res.ok) {
        alert("Member Berhasil Didaftarkan!");
        setShowRegForm(false);
        setRegData({ name: "", phone: "", photo: null });
        fetchAllMembers(); // Refresh data member
      } else {
        alert("Gagal daftar: " + (result.error || "Terjadi kesalahan server"));
      }
    } catch (err) {
      alert("Gagal koneksi ke server. Pastikan Backend sudah jalan!");
    }
  };

  // --- HANDLER LAMA (DIPERTAHANKAN) ---
  const handleCheckMember = (itemString) => {
    const phone = itemString.match(/\[MEMBER: (.*?)\]/)[1];
    fetch(`http://localhost:8080/api/members/${phone}`)
      .then((res) => res.json())
      .then((data) => {
        setMemberInfo(data.member);
        setShowModal(true);
      })
      .catch((err) => alert("Data member tidak ditemukan!"));
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
    if (
      !window.confirm("Batalkan pesanan ini? Meja akan otomatis dikosongkan.")
    )
      return;
    fetch(`http://localhost:8080/api/orders/${id}/cancel`, { method: "PUT" })
      .then((res) => {
        if (res.ok) updateLocalStatus(id, "cancelled");
      })
      .catch((err) => console.error(err));
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
              className="pulse-dot"
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

        {/* GRUP TOMBOL MEMBER (DITAMBAH TOMBOL DATA MEMBER) */}
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={handleOpenMemberList}
            style={{
              background: "transparent",
              color: "#C9A84C",
              border: "1px solid #C9A84C",
              padding: "10px 18px",
              borderRadius: "8px",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
            }}
          >
            <Users size={18} /> Data Member
          </button>

          <button
            onClick={() => setShowRegForm(true)}
            style={{
              background: "#C9A84C",
              color: "#0E0B08",
              border: "none",
              padding: "10px 18px",
              borderRadius: "8px",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
            }}
          >
            <UserPlus size={18} /> + Member Baru
          </button>
        </div>
      </div>

      {/* SEKSI 0: VERIFIKASI MEMBER (DITAMBAHKAN) */}
      {verificationQueue.length > 0 && (
        <section
          style={{
            marginBottom: "30px",
            padding: "20px",
            background: "rgba(201,168,76,0.05)",
            border: "1px dashed #C9A84C",
            borderRadius: "12px",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              color: "#C9A84C",
              fontWeight: "bold",
              marginBottom: "15px",
              letterSpacing: "1px",
            }}
          >
            📸 ANTREAN VERIFIKASI WAJAH MEMBER
          </div>
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

      {/* SEKSI 1: ANTREAN BELUM BAYAR */}
      <section style={{ marginBottom: "30px" }}>
        <div
          style={{
            fontSize: "12px",
            color: "#E05252",
            fontWeight: "bold",
            marginBottom: "15px",
          }}
        >
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

      <section style={{ marginBottom: "30px" }}>
        <div
          style={{
            fontSize: "12px",
            color: "#4A90E2",
            fontWeight: "bold",
            marginBottom: "15px",
          }}
        >
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
        <div
          style={{
            fontSize: "12px",
            color: "#52A870",
            fontWeight: "bold",
            marginBottom: "15px",
          }}
        >
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

      {/* SEKSI 4 RIWAYAT (INI TETAP ADA, TIDAK DIHAPUS) */}
      <section>
        <div
          style={{
            fontSize: "12px",
            color: "#9E8B6E",
            fontWeight: "bold",
            marginBottom: "15px",
          }}
        >
          ✅ 4. RIWAYAT SELESAI HARI INI
        </div>
        {completed.map((order) => (
          <div key={order.ID} style={historyItemStyle}>
            <span style={{ fontSize: "14px" }}>
              #{order.ID} — {order.table_number}
            </span>
            <span style={{ fontWeight: "bold", color: "#C9A84C" }}>
              {fmt(order.total)}
            </span>
          </div>
        ))}
        {completed.length === 0 && (
          <EmptyState msg="Belum ada riwayat hari ini" />
        )}
      </section>

      {/* MODAL DATA MEMBER (UKURAN FOTO DIPERBESAR DI SINI) */}
      {showMemberList && (
        <div style={modalOverlay}>
          <div
            style={{ ...modalContent, maxWidth: "800px", textAlign: "left" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "20px",
              }}
            >
              <h3 style={{ color: "#C9A84C", margin: 0 }}>
                Data Pelanggan Member
              </h3>
              <X
                onClick={() => setShowMemberList(false)}
                style={{ cursor: "pointer" }}
              />
            </div>
            <div style={{ maxHeight: "500px", overflowY: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead
                  style={{
                    position: "sticky",
                    top: 0,
                    background: "#1A1410",
                    zIndex: 10,
                  }}
                >
                  <tr
                    style={{
                      borderBottom: "1px solid #C9A84C",
                      color: "#9E8B6E",
                      fontSize: "13px",
                    }}
                  >
                    <th style={{ padding: "10px", textAlign: "left" }}>Foto</th>
                    <th style={{ padding: "10px", textAlign: "left" }}>Nama</th>
                    <th style={{ padding: "10px", textAlign: "left" }}>
                      No HP
                    </th>
                    <th style={{ padding: "10px", textAlign: "left" }}>
                      Berakhir
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {allMembers.map((m) => (
                    <tr
                      key={m.phone_number}
                      style={{
                        borderBottom: "0.5px solid rgba(201,168,76,0.1)",
                      }}
                    >
                      <td style={{ padding: "15px 10px" }}>
                        <img
                          src={m.photo_url}
                          style={{
                            width: "120px", // DIPERBESAR dari 40px ke 120px
                            height: "120px", // DIPERBESAR dari 40px ke 120px
                            borderRadius: "8px", // Kotak sedikit bulat biar jelas
                            objectFit: "cover",
                            border: "2px solid #C9A84C",
                          }}
                          alt={m.full_name}
                        />
                      </td>
                      <td
                        style={{
                          padding: "10px",
                          color: "#F5EDD6",
                          fontWeight: "bold",
                        }}
                      >
                        {m.full_name}
                      </td>
                      <td style={{ padding: "10px", color: "#C9A84C" }}>
                        {m.phone_number}
                      </td>
                      <td
                        style={{
                          padding: "10px",
                          color:
                            new Date(m.expired_at) < new Date()
                              ? "#E05252"
                              : "#52A870",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                            fontSize: "13px",
                          }}
                        >
                          <Calendar size={14} />{" "}
                          {new Date(m.expired_at).toLocaleDateString("id-ID")}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL VERIFIKASI (UNTUK PROSES CEK WAJAH) */}
      {showModal && memberInfo && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <h3 style={{ color: "#C9A84C", marginBottom: "20px" }}>
              Verifikasi Identitas
            </h3>
            <img
              src={memberInfo.photo_url}
              alt="Member"
              style={{ ...photoPreview, width: "350px", height: "350px" }}
            />
            <div
              style={{ fontSize: "20px", fontWeight: "bold", color: "#F5EDD6" }}
            >
              {memberInfo.full_name}
            </div>
            <div style={{ color: "#9E8B6E", marginBottom: "25px" }}>
              {memberInfo.phone_number}
            </div>
            <button onClick={() => setShowModal(false)} style={primaryBtn}>
              Tutup & Konfirmasi
            </button>
          </div>
        </div>
      )}

      {/* MODAL PENDAFTARAN BARU */}
      {showRegForm && (
        <div style={modalOverlay}>
          <form onSubmit={handleRegisterMember} style={modalContent}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "20px",
              }}
            >
              <h3 style={{ color: "#C9A84C", margin: 0 }}>
                Registrasi Member Baru
              </h3>
              <X
                onClick={() => setShowRegForm(false)}
                style={{ cursor: "pointer" }}
              />
            </div>
            <input
              type="text"
              placeholder="Nama Lengkap"
              required
              style={inputStyle}
              onChange={(e) => setRegData({ ...regData, name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Nomor HP"
              required
              style={inputStyle}
              onChange={(e) =>
                setRegData({ ...regData, phone: e.target.value })
              }
            />
            <div style={{ textAlign: "left", marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  color: "#9E8B6E",
                  marginBottom: "8px",
                }}
              >
                Upload Foto Wajah:
              </label>
              <input
                type="file"
                accept="image/*"
                required
                onChange={(e) =>
                  setRegData({ ...regData, photo: e.target.files[0] })
                }
              />
            </div>
            <button type="submit" style={primaryBtn}>
              Simpan Member
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

// --- SUB-KOMPONEN TIMER ---
const OrderCard = ({ order, fmt, children, borderColor }) => {
  const [now, setNow] = React.useState(new Date());
  React.useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { startTime, endTime, targetDate } = React.useMemo(
    () => ({
      startTime: order.start_time
        ? new Date(order.start_time).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "-",
      endTime: order.end_time
        ? new Date(order.end_time).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : null,
      targetDate: order.end_time ? new Date(order.end_time) : null,
    }),
    [order.start_time, order.end_time],
  );

  const diffMs = targetDate ? targetDate - now : null;
  const timeStatus = targetDate
    ? {
        totalMinutes: Math.floor(diffMs / 60000),
        seconds: Math.floor((diffMs % 60000) / 1000),
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
        <div style={{ flex: 1 }}>
          <div
            style={{ fontWeight: "bold", color: "#C9A84C", fontSize: "16px" }}
          >
            #{order.ID} — {order.table_number}
          </div>
          <div style={{ fontSize: "13px", color: "#9E8B6E", marginTop: "4px" }}>
            {order.items}
          </div>
          {timeStatus && (
            <div
              style={{
                marginTop: "10px",
                padding: "8px",
                background: timeStatus.isOver
                  ? "rgba(224, 82, 82, 0.1)"
                  : "rgba(82, 168, 112, 0.1)",
                borderRadius: "8px",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Clock
                size={14}
                color={timeStatus.isOver ? "#E05252" : "#52A870"}
              />
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: "bold",
                  color: timeStatus.isOver ? "#E05252" : "#F5EDD6",
                }}
              >
                {timeStatus.isOver
                  ? "WAKTU HABIS"
                  : `${timeStatus.totalMinutes}m ${timeStatus.seconds}s lagi`}
              </span>
            </div>
          )}
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontWeight: "bold", fontSize: "16px" }}>
            {fmt(order.total)}
          </div>
          <div style={{ fontSize: "11px", color: "#9E8B6E" }}>{startTime}</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: "10px" }}>{children}</div>
    </div>
  );
};

// --- STYLES & HELPER ---
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
const modalOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(0,0,0,0.9)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 10000,
};
const modalContent = {
  background: "#1A1410",
  border: "1px solid #C9A84C",
  padding: "30px",
  borderRadius: "20px",
  textAlign: "center",
  maxWidth: "400px",
  width: "95%",
};
const inputStyle = {
  width: "100%",
  background: "#251E16",
  border: "1px solid rgba(201,168,76,0.3)",
  padding: "12px",
  borderRadius: "8px",
  color: "#F5EDD6",
  marginBottom: "15px",
  outline: "none",
};
const primaryBtn = {
  width: "100%",
  background: "#C9A84C",
  color: "#0E0B08",
  padding: "12px",
  borderRadius: "8px",
  fontWeight: "bold",
  cursor: "pointer",
  border: "none",
};
const photoPreview = {
  width: "200px",
  height: "200px",
  borderRadius: "15px",
  objectFit: "cover",
  border: "3px solid #C9A84C",
  marginBottom: "15px",
};
const historyItemStyle = {
  display: "flex",
  justifyContent: "space-between",
  padding: "12px 20px",
  background: "rgba(26,20,16,0.4)",
  borderRadius: "8px",
  marginBottom: "10px",
  border: "0.5px solid rgba(158,139,110,0.2)",
  opacity: 0.7,
};

export default Kasir;
