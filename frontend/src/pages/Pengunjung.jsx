import React, { useState } from "react";
import { menus, tables, billiards } from "../data";
import {
  LayoutGrid,
  Circle,
  AlertTriangle,
  Minus,
  Plus,
} from "lucide-react";

const Pengunjung = ({ onPlaceOrder, activeOrders = [] }) => {
  // State Management
  const [filter, setFilter] = useState("all");
  const [cart, setCart] = useState({});
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedBilliard, setSelectedBilliard] = useState(null);
  const [billiardHours, setBilliardHours] = useState(1);
  const [showConfirm, setShowConfirm] = useState(false);

  const fmt = (n) => "Rp " + n.toLocaleString("id-ID");

  // === 1. LOGIKA WAKTU OTOMATIS (HANYA UNTUK SEKARANG) ===
  const getRequestedTimeRange = () => {
    const start = new Date();
    let end = null;
    
    // End Time hanya dihitung jika user menyewa Billiard
    if (selectedBilliard) {
      end = new Date(start.getTime());
      end.setHours(end.getHours() + billiardHours);
    }
    return { start, end };
  };

  const { start: reqStart, end: reqEnd } = getRequestedTimeRange();

  // === 2. FUNGSI CEK KETERSEDIAAN (Fix Zombie Table) ===
  const checkAvailability = (itemName, isBilliard = false) => {
    const overlappingOrders = activeOrders.filter(order => {
      // Jika status Selesai atau Batal, Meja/Billiard dianggap Kosong
      if (order.status === 'completed' || order.status === 'cancelled') return false;

      // Cek apakah item ini yang sedang dicek
      const isThisItem = isBilliard 
        ? (order.items && order.items.includes(itemName)) 
        : (order.table_number === itemName);
      
      if (!isThisItem) return false;

      // Langsung blokir jika status sedang aktif (Pending/Paid/Served)
      return ['pending', 'pending_payment', 'paid', 'served'].includes(order.status);
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
      // Alert untuk validasi kosong bisa tetap ada agar user tahu kenapa tidak bisa pesan
      alert("Keranjang masih kosong!"); 
      return;
    }

    const menuDetails = Object.entries(cart)
      .map(([id, qty]) => {
        const item = menus.find((m) => m.id === parseInt(id));
        return item ? `${item.name} x${qty}` : "";
      }).filter(Boolean).join(", ");

    const billiardDetails = selectedBilliard
      ? `${billiards.find((b) => b.id === selectedBilliard)?.name} (${billiardHours} jam)`
      : "";

    // 1. Tembak fungsi addOrder di App.jsx
    onPlaceOrder({
      table: tables.find((t) => t.id === selectedTable)?.name || "Take Away",
      items: [menuDetails, billiardDetails].filter(Boolean).join(", "),
      total: calculateTotal(),
      status: "pending",
      start_time: reqStart.toISOString(),
      end_time: reqEnd ? reqEnd.toISOString() : null,
    });

    // 2. Bersihkan pilihan meja & menu di HP pelanggan (Hapus Alert di sini)
    confirmClear(); 
  };

  const filteredMenus = filter === "all" ? menus : menus.filter((m) => m.cat === filter);

  return (
    <div className="visitor-page" style={{ paddingBottom: "100px" }}>
      {/* HERO SECTION */}
      <div className="hero-card" style={{ background: "#1A1410", border: "0.5px solid rgba(201,168,76,0.3)", borderRadius: "12px", padding: "32px 20px", textAlign: "center", marginBottom: "20px" }}>
        <h1 style={{ fontFamily: "Playfair Display", color: "#C9A84C", fontSize: "32px", margin: "0 0 8px 0" }}>EL Café</h1>
        <p style={{ color: "#9E8B6E", fontSize: "14px", margin: 0 }}>Silakan pilih menu, meja, atau billiard favoritmu.</p>
      </div>

      {/* MENU SECTION */}
      <div className="section-card" style={{ background: "#1A1410", border: "0.5px solid rgba(201,168,76,0.3)", borderRadius: "12px", padding: "20px", marginBottom: "20px" }}>
        <h3 style={{ color: "#C9A84C", fontFamily: "Playfair Display", marginBottom: "16px" }}>Menu</h3>
        <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
          {["all", "coffee", "noncoffee", "snack"].map((cat) => (
            <button key={cat} onClick={() => setFilter(cat)} className={`mf-btn ${filter === cat ? "active" : ""}`}>{cat === "all" ? "Semua" : cat.charAt(0).toUpperCase() + cat.slice(1)}</button>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "12px" }}>
          {filteredMenus.map((item) => {
            const qty = cart[item.id] || 0;
            return (
              <div key={item.id} className={`menu-item-card ${qty > 0 ? "selected" : ""}`} onClick={() => addToCart(item.id)}>
                <div style={{ fontSize: "24px", marginBottom: "10px" }}>{item.icon}</div>
                <div style={{ fontWeight: "500", color: "#F5EDD6", fontSize: "14px" }}>{item.name}</div>
                <div style={{ color: "#C9A84C", fontWeight: "bold", fontSize: "14px", marginTop: "8px" }}>{fmt(item.price)}</div>
                <div className={`qty-badge ${qty > 0 ? "has-qty" : ""}`}>{qty > 0 ? qty : "+"}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="section-card" style={{ background: "#1A1410", border: "0.5px solid rgba(201,168,76,0.3)", borderRadius: "12px", padding: "20px", marginBottom: "20px" }}>
        <h3 style={{ color: "#C9A84C", fontFamily: "Playfair Display", marginBottom: "16px" }}>Pilih Meja</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: "10px" }}>
          {tables.map((t) => {
            const isAvailable = checkAvailability(t.name, false); 
            return (
              <div key={t.id} onClick={() => isAvailable && setSelectedTable(t.id)} className={`tbl-card ${!isAvailable ? "occupied" : ""} ${selectedTable === t.id ? "selected" : ""}`} style={{ background: "#251E16", border: selectedTable === t.id ? "1px solid #C9A84C" : "0.5px solid rgba(201,168,76,0.3)", borderRadius: "8px", padding: "12px", textAlign: "center", opacity: !isAvailable ? 0.5 : 1, cursor: !isAvailable ? "not-allowed" : "pointer" }}>
                <LayoutGrid size={18} color={selectedTable === t.id ? "#C9A84C" : "#9E8B6E"} />
                <div style={{ fontSize: "12px", color: "#F5EDD6" }}>{t.name}</div>
                <div style={{ fontSize: "10px", color: !isAvailable ? "#E05252" : "#52A870", marginTop: "4px" }}>{!isAvailable ? "Terisi" : "Kosong"}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* BILLIARD SECTION */}
      <div className="section-card" style={{ background: "#1A1410", border: "0.5px solid rgba(201,168,76,0.3)", borderRadius: "12px", padding: "20px", marginBottom: "20px" }}>
        <h3 style={{ color: "#C9A84C", fontFamily: "Playfair Display", marginBottom: "16px" }}>Sewa Billiard</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "12px" }}>
          {billiards?.map((b) => {
            const isAvailable = checkAvailability(b.name, true); 
            return (
              <div key={b.id}>
                <div onClick={() => isAvailable && setSelectedBilliard(b.id)} className={`bil-card ${!isAvailable ? "occupied" : ""} ${selectedBilliard === b.id ? "selected" : ""}`} style={{ background: "#251E16", border: selectedBilliard === b.id ? "1px solid #C9A84C" : "0.5px solid rgba(201,168,76,0.3)", borderRadius: "10px", padding: "16px", textAlign: "center", cursor: !isAvailable ? "not-allowed" : "pointer", opacity: !isAvailable ? 0.4 : 1 }}>
                  <Circle size={24} color="#C9A84C" style={{ marginBottom: "8px" }} />
                  <div style={{ fontSize: "14px", color: "#F5EDD6" }}>{b.name}</div>
                  <div style={{ fontSize: "12px", color: !isAvailable ? "#E05252" : "#C9A84C", marginTop: "4px" }}>{!isAvailable ? "Penuh" : `${fmt(20000)}/jam`}</div>
                </div>
                {selectedBilliard === b.id && (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "15px", background: "rgba(201,168,76,0.1)", padding: "8px", borderRadius: "8px", border: "0.5px dashed #C9A84C", marginTop: "8px" }}>
                    <button onClick={() => setBilliardHours(Math.max(1, billiardHours - 1))} style={{ background: "transparent", border: "none", color: "#C9A84C", cursor: "pointer" }}><Minus size={18} /></button>
                    <span style={{ fontSize: "14px", fontWeight: "bold", color: "#F5EDD6" }}>{billiardHours} Jam</span>
                    <button onClick={() => setBilliardHours(billiardHours + 1)} style={{ background: "transparent", border: "none", color: "#C9A84C", cursor: "pointer" }}><Plus size={18} /></button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* RINGKASAN PESANAN */}
      {(Object.keys(cart).length > 0 || selectedTable || selectedBilliard) && (
        <div className="order-summary" style={{ background: "#1A1410", border: "1px solid #C9A84C", borderRadius: "12px", padding: "20px", marginTop: "20px" }}>
          <h4 style={{ color: "#C9A84C", fontFamily: "Playfair Display", marginBottom: "12px" }}>Ringkasan Pesanan</h4>
          <div style={{ fontSize: "14px", color: "#F5EDD6" }}>
            {Object.entries(cart).map(([id, qty]) => {
              const item = menus.find((m) => m.id === parseInt(id));
              return item && <div key={id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}><span>{item.name} x{qty}</span><span>{fmt(item.price * qty)}</span></div>;
            })}
            {selectedTable && <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", color: "#9E8B6E" }}><span>Meja</span><span>{tables.find((t) => t.id === selectedTable)?.name}</span></div>}
            {selectedBilliard && <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", color: "#C9A84C" }}><span>{billiards.find(b => b.id === selectedBilliard)?.name} ({billiardHours} jam)</span><span>{fmt(20000 * billiardHours)}</span></div>}
            <div style={{ borderTop: "1px solid rgba(201,168,76,0.3)", paddingTop: "12px", marginTop: "12px", display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "18px", color: "#C9A84C" }}><span>Total</span><span>{fmt(calculateTotal())}</span></div>
            <button onClick={handleCheckout} style={{ width: "100%", background: "#C9A84C", color: "#0E0B08", border: "none", padding: "12px", borderRadius: "8px", marginTop: "16px", fontWeight: "bold", cursor: "pointer" }}>Pesan Sekarang</button>
            <button onClick={() => setShowConfirm(true)} style={{ width: "100%", background: "transparent", color: "#9E8B6E", border: "0.5px solid rgba(201,168,76,0.3)", padding: "10px", borderRadius: "8px", marginTop: "8px", fontSize: "12px", cursor: "pointer" }}>Bersihkan Pesanan</button>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS */}
      {showConfirm && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0, 0, 0, 0.75)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div style={{ background: "#1A1410", border: "1px solid #C9A84C", borderRadius: "16px", padding: "24px", maxWidth: "340px", width: "90%", textAlign: "center" }}>
            <div style={{ color: "#E05252", marginBottom: "16px" }}><AlertTriangle size={54} style={{ margin: "0 auto" }} /></div>
            <h3 style={{ color: "#C9A84C", fontFamily: "Playfair Display", fontSize: "22px", marginBottom: "12px" }}>Hapus Pesanan?</h3>
            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={() => setShowConfirm(false)} style={{ flex: 1, padding: "14px", borderRadius: "10px", border: "1px solid rgba(201,168,76,0.2)", background: "transparent", color: "#F5EDD6", cursor: "pointer" }}>Batal</button>
              <button onClick={confirmClear} style={{ flex: 1, padding: "14px", borderRadius: "10px", border: "none", background: "#E05252", color: "white", fontWeight: "bold", cursor: "pointer" }}>Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pengunjung;