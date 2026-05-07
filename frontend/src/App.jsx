import React, { useState, useEffect } from "react";
import Pengunjung from "./pages/Pengunjung";
import Kasir from "./pages/Kasir";
import Login from "./pages/Login";
import Owner from "./pages/owner/index";

function App() {
  const [view, setView] = useState("pengunjung");
  const [orders, setOrders] = useState([]);

  // === STATE BARU: UNTUK MODAL SUKSES ===
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);

  useEffect(() => {
    const fetchData = () => {
      fetch("http://localhost:8080/api/orders")
        .then((response) => {
          if (!response.ok) throw new Error("Gagal konek ke API");
          return response.json();
        })
        .then((data) => setOrders(data || []))
        .catch((error) => console.error("Gagal ambil data:", error));
    };

    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  // === FUNGSI: MENGIRIM PESANAN KE MYSQL ===
  const addOrder = (newOrder) => {
    const payload = {
      table_number: newOrder.table || newOrder.table_number || "Take Away",
      items: Array.isArray(newOrder.items)
        ? newOrder.items.join(", ")
        : newOrder.items || "Tidak ada item",
      total: Number(newOrder.total) || 0,
      status: "pending",
      start_time: newOrder.start_time,
      end_time: newOrder.end_time,
    };

    fetch("http://localhost:8080/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (!response.ok) throw new Error("Gagal menyimpan ke database");
        return response.json();
      })
      .then((savedData) => {
        // 1. Simpan ID ke localStorage
        localStorage.setItem("last_order_id", savedData.ID);

        // 2. Set data untuk memunculkan CUSTOM MODAL
        setLastOrder(savedData);
        setShowSuccess(true);

        // 3. Tarik ulang data (GET) untuk sinkronisasi
        return fetch("http://localhost:8080/api/orders");
      })
      .then((res) => res.json())
      .then((latestData) => {
        setOrders(latestData || []);
      })
      .catch((error) => {
        console.error("Gagal:", error);
        // alert untuk error boleh tetap ada atau ganti modal error nanti
      });
  };

  return (
    <div
      style={{ minHeight: "100vh", background: "#0E0B08", color: "#F5EDD6" }}
    >
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "12px" }}>
        {/* NAVBAR */}
        <nav
          style={{
            padding: "20px",
            background: "#1A1410",
            border: "0.5px solid rgba(201,168,76,0.3)",
            borderRadius: "12px",
            marginBottom: "16px",
            textAlign: "center",
            position: "relative",
          }}
        >
          <div
            style={{
              fontFamily: "Playfair Display",
              fontSize: "22px",
              color: "#C9A84C",
            }}
          >
            EL CAFÉ{" "}
            <span style={{ fontSize: "14px", opacity: 0.7, color: "#F5EDD6" }}>
              & Billiard
            </span>
          </div>
          <button
            onClick={() =>
              setView(view === "pengunjung" ? "login" : "pengunjung")
            }
            style={{
              position: "absolute",
              right: "20px",
              top: "25px",
              opacity: 0.5,
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "20px",
            }}
          >
            🔑
          </button>
        </nav>

        {/* TAMPILAN DINAMIS */}
        <main>
          {view === "pengunjung" && (
            <Pengunjung onPlaceOrder={addOrder} activeOrders={orders} />
          )}
          {view === "login" && (
            <Login onLoginSuccess={(role) => setView(role)} />
          )}
          {view === "kasir" && <Kasir orders={orders} setOrders={setOrders} />}
          {view === "owner" && <Owner orders={orders} />}
        </main>

        {/* === CUSTOM SUCCESS MODAL === */}
        {showSuccess && lastOrder && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(0, 0, 0, 0.85)",
              backdropFilter: "blur(8px)",
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
                borderRadius: "24px",
                padding: "40px 30px",
                maxWidth: "400px",
                width: "90%",
                textAlign: "center",
                animation: "modalIn 0.4s ease-out",
              }}
            >
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  background: "rgba(201,168,76,0.1)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                }}
              >
                <span style={{ fontSize: "40px" }}>☕</span>
              </div>
              <h2
                style={{
                  fontFamily: "Playfair Display",
                  color: "#C9A84C",
                  fontSize: "24px",
                  marginBottom: "10px",
                }}
              >
                Pesanan Berhasil!
              </h2>
              <p
                style={{
                  color: "#9E8B6E",
                  fontSize: "14px",
                  marginBottom: "25px",
                }}
              >
                Silakan tunjukkan nomor pesanan ini ke kasir untuk proses
                pembayaran.
              </p>
              <div
                style={{
                  background: "rgba(201,168,76,0.1)",
                  border: "1px dashed #C9A84C",
                  padding: "15px",
                  borderRadius: "12px",
                  marginBottom: "30px",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    color: "#C9A84C",
                    textTransform: "uppercase",
                    letterSpacing: "2px",
                    marginBottom: "5px",
                  }}
                >
                  ID Pesanan
                </div>
                <div
                  style={{
                    fontSize: "32px",
                    fontWeight: "bold",
                    color: "#F5EDD6",
                  }}
                >
                  #{lastOrder.ID}
                </div>
              </div>
              <button
                onClick={() => setShowSuccess(false)}
                style={{
                  width: "100%",
                  background: "#C9A84C",
                  color: "#0E0B08",
                  border: "none",
                  padding: "14px",
                  borderRadius: "12px",
                  fontWeight: "bold",
                  fontSize: "16px",
                  cursor: "pointer",
                }}
              >
                Oke, Siap!
              </button>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes modalIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}

export default App;
