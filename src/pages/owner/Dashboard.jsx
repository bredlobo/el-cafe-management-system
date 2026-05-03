import React, { useState } from 'react';
import StatCard from './components/StatCard';
import { BarChart3, ListOrdered, Coffee, LayoutGrid, CalendarDays, ChevronRight } from 'lucide-react';

const Dashboard = ({ orders = [] }) => {
  // State untuk kontrol filter dan drill-down
  const [selectedMonth, setSelectedMonth] = useState('2026-05');
  const [selectedLogDate, setSelectedLogDate] = useState(null);

  const fmt = (n) => "Rp " + n.toLocaleString("id-ID");

  // --- DATA LOG HARIAN (Simulasi Historis) ---
  const rawLogs = [
    { rawDate: '2026-05-04', tgl: '04 Mei 2026', total: 0, status: 'Hari Ini' },
    { rawDate: '2026-05-03', tgl: '03 Mei 2026', total: 458000, status: 'Selesai' },
    { rawDate: '2026-05-02', tgl: '02 Mei 2026', total: 612000, status: 'Selesai' },
    { rawDate: '2026-05-01', tgl: '01 Mei 2026', total: 380000, status: 'Selesai' },
    { rawDate: '2026-04-30', tgl: '30 Apr 2026', total: 720000, status: 'Selesai' },
    { rawDate: '2026-04-29', tgl: '29 Apr 2026', total: 540000, status: 'Selesai' },
    { rawDate: '2026-04-28', tgl: '28 Apr 2026', total: 490000, status: 'Selesai' },
  ];

  // Logic: Urutkan tanggal terbaru di paling atas
  const sortedLogs = [...rawLogs].sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate));

  // Logic: Filter berdasarkan bulan yang dipilih
  const filteredLogs = sortedLogs.filter(log => log.rawDate.startsWith(selectedMonth));
  
  // Logic: Hitung akumulasi bulanan
  const monthlyTotal = filteredLogs.reduce((acc, curr) => acc + curr.total, 0);

  // --- LOGIKA PERHITUNGAN ASET REAL-TIME (orders dari App.jsx) ---
  
  // Meja Aktif: Menghitung pesanan yang memiliki nomor meja (Bukan Take Away)
  const activeTablesCount = orders.filter(o => 
    (o.status === 'processed' || o.status === 'pending_payment') && o.table !== 'Take Away'
  ).length;

  // Billiard Aktif: Menghitung pesanan yang mengandung item 'Billiard'
  const activeBilliardCount = orders.filter(o => 
    (o.status === 'processed' || o.status === 'pending_payment') && o.items.toLowerCase().includes('billiard')
  ).length;

  return (
    <div style={{ animation: 'fadeIn 0.5s', paddingBottom: '50px' }}>
      
      {/* 4 KARTU UTAMA - Berdasarkan kondisi Cafe saat ini */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '30px' }}>
        <StatCard label="Pendapatan Hari Ini" value={fmt(rawLogs[0].total)} sub="+0% dari kemarin" />
        <StatCard label="Total Order" value={orders.length} sub="transaksi" />
        <StatCard label="Meja Aktif" value={`${activeTablesCount}/8`} sub="terisi sekarang" />
        <StatCard label="Billiard Aktif" value={`${activeBilliardCount}/3`} sub="sedang disewa" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        
        {/* PANEL PROYEKSI AKUMULASI BULANAN */}
        <div style={{ background: '#1A1410', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '16px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <BarChart3 size={20} color="#C9A84C" />
              <h4 style={{ color: '#F5EDD6', margin: 0, fontFamily: 'Playfair Display' }}>Proyeksi Bulanan</h4>
            </div>
            {/* Selektor Bulan */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(201,168,76,0.05)', padding: '5px 10px', borderRadius: '8px', border: '1px solid rgba(201,168,76,0.2)' }}>
              <CalendarDays size={14} color="#C9A84C" />
              <select 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: '#C9A84C', fontSize: '12px', fontWeight: 'bold', outline: 'none', cursor: 'pointer' }}
              >
                <option value="2026-05" style={{ background: '#1A1410' }}>Mei 2026</option>
                <option value="2026-04" style={{ background: '#1A1410' }}>April 2026</option>
              </select>
            </div>
          </div>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#C9A84C', fontFamily: 'Playfair Display' }}>
            {fmt(monthlyTotal)}
          </div>
          <p style={{ fontSize: '12px', color: '#9E8B6E', marginTop: '10px' }}>Total omzet yang berhasil dibukukan bulan ini.</p>
        </div>

        {/* LOG HARIAN SCROLLABLE */}
        <div style={{ background: '#1A1410', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '16px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <ListOrdered size={18} color="#C9A84C" />
            <h4 style={{ color: '#F5EDD6', margin: 0, fontSize: '14px', letterSpacing: '1px' }}>LOG HARIAN (Klik untuk Detail)</h4>
          </div>
          <div style={{ maxHeight: '250px', overflowY: 'auto', paddingRight: '5px' }}>
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log, i) => (
                <div 
                  key={i} 
                  onClick={() => setSelectedLogDate(log)}
                  style={{ 
                    display: 'flex', justifyContent: 'space-between', padding: '12px', 
                    borderBottom: '1px solid rgba(201,168,76,0.05)', borderRadius: '8px',
                    background: selectedLogDate?.rawDate === log.rawDate ? 'rgba(201,168,76,0.1)' : 'transparent',
                    cursor: 'pointer', transition: '0.2s', marginBottom: '4px'
                  }}
                >
                  <span style={{ fontSize: '13px', color: log.status === 'Hari Ini' ? '#C9A84C' : '#F5EDD6' }}>
                    {log.tgl}
                  </span>
                  <span style={{ fontWeight: 'bold', color: log.status === 'Hari Ini' ? '#C9A84C' : '#9E8B6E', fontSize: '13px' }}>
                    {fmt(log.total)}
                  </span>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', color: '#9E8B6E', padding: '20px', fontSize: '13px' }}>Tidak ada data bulan ini.</div>
            )}
          </div>
        </div>
      </div>

      {/* --- LAPORAN HARIAN DETAIL (Drill-down) --- */}
      {selectedLogDate && (
        <div style={{ 
          background: '#1A1410', border: '1px solid #C9A84C', borderRadius: '16px', padding: '24px',
          animation: 'slideUp 0.4s ease-out'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: 'rgba(201,168,76,0.1)', padding: '10px', borderRadius: '10px' }}>
                <Coffee color="#C9A84C" size={20} />
              </div>
              <div>
                <h3 style={{ color: '#F5EDD6', margin: 0, fontSize: '18px' }}>Rincian Transaksi</h3>
                <span style={{ color: '#C9A84C', fontSize: '13px' }}>{selectedLogDate.tgl}</span>
              </div>
            </div>
            <button 
              onClick={() => setSelectedLogDate(null)}
              style={{ background: 'transparent', border: 'none', color: '#9E8B6E', cursor: 'pointer', fontSize: '13px', textDecoration: 'underline' }}
            >
              Tutup
            </button>
          </div>

          <div style={{ display: 'grid', gap: '12px' }}>
            {/* Simulasi data rincian per tanggal */}
            {[
              { id: '101', time: '14:20', table: 'Meja 3 & Billiard 1', items: 'Sewa 2 Jam, Americano x2, Croissant', total: 118000 },
              { id: '102', time: '15:45', table: 'Billiard 2', items: 'Sewa 1 Jam, Cold Brew', total: 45000 },
            ].map((detail, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid rgba(201,168,76,0.1)' }}>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#F5EDD6', fontSize: '14px' }}>#{detail.id} — {detail.table}</div>
                  <div style={{ color: '#9E8B6E', fontSize: '12px' }}>{detail.items}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 'bold', color: '#C9A84C' }}>{fmt(detail.total)}</div>
                  <div style={{ fontSize: '11px', color: '#9E8B6E' }}>{detail.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;