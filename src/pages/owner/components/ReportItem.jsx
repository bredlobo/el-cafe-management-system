import React from 'react';

const ReportItem = ({ label, val, sub }) => (
  <div style={{ marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: sub ? '4px' : '0' }}>
      <span style={{ color: '#F5EDD6' }}>{label}</span>
      <span style={{ color: '#F5EDD6', fontWeight: 'bold' }}>{val}</span>
    </div>
    {sub && <div style={{ fontSize: '11px', color: '#9E8B6E' }}>{sub}</div>}
  </div>
);

export default ReportItem;