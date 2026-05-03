import React from 'react';
import ReportItem from './components/ReportItem';

const LaporanHarian = () => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
      <div style={{ background: '#1A1410', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '16px', padding: '24px' }}>
        <h3 style={{ color: '#C9A84C', fontFamily: 'Playfair Display', marginBottom: '24px' }}>Minuman Terjual</h3>
        <ReportItem label="Americano" val="12 cup" />
        <ReportItem label="Latte" val="18 cup" />
      </div>
      <div style={{ background: '#1A1410', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '16px', padding: '24px' }}>
        <h3 style={{ color: '#C9A84C', fontFamily: 'Playfair Display', marginBottom: '24px' }}>Pendapatan Billiard</h3>
        <ReportItem label="Billiard 1" val="Rp 80.000" sub="Disewa selama 4 jam" />
        <ReportItem label="Billiard 2" val="Rp 120.000" sub="Disewa selama 6 jam" />
      </div>
    </div>
  );
};

export default LaporanHarian;