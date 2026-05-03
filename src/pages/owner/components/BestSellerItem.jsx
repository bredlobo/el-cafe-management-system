import React from 'react';

const BestSellerItem = ({ rank, name, sold, progress }) => (
  <div style={{ background: '#1A1410', border: '1px solid rgba(201,168,76,0.3)', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '15px' }}>
    <div style={{ color: '#C9A84C', fontWeight: 'bold' }}>{rank}</div>
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
        <span>{name}</span>
        <span style={{ color: '#9E8B6E' }}>{sold}</span>
      </div>
      <div style={{ height: '4px', background: 'rgba(201,168,76,0.1)', borderRadius: '2px' }}>
        <div style={{ width: progress, height: '100%', background: '#C9A84C', borderRadius: '2px' }} />
      </div>
    </div>
  </div>
);

export default BestSellerItem;