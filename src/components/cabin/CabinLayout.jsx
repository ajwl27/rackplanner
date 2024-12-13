// components/cabin/CabinLayout.jsx
"use client";
import React from 'react';
import { aircraftPositions } from '@/lib/constants';

const PositionSelector = ({ position, racks, selectedRackId, selectedVersionId, onRackChange, onVersionChange }) => (
  <div className="w-32 h-48 border-2 p-2 bg-white">
    <div className="text-center font-bold mb-2">{position.id}</div>
    <select
      className="w-full p-1 mb-2 text-sm border rounded"
      value={selectedRackId || ''}
      onChange={(e) => onRackChange(position.id, e.target.value)}
    >
      <option value="">No Rack</option>
      {racks.map(rack => (
        <option key={rack.id} value={rack.id}>
          {rack.name}
        </option>
      ))}
    </select>
    {selectedRackId && (
      <select
        className="w-full p-1 text-sm border rounded"
        value={selectedVersionId || ''}
        onChange={(e) => onVersionChange(position.id, e.target.value)}
      >
        {racks
          .find(r => r.id === selectedRackId)
          ?.versions.map(v => (
            <option key={v.id} value={v.id}>
              {v.name} ({v.date})
            </option>
          ))}
      </select>
    )}
  </div>
);

export default function CabinLayout({ racks, positions, onRackChange, onVersionChange }) {
  return (
    <div className="flex justify-center items-center gap-8 mb-8">
      <div className="flex flex-col gap-4">
        {/* Starboard side */}
        <div className="flex gap-4">
          {aircraftPositions.slice(0, 3).map(pos => (
            <PositionSelector
              key={pos.id}
              position={pos}
              racks={racks}
              selectedRackId={positions[pos.id]?.rackId}
              selectedVersionId={positions[pos.id]?.versionId}
              onRackChange={onRackChange}
              onVersionChange={onVersionChange}
            />
          ))}
        </div>
        {/* Port side */}
        <div className="flex gap-4">
          {aircraftPositions.slice(3).map(pos => (
            <PositionSelector
              key={pos.id}
              position={pos}
              racks={racks}
              selectedRackId={positions[pos.id]?.rackId}
              selectedVersionId={positions[pos.id]?.versionId}
              onRackChange={onRackChange}
              onVersionChange={onVersionChange}
            />
          ))}
        </div>
      </div>
    </div>
  );
}