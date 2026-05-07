import React, { useState } from 'react';
import { 
  BarChart3, 
  ListOrdered, 
  Coffee, 
  CalendarDays, 
  Users, // Icon untuk staff
  LayoutDashboard,
  X
} from 'lucide-react';
import StaffManagement from "./components/StaffManagement";

// --- KOMPONEN STATCARD INTERNAL (DIPERTAHANKAN) ---
const LocalStatCard = ({ label, value, sub }) => (
  <div style={{ background: '#1A1410', padding: '20px', borderRadius: '16px', border: '1px solid rgba(201,168,76,0.2)' }}>
    <p style={{ color: '#9E8B6E', fontSize: '12px', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</p>
    <h3 style={{ color: '#C9A84C', fontSize: '24px', margin: '0', fontFamily: 'Playfair Display' }}>{value}</h3>
    <p style={{ color: '#4A90E2', fontSize: '11px', margin: '4px 0 0 0' }}>{sub}</p>
  </div>
);

const Dashboard = ({ orders = [] }) => {
  // --- STATE LAMA (DIPERTAHANKAN) ---
  const [selectedMonth, setSelectedMonth] = useState('2026-05');
  const [selectedLogDate, setSelectedLogDate] = useState(null);
  
  // --- STATE BARU: UNTUK GANTI TAB ---
  const [activeTab, setActiveTab] = useState('laporan'); // 'laporan' atau 'staff'

  const fmt = (n) => "Rp " + (n || 0).toLocaleString("id-ID");

  // --- LOGIKA FILTER & PERHITUNGAN LAMA (TIDAK DIUBAH SAMA SEKALI) ---
  const validOrdersForOwner = orders.filter(
    (o) => o.status === 'paid' || o.status === 'served' || o.status === 'completed'
  );

  const todayStr = new Date().toISOString().split('T')[0];

  const pendapatanHariIni = validOrdersForOwner
    .filter(o => o.CreatedAt?.startsWith(todayStr))
    .reduce((acc, curr) => acc + (curr.total || 0), 0);

  const activeTables = validOrdersForOwner.filter(o => 
    (o.status === 'paid' || o.status === 'served') && o.table_number !== 'Take Away'
  ).length;

  const activeBilliard = validOrdersForOwner.filter(o => 
    (o.status === 'paid' || o.status === 'served') && o.items?.toLowerCase().includes('billiard')
  ).length;

  const dailyStats = validOrdersForOwner.reduce((acc, order) => {
    try {
      const date = order.CreatedAt ? order.CreatedAt.split('T')[0] : null;
      if (!date) return acc;
      if (!acc[date]) {
        const formattedDate = new Date(date).toLocaleDateString('id-ID', { 
          day: '2-digit', month: 'long', year: 'numeric' 
        });
        acc[date] = { 
          rawDate: date, tgl: formattedDate, total: 0, 
          status: date === todayStr ? 'Hari Ini' : 'Selesai' 
        };
      }
      acc[date].total += (order.total || 0);
    } catch (e) {
      console.error("Format tanggal salah:", e);
    }
    return acc;
  }, {});

  const dynamicLogs = Object.values(dailyStats).sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate));
  const filteredLogs = dynamicLogs.filter(log => log.rawDate.startsWith(selectedMonth));
  const monthlyTotal = filteredLogs.reduce((acc, curr) => acc + curr.total, 0);

  return (
    <div style={{ animation: 'fadeIn 0.5s', paddingBottom: '50px' }}>
      
      {/* --- TAMBAHAN: TAB NAVIGATION --- */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', borderBottom: '1px solid rgba(201,168,76,0.1)', paddingBottom: '15px' }}>
        <button 
          onClick={() => setActiveTab('laporan')}
          style={activeTab === 'laporan' ? styles.activeTab : styles.inactiveTab}
        >
          <BarChart3 size={18} /> Laporan Keuangan
        </button>
        <button 
          onClick={() => setActiveTab('staff')}
          style={activeTab === 'staff' ? styles.activeTab : styles.inactiveTab}
        >
          <Users size={18} /> Manajemen Staff
        </button>
      </div>

      {/* --- KONDISI RENDER TAB --- */}
      {activeTab === 'laporan' ? (
        <>
          {/* KARTU STATISTIK (LAMA) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '30px' }}>
            <LocalStatCard label="Pendapatan Hari Ini" value={fmt(pendapatanHariIni)} sub={`Dari ${validOrdersForOwner.filter(o => o.CreatedAt?.startsWith(todayStr)).length} transaksi`} />
            <LocalStatCard label="Total Order" value={validOrdersForOwner.length} sub="Transaksi valid" />
            <LocalStatCard label="Meja Aktif" value={`${activeTables}/8`} sub="Terisi" />
            <LocalStatCard label="Billiard" value={`${activeBilliard}/3`} sub="Disewa" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            {/* PROYEKSI BULANAN (LAMA) */}
            <div style={styles.panel}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h4 style={{ color: '#F5EDD6', margin: 0 }}>Proyeksi {selectedMonth}</h4>
                <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} style={styles.select}>
                  <option value="2026-05">Mei 2026</option>
                  <option value="2026-04">April 2026</option>
                </select>
              </div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#C9A84C' }}>{fmt(monthlyTotal)}</div>
            </div>

            {/* LOG HARIAN (LAMA) */}
            <div style={styles.panel}>
              <h4 style={{ color: '#F5EDD6', marginBottom: '15px' }}>LOG HARIAN</h4>
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {filteredLogs.map((log, i) => (
                  <div key={i} onClick={() => setSelectedLogDate(log)} style={styles.logRow}>
                    <span style={{ fontSize: '13px' }}>{log.tgl}</span>
                    <span style={{ fontWeight: 'bold', color: '#C9A84C' }}>{fmt(log.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* DETAIL TRANSAKSI / DRILL DOWN (LAMA) */}
          {selectedLogDate && (
            <div style={{ ...styles.panel, border: '1px solid #C9A84C' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#C9A84C' }}>Detail: {selectedLogDate.tgl}</h3>
                <button onClick={() => setSelectedLogDate(null)} style={{ background: 'none', border: 'none', color: '#9E8B6E', cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              </div>
              {validOrdersForOwner.filter(o => o.CreatedAt?.startsWith(selectedLogDate.rawDate)).map((order, i) => (
                <div key={i} style={{ padding: '10px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '13px' }}>
                    <strong>#{order.ID} - {order.table_number}</strong>
                    <div style={{ color: '#9E8B6E' }}>{order.items}</div>
                  </div>
                  <div style={{ fontWeight: 'bold', color: '#C9A84C' }}>{fmt(order.total)}</div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* --- TAB MANAJEMEN STAFF (BARU) --- */
        <div style={{ animation: 'slideUp 0.3s' }}>
          <StaffManagement />
        </div>
      )}
    </div>
  );
};

// --- STYLES UNTUK KOMPONEN DASHBOARD ---
const styles = {
  panel: {
    background: '#1A1410', 
    border: '1px solid rgba(201,168,76,0.3)', 
    borderRadius: '16px', 
    padding: '24px'
  },
  select: {
    background: '#0E0B08', 
    border: '1px solid #C9A84C', 
    color: '#C9A84C', 
    borderRadius: '4px', 
    padding: '2px 5px',
    outline: 'none'
  },
  logRow: {
    display: 'flex', 
    justifyContent: 'space-between', 
    padding: '10px', 
    borderBottom: '1px solid rgba(201,168,76,0.1)', 
    cursor: 'pointer'
  },
  activeTab: {
    background: '#C9A84C',
    color: '#0E0B08',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  inactiveTab: {
    background: 'transparent',
    color: '#9E8B6E',
    border: '1px solid rgba(201,168,76,0.3)',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  }
};

export default Dashboard;