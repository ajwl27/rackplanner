"use client";
import { useState } from 'react';
import { aircraftPositions } from '@/lib/constants';
import { createEmptyRack } from '@/lib/utils/rack';

export function useRackManagement() {
  const [racks, setRacks] = useState([createEmptyRack("Aerosol Rack")]);
  const [selectedRack, setSelectedRack] = useState(null);
  const [positions, setPositions] = useState(
    aircraftPositions.reduce((acc, pos) => ({ 
      ...acc, 
      [pos.id]: { rackId: null, versionId: null } 
    }), {})
  );

  const handleRackPositionChange = (positionId, rackId) => {
    setPositions(prev => ({
      ...prev,
      [positionId]: {
        rackId: rackId || null,
        versionId: rackId ? racks.find(r => r.id === rackId)?.versions[0]?.id : null
      }
    }));
  };

  const handleVersionChange = (positionId, versionId) => {
    setPositions(prev => ({
      ...prev,
      [positionId]: {
        ...prev[positionId],
        versionId
      }
    }));
  };

  return {
    racks,
    setRacks,
    selectedRack,
    setSelectedRack,
    positions,
    setPositions,
    handleRackPositionChange,
    handleVersionChange
  };
}