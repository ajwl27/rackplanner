"use client";
import React, { useState } from 'react';
import { initialEquipment } from '@/lib/constants';

export function RackEquipmentSelector({ onAddEquipment }) {
  const [selectedEquipmentId, setSelectedEquipmentId] = useState('');
  
  return (
    <div className="flex gap-2 mb-4">
      <select
        className="flex-1 p-2 border rounded"
        value={selectedEquipmentId}
        onChange={(e) => setSelectedEquipmentId(e.target.value)}
      >
        <option value="">Select equipment...</option>
        {initialEquipment.map(eq => (
          <option key={eq.id} value={eq.id}>
            {eq.name} ({eq.size}U, {eq.width}%, {eq.category})
          </option>
        ))}
      </select>
      <button
        onClick={() => {
          const equipment = initialEquipment.find(eq => eq.id === selectedEquipmentId);
          if (equipment) {
            onAddEquipment(equipment);
            setSelectedEquipmentId(''); // Reset selection after adding
          }
        }}
        disabled={!selectedEquipmentId}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        Add to Rack
      </button>
    </div>
  );
}