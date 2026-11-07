import React from 'react';
import './pilot-identity-card.css';

export function PilotIdentityCard() {
  return <article className="pilot-id" aria-label="綾波麗駕駛員證件">
    <img className="pilot-id-watermark" src="/assets/nerv.png" alt="" aria-hidden="true" />
    <svg className="pilot-id-photo" viewBox="32 24 153 209" preserveAspectRatio="xMidYMid slice" role="img" aria-label="綾波麗證件照">
      {/* Show only the portrait from the unchanged user-supplied credential. */}
      <image href="/assets/rei-id-reference.jpg" width="564" height="392" />
    </svg>
    <div className="pilot-id-details">
      <span className="pilot-id-agency">NERV / PERSONNEL IDENTIFICATION</span>
      <div className="pilot-id-name-row">
        <h2>綾波麗</h2>
        <span className="pilot-id-status"><i aria-hidden="true" />認証待機</span>
      </div>
      <p className="pilot-id-english">AYANAMI REI</p>
      <div className="pilot-id-footer">
        <div><span>EVA-00 / FIRST CHILD</span><span className="pilot-id-number">IDENTITY 004</span></div>
        <span className="pilot-id-barcode" aria-hidden="true" />
      </div>
    </div>
  </article>;
}
