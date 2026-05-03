import React, { useState } from "react";

const Login = ({ onLoginSuccess }) => {
  const [role, setRole] = useState("kasir"); // Toggle antara kasir/owner

  return (
    <div
      className="login-container"
      style={{ padding: "40px 20px", textAlign: "center" }}
    >
      <h2
        style={{
          fontFamily: "Playfair Display",
          color: "#C9A84C",
          marginBottom: "24px",
        }}
      >
        Staff Portal
      </h2>

      {/* Switch Role Login */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          justifyContent: "center",
          marginBottom: "30px",
        }}
      >
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
        {role === "kasir" ? (
          <>
            <input
              type="text"
              placeholder="Username Kasir"
              style={styles.input}
            />
            <input
              type="password"
              placeholder="PIN (4-6 Digit)"
              style={styles.input}
            />
          </>
        ) : (
          <>
            <input
              type="email"
              placeholder="Email Owner"
              style={styles.input}
            />
            <input
              type="password"
              placeholder="Password"
              style={styles.input}
            />
          </>
        )}
        <button
          onClick={() => onLoginSuccess(role)} // Simulasi login berhasil
          style={styles.btnLogin}
        >
          Masuk Sekarang
        </button>
      </div>
    </div>
  );
};

const styles = {
  loginCard: {
    background: "#1A1410",
    padding: "30px",
    borderRadius: "16px",
    border: "1px solid #C9A84C",
  },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    borderRadius: "8px",
    border: "1px solid rgba(201,168,76,0.3)",
    background: "#251E16",
    color: "#F5EDD6",
  },
  btnLogin: {
    width: "100%",
    padding: "14px",
    borderRadius: "8px",
    border: "none",
    background: "#C9A84C",
    color: "#0E0B08",
    fontWeight: "bold",
    cursor: "pointer",
  },
  activeTab: {
    padding: "8px 20px",
    borderRadius: "20px",
    border: "1px solid #C9A84C",
    background: "#C9A84C",
    color: "#0E0B08",
    cursor: "pointer",
  },
  inactiveTab: {
    padding: "8px 20px",
    borderRadius: "20px",
    border: "1px solid rgba(201,168,76,0.3)",
    background: "transparent",
    color: "#9E8B6E",
    cursor: "pointer",
  },
};

export default Login;
