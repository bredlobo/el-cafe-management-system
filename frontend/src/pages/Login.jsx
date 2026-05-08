import React, { useState } from "react";
import { User, Lock, Coffee, ChevronRight } from "lucide-react";

const Login = ({ onLoginSuccess }) => {
  const [role, setRole] = useState("kasir");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // GANTI: localhost dihapus agar otomatis mengikuti domain Vercel
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("userRole", data.role);
        onLoginSuccess(data.role);
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert("Gagal koneksi ke server, Bred!");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.bgDecor} />
      <div style={styles.loginWrapper}>
        <div style={styles.headerArea}>
          <div style={styles.iconCircle}>
            <Coffee size={32} color="#C9A84C" />
          </div>
          <h1 style={styles.title}>EL CAFÉ</h1>
          <p style={styles.subtitle}>Staff Management Portal</p>
        </div>

        <div style={styles.tabContainer}>
          <button
            onClick={() => setRole("kasir")}
            style={role === "kasir" ? styles.activeTab : styles.inactiveTab}
          >
            Kasir
          </button>
          <button
            onClick={() => setRole("owner")}
            style={role === "owner" ? styles.activeTab : styles.inactiveTab}
          >
            Owner
          </button>
        </div>

        <div style={styles.loginCard}>
          <form onSubmit={handleLogin}>
            <div style={styles.inputGroup}>
              <User size={18} style={styles.inputIcon} />
              <input
                type="text"
                placeholder={
                  role === "kasir" ? "Username Kasir" : "Username Owner"
                }
                style={styles.input}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div style={styles.inputGroup}>
              <Lock size={18} style={styles.inputIcon} />
              <input
                type="password"
                placeholder={role === "kasir" ? "PIN Kasir" : "Password Owner"}
                style={styles.input}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" style={styles.btnLogin}>
              MASUK SEKARANG <ChevronRight size={18} />
            </button>
          </form>
        </div>
        <p style={styles.footerText}>© 2026 EL CAFÉ & Billiard System</p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0E0B08",
    position: "relative",
    overflow: "hidden",
  },
  bgDecor: {
    position: "absolute",
    width: "500px",
    height: "500px",
    background:
      "radial-gradient(circle, rgba(201,168,76,0.1) 0%, rgba(0,0,0,0) 70%)",
    top: "-100px",
    right: "-100px",
    zIndex: 0,
  },
  loginWrapper: {
    width: "100%",
    maxWidth: "450px",
    padding: "20px",
    zIndex: 1,
  },
  headerArea: { textAlign: "center", marginBottom: "40px" },
  iconCircle: {
    width: "70px",
    height: "70px",
    background: "rgba(201,168,76,0.05)",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 15px",
    border: "1px solid rgba(201,168,76,0.2)",
  },
  title: {
    fontFamily: "'Playfair Display', serif",
    color: "#C9A84C",
    fontSize: "36px",
    margin: 0,
    letterSpacing: "4px",
  },
  subtitle: {
    color: "#9E8B6E",
    fontSize: "14px",
    marginTop: "5px",
    letterSpacing: "1px",
  },
  tabContainer: {
    display: "flex",
    gap: "10px",
    background: "rgba(255,255,255,0.02)",
    padding: "5px",
    borderRadius: "12px",
    marginBottom: "20px",
    border: "1px solid rgba(255,255,255,0.05)",
  },
  activeTab: {
    flex: 1,
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    background: "#C9A84C",
    color: "#0E0B08",
    fontWeight: "bold",
    cursor: "pointer",
  },
  inactiveTab: {
    flex: 1,
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    background: "transparent",
    color: "#9E8B6E",
    cursor: "pointer",
  },
  loginCard: {
    background: "rgba(26, 20, 16, 0.5)",
    backdropFilter: "blur(10px)",
    padding: "40px",
    borderRadius: "24px",
    border: "1px solid rgba(201, 168, 76, 0.2)",
    boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
  },
  inputGroup: { position: "relative", marginBottom: "20px" },
  inputIcon: {
    position: "absolute",
    left: "15px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#C9A84C",
    opacity: 0.7,
  },
  input: {
    width: "100%",
    padding: "15px 15px 15px 45px",
    borderRadius: "12px",
    border: "1px solid rgba(201,168,76,0.1)",
    background: "#0E0B08",
    color: "#F5EDD6",
    fontSize: "16px",
    outline: "none",
    boxSizing: "border-box",
  },
  btnLogin: {
    width: "100%",
    padding: "16px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(135deg, #C9A84C 0%, #A68A3D 100%)",
    color: "#0E0B08",
    fontWeight: "bold",
    fontSize: "16px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    marginTop: "10px",
    boxShadow: "0 10px 20px rgba(201,168,76,0.2)",
  },
  footerText: {
    textAlign: "center",
    color: "#4A4036",
    fontSize: "12px",
    marginTop: "30px",
  },
};

export default Login;
