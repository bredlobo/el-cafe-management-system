import React, { useState } from "react";
import { menus, tables, billiards } from "../data";
import { LayoutGrid, Circle, AlertTriangle, Minus, Plus } from "lucide-react";

const Pengunjung = ({ onPlaceOrder, activeOrders = [] }) => {
  // === STATE MANAGEMENT ===
  const [filter, setFilter] = useState("all");
  const [cart, setCart] = useState({});
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedBilliard, setSelectedBilliard] = useState(null);
  const [billiardHours, setBilliardHours] = useState(1);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [memberPhone, setMemberPhone] = useState(""); // <-- State baru untuk simpan No HP

  const fmt = (n) => "Rp " + n.toLocaleString("id-ID");

  // === LOGIKA WAKTU OTOMATIS ===
  const getRequestedTimeRange = () => {
    const start = new Date();
    let end = null;
    if (selectedBilliard) {
      end = new Date(start.getTime());
      end.setHours(end.getHours() + billiardHours);
    }
    return { start, end };
  };

  const { start: reqStart, end: reqEnd } = getRequestedTimeRange();

  // === FUNGSI CEK KETERSEDIAAN MEJA/BILLIARD ===
  const checkAvailability = (itemName, isBilliard = false) => {
    const overlappingOrders = activeOrders.filter((order) => {
      if (order.status === "completed" || order.status === "cancelled")
        return false;

      const isThisItem = isBilliard
        ? order.items && order.items.includes(itemName)
        : order.table_number === itemName;

      if (!isThisItem) return false;

      return ["pending", "pending_payment", "paid", "served"].includes(
        order.status,
      );
    });

    return overlappingOrders.length === 0;
  };

  const addToCart = (id) => {
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const confirmClear = () => {
    setCart({});
    setSelectedTable(null);
    setSelectedBilliard(null);
    setBilliardHours(1);
    setShowConfirm(false);
    setIsMember(false); // Reset member juga saat dibersihkan
    setMemberPhone("");
  };

// === FUNGSI VALIDASI MEMBER ASLI KE DATABASE ===
 const handleToggleMember = async () => {
  if (isMember) {
    setIsMember(false);
    setMemberPhone("");
  } else {
    const phone = window.prompt("Masukkan Nomor HP Member Anda yang terdaftar:");
    if (phone && phone.trim() !== "") {
      try {
        // GANTI: hapus localhost
        const response = await fetch(`/api/members/${phone}`);
        const data = await response.json();
        if (response.ok && data.is_active) {
          setIsMember(true);
          setMemberPhone(phone);
          alert(`Selamat Datang, ${data.member.full_name}!`);
        } else {
          alert("Member tidak terdaftar atau sudah expired.");
        }
      } catch (err) { alert("Gagal menghubungi server."); }
    }
  }
};

  // === LOGIKA HARGA DINAMIS (MEMBER VS NON-MEMBER) ===
  const getCurrentBilliardPrice = () => {
    if (!selectedBilliard) return 0;

    const now = new Date();
    const hour = now.getHours();
    const table = billiards.find((b) => b.id === selectedBilliard);

    if (isMember) {
      // Happy Hour: 14:00 - 17:00 (2 siang - 5 sore) harga 20k
      if (hour >= 14 && hour < 17) return 20000;
      // Di luar jam itu harga 25k
      return 25000;
    }

    return table ? table.price : 40000;
  };

  const calculateTotal = () => {
    const menuTotal = Object.entries(cart).reduce((total, [id, qty]) => {
      const item = menus.find((m) => m.id === parseInt(id));
      return total + (item ? item.price * qty : 0);
    }, 0);

    const billiardPrice = getCurrentBilliardPrice();
    const billiardTotal = billiardPrice * billiardHours;

    return menuTotal + billiardTotal; // Meja seating gratis
  };

  // === FUNGSI KIRIM PESANAN KE KASIR ===
  const handleCheckout = () => {
    if (Object.keys(cart).length === 0 && !selectedBilliard) {
      alert("Keranjang masih kosong!");
      return;
    }

    const existingOrder = activeOrders.find(
      (o) =>
        o.table_number ===
          (tables.find((t) => t.id === selectedTable)?.name || "Take Away") &&
        ["pending", "paid", "served"].includes(o.status),
    );

    let infoMessage = "Pesanan berhasil dikirim ke Kasir!";
    if (existingOrder) {
      infoMessage = `Item tambahan telah dikirim untuk Meja ${existingOrder.table_number} (Order #${existingOrder.ID}).`;
    }

    const menuDetails = Object.entries(cart)
      .map(([id, qty]) => {
        const item = menus.find((m) => m.id === parseInt(id));
        return item ? `${item.name} x${qty}` : "";
      })
      .filter(Boolean)
      .join(", ");

    const billiardDetails = selectedBilliard
      ? `${billiards.find((b) => b.id === selectedBilliard)?.name} (${billiardHours} jam)`
      : "";

    // === INI TAMBAHANNYA: KASIH TAHU KASIR KALAU INI MEMBER ===
    const memberDetails = isMember ? `[MEMBER: ${memberPhone}]` : "";

    onPlaceOrder({
      table: tables.find((t) => t.id === selectedTable)?.name || "Take Away",
      // Semua info (Member, Menu, Billiard) digabung jadi 1 teks panjang untuk Kasir
      items: [memberDetails, menuDetails, billiardDetails]
        .filter(Boolean)
        .join(" | "),
      total: calculateTotal(),
      status: "pending",
      start_time: reqStart.toISOString(),
      end_time: reqEnd ? reqEnd.toISOString() : null,
    });

    confirmClear();
    console.log(infoMessage);
  };

  const filteredMenus =
    filter === "all" ? menus : menus.filter((m) => m.cat === filter);

  return (
    <div className="visitor-page" style={{ paddingBottom: "100px" }}>
      {/* HERO SECTION */}
      <div
        className="hero-card"
        style={{
          background: "#1A1410",
          border: "0.5px solid rgba(201,168,76,0.3)",
          borderRadius: "12px",
          padding: "32px 20px",
          textAlign: "center",
          marginBottom: "20px",
        }}
      >
        <h1
          style={{
            fontFamily: "Playfair Display",
            color: "#C9A84C",
            fontSize: "32px",
            margin: "0 0 8px 0",
          }}
        >
          EL BILLIARD & CAFE
        </h1>
        <p style={{ color: "#9E8B6E", fontSize: "14px", margin: 0 }}>
          Silakan pilih menu, meja, atau billiard favoritmu.
        </p>
      </div>

      {/* MENU SECTION */}
      <div
        className="section-card"
        style={{
          background: "#1A1410",
          border: "0.5px solid rgba(201,168,76,0.3)",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "20px",
        }}
      >
        <h3
          style={{
            color: "#C9A84C",
            fontFamily: "Playfair Display",
            marginBottom: "16px",
          }}
        >
          Menu
        </h3>
        <div
          style={{
            display: "flex",
            gap: "8px",
            marginBottom: "20px",
            flexWrap: "wrap",
          }}
        >
          {["all", "coffee", "noncoffee", "snack"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`mf-btn ${filter === cat ? "active" : ""}`}
            >
              {cat === "all"
                ? "Semua"
                : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: "12px",
          }}
        >
          {filteredMenus.map((item) => {
            const qty = cart[item.id] || 0;
            return (
              <div
                key={item.id}
                className={`menu-item-card ${qty > 0 ? "selected" : ""}`}
                onClick={() => addToCart(item.id)}
              >
                <div style={{ fontSize: "24px", marginBottom: "10px" }}>
                  {item.icon}
                </div>
                <div
                  style={{
                    fontWeight: "500",
                    color: "#F5EDD6",
                    fontSize: "14px",
                  }}
                >
                  {item.name}
                </div>
                <div
                  style={{
                    color: "#C9A84C",
                    fontWeight: "bold",
                    fontSize: "14px",
                    marginTop: "8px",
                  }}
                >
                  {fmt(item.price)}
                </div>
                <div className={`qty-badge ${qty > 0 ? "has-qty" : ""}`}>
                  {qty > 0 ? qty : "+"}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* TABLE SECTION (FREE SEATING) */}
      <div
        className="section-card"
        style={{
          background: "#1A1410",
          border: "0.5px solid rgba(201,168,76,0.3)",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "20px",
        }}
      >
        <h3
          style={{
            color: "#C9A84C",
            fontFamily: "Playfair Display",
            marginBottom: "16px",
          }}
        >
          Pilih Meja (Gratis)
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
            gap: "10px",
          }}
        >
          {tables.map((t) => {
            const isAvailable = checkAvailability(t.name, false);
            return (
              <div
                key={t.id}
                onClick={() => isAvailable && setSelectedTable(t.id)}
                className={`tbl-card ${!isAvailable ? "occupied" : ""} ${selectedTable === t.id ? "selected" : ""}`}
                style={{
                  background: "#251E16",
                  border:
                    selectedTable === t.id
                      ? "1px solid #C9A84C"
                      : "0.5px solid rgba(201,168,76,0.3)",
                  borderRadius: "8px",
                  padding: "12px",
                  textAlign: "center",
                  opacity: !isAvailable ? 0.5 : 1,
                  cursor: !isAvailable ? "not-allowed" : "pointer",
                }}
              >
                <LayoutGrid
                  size={18}
                  color={selectedTable === t.id ? "#C9A84C" : "#9E8B6E"}
                />
                <div style={{ fontSize: "12px", color: "#F5EDD6" }}>
                  {t.name}
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    color: !isAvailable ? "#E05252" : "#52A870",
                    marginTop: "4px",
                  }}
                >
                  {!isAvailable ? "Terisi" : "Kosong"}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* BILLIARD SECTION */}
      <div
        className="section-card"
        style={{
          background: "#1A1410",
          padding: "20px",
          borderRadius: "12px",
          border: "0.5px solid rgba(201,168,76,0.3)",
        }}
      >
        <h3
          style={{
            color: "#C9A84C",
            fontFamily: "Playfair Display",
            marginBottom: "16px",
          }}
        >
          Sewa Billiard
        </h3>

        {/* === TOMBOL MEMBER YANG BARU === */}
        <button
          onClick={handleToggleMember}
          style={{
            marginBottom: "20px",
            background: isMember ? "#52A870" : "transparent",
            border: "1px solid #C9A84C",
            color: "white",
            padding: "10px 16px",
            borderRadius: "8px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "14px",
            fontWeight: "bold",
          }}
        >
          {isMember
            ? `✓ Member Aktif (${memberPhone})`
            : "Aktifkan Harga Member"}
        </button>

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr", gap: "12px" }}
        >
          {billiards.map((b) => {
            const isAvailable = checkAvailability(b.name, true);
            const isSelected = selectedBilliard === b.id;
            const currentPrice = isMember
              ? new Date().getHours() >= 14 && new Date().getHours() < 17
                ? 20000
                : 25000
              : b.price;

            return (
              <div
                key={b.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  padding: "16px",
                  background: "#251E16",
                  borderRadius: "10px",
                  border: isSelected
                    ? "1px solid #C9A84C"
                    : "0.5px solid rgba(201,168,76,0.2)",
                  opacity: isAvailable ? 1 : 0.5,
                }}
              >
                <div
                  onClick={() => isAvailable && setSelectedBilliard(b.id)}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: isAvailable ? "pointer" : "not-allowed",
                  }}
                >
                  <div>
                    <div
                      style={{
                        color: "#F5EDD6",
                        fontWeight: "bold",
                        fontSize: "16px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <Circle size={18} color="#C9A84C" /> {b.name}
                    </div>
                    {b.type === "VIP" && (
                      <span
                        style={{
                          fontSize: "10px",
                          color: "#0E0B08",
                          background: "#C9A84C",
                          padding: "3px 8px",
                          borderRadius: "4px",
                          fontWeight: "bold",
                          marginTop: "6px",
                          display: "inline-block",
                        }}
                      >
                        VIP + KARAOKE
                      </span>
                    )}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        color: "#C9A84C",
                        fontWeight: "bold",
                        fontSize: "16px",
                      }}
                    >
                      {fmt(currentPrice)}
                      <span
                        style={{
                          fontSize: "12px",
                          color: "#9E8B6E",
                          fontWeight: "normal",
                        }}
                      >
                        /jam
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: isAvailable ? "#52A870" : "#E05252",
                        marginTop: "4px",
                        fontWeight: "bold",
                      }}
                    >
                      {isAvailable ? "Tersedia" : "Sedang Digunakan"}
                    </div>
                  </div>
                </div>

                {/* Kontrol Jam Billiard (Muncul kalau dipilih) */}
                {isSelected && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "20px",
                      background: "rgba(201,168,76,0.1)",
                      padding: "12px",
                      borderRadius: "8px",
                      border: "0.5px dashed #C9A84C",
                      marginTop: "10px",
                    }}
                  >
                    <button
                      onClick={() =>
                        setBilliardHours(Math.max(1, billiardHours - 1))
                      }
                      style={{
                        background: "#1A1410",
                        border: "1px solid #C9A84C",
                        color: "#C9A84C",
                        cursor: "pointer",
                        padding: "6px",
                        borderRadius: "6px",
                        display: "flex",
                      }}
                    >
                      <Minus size={16} />
                    </button>
                    <span
                      style={{
                        fontSize: "16px",
                        fontWeight: "bold",
                        color: "#F5EDD6",
                      }}
                    >
                      {billiardHours} Jam
                    </span>
                    <button
                      onClick={() => setBilliardHours(billiardHours + 1)}
                      style={{
                        background: "#1A1410",
                        border: "1px solid #C9A84C",
                        color: "#C9A84C",
                        cursor: "pointer",
                        padding: "6px",
                        borderRadius: "6px",
                        display: "flex",
                      }}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* RINGKASAN PESANAN */}
      {(Object.keys(cart).length > 0 || selectedTable || selectedBilliard) && (
        <div
          className="order-summary"
          style={{
            background: "#1A1410",
            border: "1px solid #C9A84C",
            borderRadius: "12px",
            padding: "20px",
            marginTop: "20px",
          }}
        >
          <h4
            style={{
              color: "#C9A84C",
              fontFamily: "Playfair Display",
              marginBottom: "12px",
            }}
          >
            Ringkasan Pesanan
          </h4>
          <div style={{ fontSize: "14px", color: "#F5EDD6" }}>
            {Object.entries(cart).map(([id, qty]) => {
              const item = menus.find((m) => m.id === parseInt(id));
              return (
                item && (
                  <div
                    key={id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                    }}
                  >
                    <span>
                      {item.name} x{qty}
                    </span>
                    <span>{fmt(item.price * qty)}</span>
                  </div>
                )
              );
            })}

            {selectedTable && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                  color: "#9E8B6E",
                }}
              >
                <span>Meja</span>
                <span>
                  {tables.find((t) => t.id === selectedTable)?.name} (Gratis)
                </span>
              </div>
            )}

            {selectedBilliard && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                  color: "#C9A84C",
                  fontWeight: "500",
                }}
              >
                <span>
                  {billiards.find((b) => b.id === selectedBilliard)?.name} (
                  {billiardHours} jam)
                </span>
                <span>{fmt(getCurrentBilliardPrice() * billiardHours)}</span>
              </div>
            )}

            <div
              style={{
                borderTop: "1px solid rgba(201,168,76,0.3)",
                paddingTop: "12px",
                marginTop: "12px",
                display: "flex",
                justifyContent: "space-between",
                fontWeight: "bold",
                fontSize: "18px",
                color: "#C9A84C",
              }}
            >
              <span>Total</span>
              <span>{fmt(calculateTotal())}</span>
            </div>

            <button
              onClick={handleCheckout}
              style={{
                width: "100%",
                background: "#C9A84C",
                color: "#0E0B08",
                border: "none",
                padding: "14px",
                borderRadius: "8px",
                marginTop: "16px",
                fontWeight: "bold",
                fontSize: "15px",
                cursor: "pointer",
              }}
            >
              Kirim Pesanan ke Kasir
            </button>
            <button
              onClick={() => setShowConfirm(true)}
              style={{
                width: "100%",
                background: "transparent",
                color: "#E05252",
                border: "1px solid rgba(224, 82, 82, 0.3)",
                padding: "10px",
                borderRadius: "8px",
                marginTop: "10px",
                fontSize: "13px",
                cursor: "pointer",
                fontWeight: "500",
              }}
            >
              Bersihkan Pesanan
            </button>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS */}
      {showConfirm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "#1A1410",
              border: "1px solid #C9A84C",
              borderRadius: "16px",
              padding: "24px",
              maxWidth: "340px",
              width: "90%",
              textAlign: "center",
            }}
          >
            <div style={{ color: "#E05252", marginBottom: "16px" }}>
              <AlertTriangle size={54} style={{ margin: "0 auto" }} />
            </div>
            <h3
              style={{
                color: "#C9A84C",
                fontFamily: "Playfair Display",
                fontSize: "22px",
                marginBottom: "12px",
              }}
            >
              Hapus Pesanan?
            </h3>
            <p
              style={{
                color: "#9E8B6E",
                fontSize: "14px",
                marginBottom: "20px",
              }}
            >
              Semua pilihan menu dan meja akan direset.
            </p>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setShowConfirm(false)}
                style={{
                  flex: 1,
                  padding: "14px",
                  borderRadius: "10px",
                  border: "1px solid rgba(201,168,76,0.2)",
                  background: "transparent",
                  color: "#F5EDD6",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                Batal
              </button>
              <button
                onClick={confirmClear}
                style={{
                  flex: 1,
                  padding: "14px",
                  borderRadius: "10px",
                  border: "none",
                  background: "#E05252",
                  color: "white",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pengunjung;
