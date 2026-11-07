import React from 'react';
import { createRoot } from 'react-dom/client';
import { EmergencyDigits } from './boot/EmergencyDigits.jsx';

createRoot(document.getElementById('root')).render(
  <div style={{ background: '#ef060c', width: '100vw', height: '100vh', display: 'grid', placeItems: 'center' }}>
    <svg viewBox="0 0 700 340" width="900" height="440">
      <EmergencyDigits value="04:54:32" height={300} x={20} y={20} color="#030101" />
    </svg>
  </div>,
);
