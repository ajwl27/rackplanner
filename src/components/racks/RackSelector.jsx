// components/racks/RackSelector.jsx
"use client";
import React from 'react';
import { createEmptyRack } from '@/lib/utils/rack';

export function RackSelector({ racks, selectedRack, onSelectRack, onCreateRack }) {
  return (
    <div className="flex gap-2 items-center mb-4">
      <select
        className="flex-1 p-2 border rounded"
        value={selectedRack || ''}
        onChange={(e) => onSelectRack(e.target.value)}
      >
        <option value="">Select a rack...</option>
        {racks.map(rack => (
          <option key={rack.id} value={rack.id}>
            {rack.name}
          </option>
        ))}
      </select>
      <button
        onClick={() => {
          const rackName = prompt('Enter rack name:');
          if (!rackName) return;
          
          const versionName = prompt('Enter initial configuration name (e.g., AMP21):');
          if (!versionName) return;
          
          const versionDate = prompt('Enter configuration date (YYYY-MM):', 
            new Date().toISOString().split('-').slice(0, 2).join('-'));
          if (!versionDate) return;

          const newRack = createEmptyRack(rackName, {
            name: versionName,
            date: versionDate
          });
          onCreateRack(newRack);
        }}
        className="px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
      >
        New Rack
      </button>
    </div>
  );
}