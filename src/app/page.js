"use client";
import React, { useState } from 'react';

const initialEquipment = [
  { id: "SYS1", name: "System 1", size: 3, status: "active" },
  { id: "SYS2", name: "System 2", size: 4, status: "obsolete" },
  { id: "SYS3", name: "New System", size: 2, status: "planned" },
  { id: "SYS4", name: "Cooling Unit", size: 5, status: "active" },
  { id: "SYS5", name: "Data Logger", size: 1, status: "planned" },
];

const aircraftPositions = [
  { id: "S01"},
  { id: "S02"},
  { id: "S03"},
  { id: "P01"},
  { id: "P02"},
  { id: "P03"},
];

function createEmptyRack(name = "Untitled Rack", version = {
  name: "Initial",
  date: new Date().toISOString().split('T')[0]
}) {
  return {
    id: `RACK_${Date.now()}`,
    name,
    versions: [{
      id: `VERSION_${Date.now()}`,
      name: version.name,
      date: version.date,
      leftSide: Array(19).fill(null),
      rightSide: Array(19).fill(null)
    }],
    activeVersion: 0
  };
}

const findEquipmentInVersion = (version, equipmentId) => {
  const checkSide = (side) => {
    for (let i = 0; i < version[side].length; i++) {
      if (version[side][i]?.id === equipmentId) {
        return { side, position: i };
      }
    }
    return null;
  };

  return checkSide('leftSide') || checkSide('rightSide');
};


function sortVersionsByDate(versions) {
  return [...versions].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB - dateA;  // newest first
  });
}

export default function RackPlanner() {
  // Core state
  const [equipment] = useState(initialEquipment);
  const [racks, setRacks] = useState([createEmptyRack("Aerosol Rack")]);
  const [selectedRack, setSelectedRack] = useState(null);
  const [editingRackName, setEditingRackName] = useState(null);
  const [positions, setPositions] = useState(
    aircraftPositions.reduce((acc, pos) => ({ ...acc, [pos.id]: null }), {})
  );
  const [compareMode, setCompareMode] = useState(false);
  const [comparedVersions, setComparedVersions] = useState([null, null]);
  const [editingVersion, setEditingVersion] = useState(null); // to track which version is being edited


  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState(null); // 'equipment', 'rack', or null
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragSource, setDragSource] = useState(null);

  const handleDragStart = (e, item, type, source = null) => {
    setIsDragging(true);
    setDragType(type);
    setDraggedItem(item);
    setDragSource(source);
    e.dataTransfer.setData('application/json', JSON.stringify({ 
      item, 
      type, 
      source: source ? {
        ...source,
        versionIndex: source.rackId ? racks.find(r => r.id === source.rackId)?.activeVersion : undefined
      } : null 
    }));
  };

  const handleDragEnd = (e) => {
    if (e.dataTransfer.dropEffect === 'none') {
      if (dragType === 'equipment' && dragSource?.rackId) {
        // Updated equipment removal code to work with versions
        const { rackId, side, position } = dragSource;
        setRacks(racks.map(rack => {
          if (rack.id === rackId) {
            const newVersions = [...rack.versions];
            const currentVersion = { ...newVersions[rack.activeVersion] };
            const newSide = [...currentVersion[side]];
            
            // Clear the equipment slots
            for (let i = position; i < position + draggedItem.size; i++) {
              newSide[i] = null;
            }
            
            // Update the version with the new side
            currentVersion[side] = newSide;
            newVersions[rack.activeVersion] = currentVersion;
            
            return { ...rack, versions: newVersions };
          }
          return rack;
        }));
      } else if (dragType === 'rack' && draggedItem) {
        // Clear rack from its position when dropped outside
        const previousPosition = Object.entries(positions)
          .find(([_, rackId]) => rackId === draggedItem.id)?.[0];
        if (previousPosition) {
          setPositions(prev => ({ ...prev, [previousPosition]: null }));
        }
      }
    }
    setIsDragging(false);
    setDragType(null);
    setDraggedItem(null);
    setDragSource(null);
  };

  const canDropEquipment = (rackId, side, position, size, equipmentId) => {
    const rack = racks.find((r) => r.id === rackId);
    if (!rack) return false;
    
    const currentVersion = rack.versions[rack.activeVersion];
    if (!currentVersion) return false;
  
    // Check if equipment already exists in this version
    const existingLocation = findEquipmentInVersion(currentVersion, equipmentId);
    if (existingLocation && (existingLocation.side !== side || existingLocation.position !== position)) {
      return false; // Equipment already exists elsewhere in this version
    }
    
    // Check if target slots are free
    for (let i = position; i < position + size; i++) {
      if (i >= 19 || currentVersion[side][i] !== null) return false;
    }
    return true;
  };

  const handlePositionDrop = (e, positionId) => {
  e.preventDefault();
  const data = JSON.parse(e.dataTransfer.getData('application/json'));
  if (data.type !== 'rack') return;

  // Clear any previous position this rack was in
  const previousPosition = Object.entries(positions).find(([_, rackId]) => rackId === data.item.id)?.[0];
  if (previousPosition) {
    setPositions(prev => ({ ...prev, [previousPosition]: null }));
  }

  setPositions(prev => ({ ...prev, [positionId]: data.item.id }));
};

