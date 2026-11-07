// Temporary design-preview entry for the emergency splash. Removed before delivery.
// No `now` prop: the splash runs its own live Beijing clock, same as production.
import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { EmergencySplash } from './boot/EmergencySplash.jsx';

createRoot(document.getElementById('root')).render(
  <EmergencySplash ready exiting={false} exitProgress={0} reducedMotion={false} onStart={() => {}} />,
);
