import React, { useState, useEffect } from "react";
import { Save, UserCog, ShieldAlert } from "lucide-react";

const StaffManagement = () => {
  const [kasirAccount, setKasirAccount] = useState({ new_username: "", new_password: "" });
  const [ownerAccount, setOwnerAccount] = useState({ new_username: "", new_password: "" });

  const handleUpdate = async (role, data) => {
    if (!data.new_username || !data.new_password) return alert("Isi username dan password baru!");
    
    try {
      const res = await fetch(`http://localhost:8080/api/users/update/${role}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        alert(`Akun ${role} berhasil diubah!`);
      } else {
        alert("Gagal mengubah akun.");
      }
    } catch (err) {
      alert("Error koneksi server.");
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
      
      {/* PENGATURAN AKUN KASIR */}
      <div style={panelStyle}>
        <h3 style={{ color: "#4A90E2", display: "flex", alignItems: "center", gap: "10px" }}>
          <UserCog /> Pengaturan Akun Kasir
        </h3>
        <p style={{ color: "#9E8B6E", fontSize: "12px" }}>Ganti akses yang digunakan Kasir di semua device.</p>
        <input 
          style={inputStyle} type="text" placeholder="Username Kasir Baru" 
          onChange={(e) => setKasirAccount({...kasirAccount, new_username: e.target.value})}
        />
        <input 
          style={inputStyle} type="password" placeholder="Password Kasir Baru" 
          onChange={(e) => setKasirAccount({...kasirAccount, new_password: e.target.value})}
        />
        <button onClick={() => handleUpdate("kasir", kasirAccount)} style={btnStyle}>
          <Save size={18} /> Simpan Akun Kasir
        </button>
      </div>

      {/* PENGATURAN AKUN OWNER */}
      <div style={{ ...panelStyle, borderColor: "#E05252" }}>
        <h3 style={{ color: "#E05252", display: "flex", alignItems: "center", gap: "10px" }}>
          <ShieldAlert /> Pengaturan Akun Owner
        </h3>
        <p style={{ color: "#9E8B6E", fontSize: "12px" }}>Hati-hati! Ini adalah akun utama Anda.</p>
        <input 
          style={inputStyle} type="text" placeholder="Username Owner Baru" 
          onChange={(e) => setOwnerAccount({...ownerAccount, new_username: e.target.value})}
        />
        <input 
          style={inputStyle} type="password" placeholder="Password Owner Baru" 
          onChange={(e) => setOwnerAccount({...ownerAccount, new_password: e.target.value})}
        />
        <button onClick={() => handleUpdate("owner", ownerAccount)} style={{ ...btnStyle, background: "#E05252" }}>
          <Save size={18} /> Simpan Akun Owner
        </button>
      </div>

    </div>
  );
};

const panelStyle = { background: "#1A1410", padding: "25px", borderRadius: "12px", border: "1px solid #C9A84C" };
const inputStyle = { width: "100%", background: "#251E16", border: "1px solid rgba(201,168,76,0.3)", padding: "12px", borderRadius: "8px", color: "#F5EDD6", marginBottom: "15px", boxSizing: "border-box" };
const btnStyle = { width: "100%", background: "#C9A84C", color: "#0E0B08", border: "none", padding: "12px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" };

export default StaffManagement;