const handleEquipmentDrop = (e, rackId, side, position) => {
  e.preventDefault();
  const data = JSON.parse(e.dataTransfer.getData("application/json"));
  if (data.type !== "equipment") return;

  const equipment = data.item;
  const rack = racks.find(r => r.id === rackId);
  if (!rack) return;
  
  const versionIndex = rack.activeVersion;
  const currentVersion = rack.versions[versionIndex];
  if (!currentVersion) return;

  // Check if this would create a duplicate
  if (!canDropEquipment(rackId, side, position, equipment.size, equipment.id)) {
    return; // Prevent drop if it would create a duplicate
  }

  // Remove from source rack if applicable
  if (data.source?.rackId) {
    setRacks(racks.map(r => {
      if (r.id === data.source.rackId) {
        const newVersions = [...r.versions];
        const sourceVersion = newVersions[r.activeVersion];
        const newSide = [...sourceVersion[data.source.side]];
        for (let i = data.source.position; i < data.source.position + equipment.size; i++) {
          newSide[i] = null;
        }
        newVersions[r.activeVersion] = {
          ...sourceVersion,
          [data.source.side]: newSide
        };
        return { ...r, versions: newVersions };
      }
      return r;
    }));
  }

  // Add to target position
  setRacks(racks.map(r => {
    if (r.id === rackId) {
      const newVersions = [...r.versions];
      const targetVersion = { ...newVersions[versionIndex] };
      const newSide = [...targetVersion[side]];
      for (let i = position; i < position + equipment.size; i++) {
        newSide[i] = equipment;
      }
      targetVersion[side] = newSide;
      newVersions[versionIndex] = targetVersion;
      return { ...r, versions: newVersions };
    }
    return r;
  }));
};

  const renderCabinLayout = () => (
    <div className="flex justify-center items-center gap-8 mb-8">
      <div className="flex flex-col gap-4">
        {/* Starboard side */}
        <div className="flex gap-4">
          {aircraftPositions.slice(0, 3).map(pos => (  // or slice(3) for the port section
  <div
    key={pos.id}
    draggable={!!positions[pos.id]}
    className={`w-32 h-48 border-2 group ${
  positions[pos.id] 
    ? selectedRack === positions[pos.id]
      ? 'bg-blue-200 border-blue-500 cursor-move'
      : 'bg-blue-50 hover:bg-blue-100 cursor-move' 
    : 'bg-white'
} relative transition-colors`}
    onClick={() => {
      const rackId = positions[pos.id];
      if (rackId) {
        setSelectedRack(rackId);
      }
    }}
    onMouseEnter={(e) => {
      if (positions[pos.id]) {
        const rack = racks.find(r => r.id === positions[pos.id]);
        if (rack) {
          const leftUnits = rack.leftSide.filter(x => x !== null).length;
          const rightUnits = rack.rightSide.filter(x => x !== null).length;
          e.currentTarget.setAttribute('title', 
            `${rack.name}\n${leftUnits}U aisle side, ${rightUnits}U window side occupied`
          );
        }
      }
    }}
    onDragOver={(e) => e.preventDefault()}
    onDrop={(e) => handlePositionDrop(e, pos.id)}
    onDragStart={(e) => {
      const rackId = positions[pos.id];
      const rack = racks.find(r => r.id === rackId);
      if (rack) {
        handleDragStart(e, rack, 'rack');
      }
    }}
    onDragEnd={handleDragEnd}
  >
    <div className="text-center p-2 font-bold">{pos.id}</div>
    <div className="text-center text-sm">{pos.label}</div>
    {positions[pos.id] && (
      <>
        <div className="absolute bottom-2 left-2 right-2 text-center text-sm bg-blue-100 p-1 rounded">
          {racks.find(r => r.id === positions[pos.id])?.name}
        </div>
        <div className="opacity-0 group-hover:opacity-100 absolute inset-0 bg-black bg-opacity-50 text-white p-2 transition-opacity">
          {(() => {
            const rack = racks.find(r => r.id === positions[pos.id]);
            if (rack) {
              const leftUnits = rack.leftSide.filter(x => x !== null).length;
              const rightUnits = rack.rightSide.filter(x => x !== null).length;
              return (
                <>
                  <div>{rack.name}</div>
                  <div className="text-sm">{leftUnits}U aisle side</div>
                  <div className="text-sm">{rightUnits}U window side</div>
                </>
              );
            }
            return null;
          })()}
        </div>
      </>
    )}
  </div>
))}
        </div>
        {/* Port side */}
        <div className="flex gap-4">
          {aircraftPositions.slice(3).map(pos => (  // or slice(3) for the port section
  <div
    key={pos.id}
    draggable={!!positions[pos.id]}
    className={`w-32 h-48 border-2 group ${
  positions[pos.id] 
    ? selectedRack === positions[pos.id]
      ? 'bg-blue-200 border-blue-500 cursor-move'
      : 'bg-blue-50 hover:bg-blue-100 cursor-move' 
    : 'bg-white'
} relative transition-colors`}
    onClick={() => {
      const rackId = positions[pos.id];
      if (rackId) {
        setSelectedRack(rackId);
      }
    }}
    onMouseEnter={(e) => {
      if (positions[pos.id]) {
        const rack = racks.find(r => r.id === positions[pos.id]);
        if (rack) {
          const currentVersion = rack.versions[rack.activeVersion];
          const leftUnits = currentVersion.leftSide.filter(x => x !== null).length;
          const rightUnits = currentVersion.rightSide.filter(x => x !== null).length;
          e.currentTarget.setAttribute('title', 
            `${rack.name} (${currentVersion.name})\n${leftUnits}U aisle side, ${rightUnits}U window side occupied`
          );
        }
      }
    }}
    onDragOver={(e) => e.preventDefault()}
    onDrop={(e) => handlePositionDrop(e, pos.id)}
    onDragStart={(e) => {
      const rackId = positions[pos.id];
      const rack = racks.find(r => r.id === rackId);
      if (rack) {
        handleDragStart(e, rack, 'rack');
      }
    }}
    onDragEnd={handleDragEnd}
  >
    <div className="text-center p-2 font-bold">{pos.id}</div>
    <div className="text-center text-sm">{pos.label}</div>
    {positions[pos.id] && (
      <>
        <div className="absolute bottom-2 left-2 right-2 text-center text-sm bg-blue-100 p-1 rounded">
          {racks.find(r => r.id === positions[pos.id])?.name}
        </div>
        <div className="opacity-0 group-hover:opacity-100 absolute inset-0 bg-black bg-opacity-50 text-white p-2 transition-opacity">
          {(() => {
            const rack = racks.find(r => r.id === positions[pos.id]);
            if (rack) {
              const currentVersion = rack.versions[rack.activeVersion];
              const leftUnits = currentVersion.leftSide.filter(x => x !== null).length;
              const rightUnits = currentVersion.rightSide.filter(x => x !== null).length;
              return (
                <>
                  <div>{rack.name}</div>
                  <div className="text-sm">Version: {currentVersion.name}</div>
                  <div className="text-sm">{leftUnits}U aisle side</div>
                  <div className="text-sm">{rightUnits}U window side</div>
                  <div className="text-sm">Modified: {currentVersion.date}</div>
                </>
              );
            }
            return null;
          })()}
        </div>
      </>
    )}
  </div>
))}
        </div>
      </div>
    </div>
  );

  const createRackVersion = (rackId, versionName, versionDate) => {
    setRacks(racks.map(rack => {
      if (rack.id === rackId) {
        const currentVersion = rack.versions[rack.activeVersion];
        return {
          ...rack,
          versions: [...rack.versions, {
            id: `VERSION_${Date.now()}`,
            name: versionName,
            date: versionDate,
            leftSide: [...currentVersion.leftSide],
            rightSide: [...currentVersion.rightSide]
          }],
          activeVersion: rack.versions.length
        };
      }
      return rack;
    }));
  };

  const renderRackSide = (rack, versionIndex, side) => {
    const version = rack.versions[versionIndex];
    if (!version) return [];
    
    const cells = [];
    let skipCount = 0;
  
    for (let i = 0; i < 19; i++) {
      if (skipCount > 0) {
        skipCount--;
        continue;
      }
  
      const equipment = version[side][i];
      const isValidTarget = !equipment && isDragging && dragType === 'equipment' && 
                         canDropEquipment(rack.id, side, i, draggedItem?.size || 0, draggedItem?.id);
  
      const cell = (
        <div
          key={`${side}-${i}`}
          className={`border text-sm transition-colors ${
            isValidTarget ? 'bg-green-100' : 'bg-gray-50'
          }`}
          style={{ height: equipment ? `${equipment.size * 2}rem` : '2rem' }}
          onDragOver={(e) => {
            if (isDragging && dragType === 'equipment' && 
                canDropEquipment(rack.id, side, i, draggedItem?.size || 0, draggedItem?.id)) {
              e.preventDefault();
            }
          }}
          onDrop={(e) => handleEquipmentDrop(e, rack.id, side, i)}
        >
          {equipment ? (
            <div 
              draggable
              className={`h-full w-full px-2 flex items-center cursor-grab active:cursor-grabbing ${
                equipment.status === 'obsolete' ? 'bg-red-100 hover:bg-red-200' :
                equipment.status === 'planned' ? 'bg-green-100 hover:bg-green-200' : 
                'bg-blue-100 hover:bg-blue-200'
              }`}
              onDragStart={(e) => handleDragStart(e, equipment, 'equipment', { 
                rackId: rack.id, 
                side,
                position: i,
                versionIndex: rack.activeVersion
              })}
              onDragEnd={handleDragEnd}
            >
              {equipment.name}
            </div>
          ) : (
            <div className="px-2 py-1">U{19 - i}</div>
          )}
        </div>
      );
  
      cells.push(cell);
      if (equipment) {
        skipCount = equipment.size - 1;
      }
    }
  
    return cells;
  };

  const renderRackSides = (rack, versionIndex) => (
    <div className="flex gap-4">
      <div className="w-48">
        <div className="text-center font-bold mb-2">Aisle Side</div>
        <div className="flex">
          <div
            className="flex flex-col justify-between pr-2 text-sm font-semibold text-gray-600 py-1"
            style={{ height: "38rem" }}
          >
            <div>Top</div>
            <div>Bottom</div>
          </div>
          <div className="flex-1">
            <div className="flex flex-col">
              {renderRackSide(rack, versionIndex, "leftSide")}
            </div>
          </div>
        </div>
      </div>
  
      <div className="w-1 bg-gray-300"></div>
  
      <div className="w-48">
        <div className="text-center font-bold mb-2">Window Side</div>
        <div className="flex flex-col">
          {renderRackSide(rack, versionIndex, "rightSide")}
        </div>
      </div>
    </div>
  );
  

