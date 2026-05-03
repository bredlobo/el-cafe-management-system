import React, { useState } from "react";
import { menus, tables, billiards } from "../data";
import {
  LayoutGrid,
  Circle,
  AlertTriangle,
  X,
  Minus,
  Plus,
  Clock,
  ChevronRight,
} from "lucide-react";

const Pengunjung = ({ onPlaceOrder }) => {
  // State Management
  const [filter, setFilter] = useState("all");
  const [cart, setCart] = useState({});
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedBilliard, setSelectedBilliard] = useState(null);
  const [billiardHours, setBilliardHours] = useState(1);
  const [showConfirm, setShowConfirm] = useState(false);

  // Status: null (awal), 'pending_payment' (modal buka), 'minimized' (tutup sementara)
  const [orderStatus, setOrderStatus] = useState(null);

  const fmt = (n) => "Rp " + n.toLocaleString("id-ID");

  const addToCart = (id) => {
    setCart((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const confirmClear = () => {
    setCart({});
    setSelectedTable(null);
    setSelectedBilliard(null);
    setBilliardHours(1);
    setShowConfirm(false);
    setOrderStatus(null);
  };

  const calculateTotal = () => {
    const menuTotal = Object.entries(cart).reduce((total, [id, qty]) => {
      const item = menus.find((m) => m.id === parseInt(id));
      return total + (item ? item.price * qty : 0);
    }, 0);

    const billiardTotal = selectedBilliard ? 20000 * billiardHours : 0;
    return menuTotal + billiardTotal;
  };

  const handleCheckout = () => {
    if (Object.keys(cart).length === 0 && !selectedBilliard) {
      alert("Keranjang masih kosong!");
      return;
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

    onPlaceOrder({
      table: tables.find((t) => t.id === selectedTable)?.name || "Take Away",
      items: [menuDetails, billiardDetails].filter(Boolean).join(", "),
      total: calculateTotal(),
      status: "pending_payment",
    });

    setOrderStatus("pending_payment");
  };

  const filteredMenus =
    filter === "all" ? menus : menus.filter((m) => m.cat === filter);

  return (
    <div className="visitor-page" style={{ paddingBottom: "100px" }}>
      {/* 1. FLOATING BAR (Muncul jika modal ditutup sementara) */}
      {orderStatus === "minimized" && (
        <div
          onClick={() => setOrderStatus("pending_payment")}
          style={{
            position: "fixed",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "90%",
            maxWidth: "450px",
            background: "#C9A84C",
            color: "#0E0B08",
            padding: "15px 20px",
            borderRadius: "15px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            zIndex: 1000,
            cursor: "pointer",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Clock size={20} />
            <div>
              <div style={{ fontWeight: "bold", fontSize: "14px" }}>
                Bayar Pesanan Anda
              </div>
              <div style={{ fontSize: "12px", opacity: 0.8 }}>
                Klik untuk lihat instruksi kasir
              </div>
            </div>
          </div>
          <ChevronRight size={20} />
        </div>
      )}

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
        <div
          style={{
            background: "rgba(201,168,76,0.15)",
            border: "0.5px solid #C9A84C",
            color: "#C9A84C",
            fontSize: "11px",
            padding: "4px 12px",
            borderRadius: "20px",
            display: "inline-block",
            marginBottom: "12px",
          }}
        >
          Selamat datang
        </div>
        <h1
          style={{
            fontFamily: "Playfair Display",
            color: "#C9A84C",
            fontSize: "32px",
            margin: "0 0 8px 0",
          }}
        >
          EL Café
        </h1>
        <p style={{ color: "#9E8B6E", fontSize: "14px", margin: 0 }}>
          Pesan minuman, pilih meja atau sewa billiard favoritmu
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
                    color: "#9E8B6E",
                    fontSize: "11px",
                    margin: "4px 0 10px 0",
                  }}
                >
                  {item.desc}
                </div>
                <div
                  style={{
                    color: "#C9A84C",
                    fontWeight: "bold",
                    fontSize: "14px",
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

      {/* TABLE SECTION */}
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
          Pilih Meja
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
            gap: "10px",
          }}
        >
          {tables.map((t) => (
            <div
              key={t.id}
              onClick={() => !t.occupied && setSelectedTable(t.id)}
              className={`tbl-card ${t.occupied ? "occupied" : ""} ${selectedTable === t.id ? "selected" : ""}`}
              style={{
                background: "#251E16",
                border:
                  selectedTable === t.id
                    ? "1px solid #C9A84C"
                    : "0.5px solid rgba(201,168,76,0.3)",
                borderRadius: "8px",
                padding: "12px",
                textAlign: "center",
                opacity: t.occupied ? 0.5 : 1,
                cursor: t.occupied ? "not-allowed" : "pointer",
              }}
            >
              <LayoutGrid
                size={18}
                color={selectedTable === t.id ? "#C9A84C" : "#9E8B6E"}
                style={{ marginBottom: "4px" }}
              />
              <div style={{ fontSize: "12px", color: "#F5EDD6" }}>{t.name}</div>
              <div
                style={{
                  fontSize: "10px",
                  color: t.occupied ? "#E05252" : "#52A870",
                  marginTop: "4px",
                }}
              >
                {t.occupied ? "Terisi" : "Kosong"}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BILLIARD SECTION */}
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
          Sewa Billiard
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: "12px",
          }}
        >
          {billiards?.map((b) => (
            <div
              key={b.id}
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <div
                onClick={() => !b.occupied && setSelectedBilliard(b.id)}
                className={`bil-card ${b.occupied ? "occupied" : ""} ${selectedBilliard === b.id ? "selected" : ""}`}
                style={{
                  background: "#251E16",
                  border:
                    selectedBilliard === b.id
                      ? "1px solid #C9A84C"
                      : "0.5px solid rgba(201,168,76,0.3)",
                  borderRadius: "10px",
                  padding: "16px",
                  textAlign: "center",
                  cursor: b.occupied ? "not-allowed" : "pointer",
                  opacity: b.occupied ? 0.4 : 1,
                }}
              >
                <Circle
                  size={24}
                  color="#C9A84C"
                  style={{ marginBottom: "8px" }}
                />
                <div
                  style={{
                    fontSize: "14px",
                    color: "#F5EDD6",
                    fontWeight: "500",
                  }}
                >
                  {b.name}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#C9A84C",
                    marginTop: "4px",
                  }}
                >
                  {fmt(20000)}/jam
                </div>
              </div>
              {selectedBilliard === b.id && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "15px",
                    background: "rgba(201,168,76,0.1)",
                    padding: "8px",
                    borderRadius: "8px",
                    border: "0.5px dashed #C9A84C",
                  }}
                >
                  <button
                    onClick={() =>
                      setBilliardHours(Math.max(1, billiardHours - 1))
                    }
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#C9A84C",
                      cursor: "pointer",
                    }}
                  >
                    <Minus size={18} />
                  </button>
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: "bold",
                      color: "#F5EDD6",
                    }}
                  >
                    {billiardHours} Jam
                  </span>
                  <button
                    onClick={() => setBilliardHours(billiardHours + 1)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#C9A84C",
                      cursor: "pointer",
                    }}
                  >
                    <Plus size={18} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* --- ORDER SUMMARY (TETAP ADA) --- */}
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
                <span>{tables.find((t) => t.id === selectedTable)?.name}</span>
              </div>
            )}
            {selectedBilliard && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                  color: "#C9A84C",
                }}
              >
                <span>
                  Sewa {billiards.find((b) => b.id === selectedBilliard)?.name}{" "}
                  ({billiardHours} jam)
                </span>
                <span>{fmt(20000 * billiardHours)}</span>
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
              className="btn-pesan"
              onClick={handleCheckout}
              style={{
                width: "100%",
                background: "#C9A84C",
                color: "#0E0B08",
                border: "none",
                padding: "12px",
                borderRadius: "8px",
                marginTop: "16px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Pesan Sekarang
            </button>
            <button
              className="btn-clear"
              onClick={() => setShowConfirm(true)}
              style={{
                width: "100%",
                background: "transparent",
                color: "#9E8B6E",
                border: "0.5px solid rgba(201,168,76,0.3)",
                padding: "10px",
                borderRadius: "8px",
                marginTop: "8px",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              Bersihkan Pesanan
            </button>
          </div>
        </div>
      )}

      {/* --- MODAL INSTRUKSI PEMBAYARAN (DENGAN TOMBOL TUTUP) --- */}
      {orderStatus === "pending_payment" && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(6px)",
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
              borderRadius: "20px",
              padding: "30px",
              maxWidth: "360px",
              width: "90%",
              textAlign: "center",
              position: "relative",
            }}
          >
            {/* Tombol X Pojok Kanan */}
            <button
              onClick={() => setOrderStatus("minimized")}
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                background: "transparent",
                border: "none",
                color: "#9E8B6E",
                cursor: "pointer",
              }}
            >
              <X size={20} />
            </button>

            <div style={{ fontSize: "50px", marginBottom: "15px" }}>💳</div>
            <h3
              style={{
                color: "#C9A84C",
                fontFamily: "Playfair Display",
                fontSize: "24px",
                marginBottom: "10px",
              }}
            >
              Selesaikan Pembayaran
            </h3>
            <p
              style={{
                color: "#9E8B6E",
                fontSize: "14px",
                marginBottom: "20px",
              }}
            >
              Silakan tunjukkan layar ini ke Kasir untuk memproses pesanan Anda
              sebesar:
            </p>
            <div
              style={{
                background: "rgba(201,168,76,0.1)",
                border: "1px dashed #C9A84C",
                padding: "15px",
                borderRadius: "12px",
                fontSize: "28px",
                fontWeight: "bold",
                color: "#C9A84C",
                marginBottom: "20px",
              }}
            >
              {fmt(calculateTotal())}
            </div>

            <div
              style={{
                fontSize: "12px",
                color: "#F5EDD6",
                background: "#251E16",
                padding: "10px",
                borderRadius: "8px",
                marginBottom: "20px",
              }}
            >
              ⏳ Menunggu konfirmasi pembayaran...
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <button
                onClick={() => setOrderStatus("minimized")}
                style={{
                  width: "100%",
                  background: "#C9A84C",
                  color: "#0E0B08",
                  border: "none",
                  padding: "12px",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Tutup Sementara
              </button>
              <button
                onClick={() => {
                  if (window.confirm("Batalkan pesanan?")) setOrderStatus(null);
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#E05252",
                  textDecoration: "underline",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                Batalkan Pesanan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL KONFIRMASI HAPUS (TETAP ADA) --- */}
      {showConfirm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0, 0, 0, 0.75)",
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
                marginBottom: "28px",
              }}
            >
              Tindakan ini akan mengosongkan semua menu, meja, dan pilihan
              billiard yang sudah Anda pilih.
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