const renderRackDetail = () => {
  const rack = racks.find((r) => r.id === selectedRack);
  if (!rack) return null;

  const currentVersion = rack.versions[rack.activeVersion];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
  <h3 className="text-lg font-bold">{rack.name}</h3>
  <div className="flex items-center gap-4">
    <div className="flex-1">
      <select
        className="w-full p-1 border rounded"
        value={rack.activeVersion}
        onChange={(e) => {
          const newIndex = parseInt(e.target.value);
          setRacks(racks.map(r => 
            r.id === rack.id 
              ? { ...r, activeVersion: newIndex }
              : r
          ));
          setEditingVersion({ rackId: rack.id, versionIndex: newIndex });
        }}
        disabled={compareMode}
      >
        {sortVersionsByDate(rack.versions).map((version, index) => (
          <option key={version.id} value={rack.versions.indexOf(version)}>
            {version.name} ({version.date})
          </option>
        ))}
      </select>
    </div>
    <button
      onClick={() => {
        const name = prompt('Enter configuration name (e.g., AMP21):');
        if (!name) return;
        const date = prompt('Enter configuration date (YYYY-MM):', 
          new Date().toISOString().split('-').slice(0, 2).join('-'));
        if (!date) return;
        createRackVersion(rack.id, name, date);
        setEditingVersion({ 
          rackId: rack.id, 
          versionIndex: rack.versions.length 
        });
      }}
      className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
      disabled={compareMode}
    >
      New Configuration
    </button>
    <button
      onClick={() => setCompareMode(!compareMode)}
      className={`px-3 py-1 rounded ${
        compareMode ? 'bg-blue-500 text-white' : 'bg-gray-100'
      }`}
    >
      Compare Versions
    </button>
  </div>
</div>

      <div className="flex gap-4">
        <div className="w-48">
          <select
            className="w-full mb-2 p-1 border rounded"
            value={rack.activeVersion}
            onChange={(e) => {
              setRacks(racks.map(r => 
                r.id === rack.id 
                  ? { ...r, activeVersion: parseInt(e.target.value) }
                  : r
              ));
            }}
          >
            {rack.versions.map((version, index) => (
              <option key={version.id} value={index}>
                {version.name} ({version.date})
              </option>
            ))}
          </select>
        </div>
        {compareMode && (
          <div className="w-48">
            <select
  className="w-full mb-2 p-1 border rounded"
  value={comparedVersions[1]?.id || ''}
  onChange={(e) => {
    const version = rack.versions.find(v => v.id === e.target.value);
    setComparedVersions([currentVersion, version]);
  }}
>
  <option value="">Select version to compare</option>
  {sortVersionsByDate(rack.versions)
    .filter(v => v.id !== currentVersion.id)
    .map(version => (
      <option key={version.id} value={version.id}>
        {version.name} ({version.date})
      </option>
    ))}
</select>
          </div>
        )}
      </div>

      <div className="flex gap-4">
        {/* Current version */}
        <div className="flex-1">
          <div className="text-center font-bold mb-2">
            {currentVersion.name} ({currentVersion.date})
          </div>
          {renderRackSides(rack, rack.activeVersion)}
        </div>

        {/* Compared version */}
        {compareMode && comparedVersions[1] && (
          <div className="flex-1">
            <div className="text-center font-bold mb-2">
              {comparedVersions[1].name} ({comparedVersions[1].date})
            </div>
            {renderRackSides(rack, rack.versions.findIndex(v => v.id === comparedVersions[1].id))}
          </div>
        )}
      </div>
    </div>
  );
};

  return (
  <div className="max-w-7xl mx-auto p-6 space-y-6">
    <div className="border rounded-lg p-4 bg-white">
      <h2 className="text-xl font-bold mb-4">Cabin Layout</h2>
      <div className="w-full" style={{ aspectRatio: '21/9' }}>
        {renderCabinLayout()}
      </div>
    </div>

    <div className="flex gap-6">
      <div className="w-80 space-y-6">
        {/* Equipment List */}
        <div className="border rounded-lg p-4 bg-white">
          <h2 className="text-xl font-bold mb-4">Subsystems</h2>
          <div className="space-y-2">
            {equipment.map(item => (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, item, 'equipment')}
                onDragEnd={handleDragEnd}
                className={`p-2 border rounded cursor-move ${
                  item.status === 'obsolete' ? 'bg-red-50 hover:bg-red-100' :
                  item.status === 'planned' ? 'bg-green-50 hover:bg-green-100' : 
                  'bg-blue-50 hover:bg-blue-100'
                }`}
              >
                <div className="font-medium">{item.name}</div>
                <div className="text-sm text-gray-600">
                  Size: {item.size}U | Status: {item.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rack Library */}
        <div className="border rounded-lg p-4 bg-white">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Racks</h2>
            <button
  onClick={() => {
    const rackName = prompt('Enter rack name:');
    if (rackName) {
      const newRack = createEmptyRack(rackName);
      setRacks([...racks, newRack]);
      setSelectedRack(newRack.id);
      setEditingVersion({ rackId: newRack.id, versionIndex: 0 });
    }
  }}
  className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
>
  New Rack
</button>
          </div>
          <div className="space-y-2">
            {racks.map(rack => {
              const installedPosition = Object.entries(positions).find(([_, rackId]) => rackId === rack.id)?.[0];
              return (
                <div
                  key={rack.id}
                  draggable={editingRackName !== rack.id}
                  className={`p-2 rounded ${editingRackName !== rack.id ? 'cursor-move' : ''} ${
                    selectedRack === rack.id 
                      ? installedPosition 
                        ? 'bg-blue-200'
                        : 'bg-blue-100'
                      : installedPosition
                        ? 'bg-blue-50 hover:bg-blue-100'
                        : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => editingRackName !== rack.id && setSelectedRack(rack.id)}
                  onDragStart={(e) => handleDragStart(e, rack, 'rack')}
                  onDragEnd={handleDragEnd}
                >
                  {editingRackName === rack.id ? (
                    <input
                      autoFocus
                      className="w-full px-1 border rounded"
                      value={rack.name}
                      onChange={(e) => {
                        setRacks(racks.map(r => 
                          r.id === rack.id ? { ...r, name: e.target.value } : r
                        ));
                      }}
                      onBlur={() => setEditingRackName(null)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') setEditingRackName(null);
                        if (e.key === 'Escape') setEditingRackName(null);
                      }}
                    />
                  ) : (
                    <div onDoubleClick={() => setEditingRackName(rack.id)}>
                      {installedPosition ? `(${installedPosition}) ${rack.name}` : rack.name}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Rack Configuration */}
      <div className="flex-1 border rounded-lg p-4 bg-white">
        <h2 className="text-xl font-bold mb-4">Configure Rack</h2>
        {selectedRack ? renderRackDetail() : 
          <div className="text-gray-500 text-center py-8">
            Select a rack to configure
          </div>
        }
      </div>
    </div>
  </div>
);}