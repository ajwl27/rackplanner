"use client";
import React, { useState } from 'react';

// Initial data models
const initialEquipment = [
  { 
    id: "SYS1", 
    name: "System 1", 
    size: 3, 
    width: 100, 
    status: "active",
    category: "IT Hardware",
    power: 500,
    owner: "IT Department"
  },
  { 
    id: "SYS2", 
    name: "System 2", 
    size: 4, 
    width: 100, 
    status: "obsolete",
    category: "Science Instrument",
    power: 750,
    owner: "Research Lab"
  },
  { 
    id: "SYS3", 
    name: "New System", 
    size: 2, 
    width: 100, 
    status: "planned",
    category: "Supporting Equipment",
    power: 300,
    owner: "Operations"
  },
  { 
    id: "SYS4", 
    name: "Cooling Unit", 
    size: 5, 
    width: 100, 
    status: "active",
    category: "Supporting Equipment",
    power: 1200,
    owner: "Facilities"
  },
  { 
    id: "SYS5", 
    name: "Data Logger", 
    size: 1, 
    width: 50, 
    status: "planned",
    category: "IT Hardware",
    power: 100,
    owner: "IT Department"
  },
];

const aircraftPositions = [
  { id: "S01" },
  { id: "S02" },
  { id: "S03" },
  { id: "P01" },
  { id: "P02" },
  { id: "P03" },
];

// Helper functions
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
      leftSide: Array(19).fill().map(() => []),
      rightSide: Array(19).fill().map(() => [])
    }],
    activeVersion: 0
  };
}

function sortVersionsByDate(versions) {
  return [...versions].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB - dateA;  // newest first
  });
}

// Components
const RackSelector = ({ racks, selectedRack, onSelectRack, onCreateRack }) => {
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
};


const RackEquipmentSelector = ({ onAddEquipment }) => {
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
};

const ComparisonModal = ({ rack, currentVersion, onSelect, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-full">
        <h3 className="text-lg font-bold mb-4">Select Version to Compare</h3>
        <div className="space-y-2">
          {sortVersionsByDate(rack.versions)
            .filter(v => v.id !== currentVersion.id)
            .map(version => (
              <button
                key={version.id}
                onClick={() => onSelect(version)}
                className="w-full p-2 text-left hover:bg-blue-50 rounded border mb-2"
              >
                {version.name} ({version.date})
              </button>
            ))}
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default function RackPlanner() {
  // Core state
  const [racks, setRacks] = useState([createEmptyRack("Aerosol Rack")]);
  const [selectedRack, setSelectedRack] = useState(null);
  const [editingRackName, setEditingRackName] = useState(null);
  const [positions, setPositions] = useState(
    aircraftPositions.reduce((acc, pos) => ({ ...acc, [pos.id]: null }), {})
  );
  const [compareMode, setCompareMode] = useState(false);
  const [comparedVersions, setComparedVersions] = useState([null, null]);
  const [editingVersion, setEditingVersion] = useState(null);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
    // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragSource, setDragSource] = useState(null);
    // Handler functions
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
          const { rackId, side, position } = dragSource;
          // Remove equipment from the rack
          setRacks(racks.map(rack => {
            if (rack.id === rackId) {
              const newVersions = [...rack.versions];
              const currentVersion = { ...newVersions[rack.activeVersion] };
              const newSide = [...currentVersion[side]];
              
              // Clear all positions occupied by this equipment
              for (let i = position; i < position + draggedItem.size; i++) {
                if (i < 19) {
                  newSide[i] = (newSide[i] || []).filter(item => item.id !== draggedItem.id);
                }
              }
              
              currentVersion[side] = newSide;
              newVersions[rack.activeVersion] = currentVersion;
              return { ...r, versions: newVersions };
            }
            return rack;
          }));
        } else if (dragType === 'rack' && draggedItem) {
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
  
    const canDropEquipment = (rackId, side, position, equipment) => {
      const rack = racks.find((r) => r.id === rackId);
      if (!rack) return false;
      
      const currentVersion = rack.versions[rack.activeVersion];
      if (!currentVersion) return false;
    
      // Check if there's enough vertical space
      for (let i = position; i < position + equipment.size; i++) {
        if (i >= 19) return false;
        
        // Get items at this position
        const itemsAtPosition = Array.isArray(currentVersion[side][i]) 
          ? currentVersion[side][i] 
          : [];
    
        // If this position is part of another equipment, check if it's the same one
        if (itemsAtPosition.length > 0 && !itemsAtPosition.every(item => item.id === equipment.id)) {
          return false;
        }
      }
    
      // Check width at the target position
      const existingItems = Array.isArray(currentVersion[side][position]) 
        ? currentVersion[side][position] 
        : [];
    
      const totalExistingWidth = existingItems
        .filter(item => item.id !== equipment.id)
        .reduce((sum, item) => sum + item.width, 0);
      
      return (totalExistingWidth + equipment.width) <= 100;
    };
    
    // Update handleEquipmentDrop to handle multi-unit equipment
    const handleEquipmentDrop = (e, rackId, side, position) => {
      e.preventDefault();
      const data = JSON.parse(e.dataTransfer.getData("application/json"));
      if (data.type !== "equipment") return;
    
      const equipment = data.item;
      const rack = racks.find(r => r.id === rackId);
      if (!rack) return;
      
      // Check if there's enough space
      if (!canDropEquipment(rackId, side, position, equipment)) {
        return;
      }
    
      setRacks(racks.map(r => {
        // Remove from source if it's a move operation
        if (data.source?.rackId === r.id) {
          const newVersions = [...r.versions];
          const sourceVersion = { ...newVersions[r.activeVersion] };
          const newSourceSide = [...sourceVersion[data.source.side]];
          
          // Clear all positions occupied by this equipment
          for (let i = data.source.position; i < data.source.position + equipment.size; i++) {
            if (i < 19) {
              newSourceSide[i] = (newSourceSide[i] || []).filter(item => item.id !== equipment.id);
            }
          }
          
          sourceVersion[data.source.side] = newSourceSide;
          newVersions[r.activeVersion] = sourceVersion;
          
          if (r.id === rackId) {
            // If same rack, add to new position
            const newTargetSide = [...sourceVersion[side]];
            if (!Array.isArray(newTargetSide[position])) {
              newTargetSide[position] = [];
            }
            newTargetSide[position] = [...newTargetSide[position], equipment];
            sourceVersion[side] = newTargetSide;
            return { ...r, versions: newVersions };
          }
          return { ...r, versions: newVersions };
        }
        
        // Add to target rack
        if (r.id === rackId) {
          const newVersions = [...r.versions];
          const targetVersion = { ...newVersions[r.activeVersion] };
          const newSide = [...targetVersion[side]];
          
          if (!Array.isArray(newSide[position])) {
            newSide[position] = [];
          }
          
          newSide[position] = [...newSide[position], { ...equipment }];
          
          targetVersion[side] = newSide;
          newVersions[r.activeVersion] = targetVersion;
          return { ...r, versions: newVersions };
        }
        
        return r;
      }));
    };
  
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
  
    // Render functions
    const renderCabinLayout = () => (
      <div className="flex justify-center items-center gap-8 mb-8">
        <div className="flex flex-col gap-4">
          {/* Starboard side */}
          <div className="flex gap-4">
            {aircraftPositions.slice(0, 3).map(pos => (
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
                {positions[pos.id] && (
                  <div className="absolute bottom-2 left-2 right-2 text-center text-sm bg-blue-100 p-1 rounded">
                    {racks.find(r => r.id === positions[pos.id])?.name}
                  </div>
                )}
              </div>
            ))}
          </div>
          {/* Port side */}
          <div className="flex gap-4">
            {aircraftPositions.slice(3).map(pos => (
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
                {positions[pos.id] && (
                  <div className="absolute bottom-2 left-2 right-2 text-center text-sm bg-blue-100 p-1 rounded">
                    {racks.find(r => r.id === positions[pos.id])?.name}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  
    const renderRackSide = (rack, versionIndex, side) => {
      const version = rack.versions[versionIndex];
      if (!version) return [];
      
      const cells = [];
      let skipCount = 0;
    
      for (let i = 0; i < 19; i++) {
        // Skip cells that are part of a multi-unit equipment
        if (skipCount > 0) {
          skipCount--;
          continue;
        }
    
        const items = Array.isArray(version[side][i]) ? version[side][i] : [];
        const isValidTarget = isDragging && dragType === 'equipment' && 
                           canDropEquipment(rack.id, side, i, draggedItem);
    
        // Calculate max size of equipment in this position
        const maxSize = items.reduce((max, eq) => Math.max(max, eq.size), 1);
    
        const cell = (
          <div
            key={`${side}-${i}`}
            className={`border text-sm transition-colors ${
              isValidTarget ? 'bg-green-100' : 'bg-gray-50'
            }`}
            style={{ 
              height: `${maxSize * 2}rem`,  // 2rem per unit
            }}
            onDragOver={(e) => {
              if (isValidTarget) e.preventDefault();
            }}
            onDrop={(e) => handleEquipmentDrop(e, rack.id, side, i)}
          >
            {items.length > 0 ? (
              <div className="flex h-full w-full overflow-hidden">
                {items.map((equipment, idx) => (
                  <div
                    key={`${equipment.id}-${idx}`}
                    draggable
                    className={`h-full flex items-center cursor-grab active:cursor-grabbing overflow-hidden border-r last:border-r-0 ${
                      equipment.status === 'obsolete' ? 'bg-red-100 hover:bg-red-200' :
                      equipment.status === 'planned' ? 'bg-green-100 hover:bg-green-200' : 
                      'bg-blue-100 hover:bg-blue-200'
                    }`}
                    style={{ 
                      width: `${equipment.width}%`,
                      minWidth: `${equipment.width}%`,
                      flexShrink: 0,
                    }}
                    onDragStart={(e) => handleDragStart(e, equipment, 'equipment', { 
                      rackId: rack.id, 
                      side,
                      position: i,
                      versionIndex: rack.activeVersion
                    })}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="px-1 truncate text-xs w-full">
                      {equipment.name}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-2 py-1">U{19 - i}</div>
            )}
          </div>
        );
    
        cells.push(cell);
    
        // Set skip count for next cells based on max equipment size
        if (items.length > 0) {
          skipCount = maxSize - 1;
          
          // Also mark the cells that should be skipped as occupied
          for (let j = 1; j < maxSize && i + j < 19; j++) {
            version[side][i + j] = version[side][i];
          }
        }
      }
    
      return cells;
    };
    const renderRackSides = (rack, versionIndex) => (
      <div className="flex gap-4">
        <div className="w-72 flex-shrink-0">
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
  
        <div className="w-1 bg-gray-300 flex-shrink-0"></div>
  
        <div className="w-72 flex-shrink-0">
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

  // Function to find first available position for equipment
  const findFirstAvailablePosition = (equipment) => {
    // Try left side first, then right side
    for (const side of ['leftSide', 'rightSide']) {
      for (let i = 0; i < 19; i++) {
        if (canDropEquipment(rack.id, side, i, equipment)) {
          return { side, position: i };
        }
      }
    }
    return null;
  };

  // Function to add equipment to first available position
  const handleAddEquipment = (equipment) => {
    const position = findFirstAvailablePosition(equipment);
    if (!position) {
      alert('No available space for this equipment in the rack');
      return;
    }

    setRacks(racks.map(r => {
      if (r.id === rack.id) {
        const newVersions = [...r.versions];
        const targetVersion = { ...newVersions[r.activeVersion] };
        const newSide = [...targetVersion[position.side]];
        
        if (!Array.isArray(newSide[position.position])) {
          newSide[position.position] = [];
        }
        
        newSide[position.position] = [...newSide[position.position], { ...equipment }];
        
        targetVersion[position.side] = newSide;
        newVersions[r.activeVersion] = targetVersion;
        return { ...r, versions: newVersions };
      }
      return r;
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold">{rack.name}</h3>
        <div className="flex items-center gap-4">
          <select
            className="p-2 border rounded"
            value={rack.activeVersion}
            onChange={(e) => {
              const newIndex = parseInt(e.target.value);
              setRacks(racks.map(r => 
                r.id === rack.id 
                  ? { ...r, activeVersion: newIndex }
                  : r
              ));
            }}
            disabled={compareMode}
          >
            {sortVersionsByDate(rack.versions).map((version, index) => (
              <option key={version.id} value={rack.versions.indexOf(version)}>
                {version.name} ({version.date})
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              const name = prompt('Enter configuration name (e.g., AMP21):');
              if (!name) return;
              const date = prompt('Enter configuration date (YYYY-MM):', 
                new Date().toISOString().split('-').slice(0, 2).join('-'));
              if (!date) return;
              createRackVersion(rack.id, name, date);
            }}
            className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            disabled={compareMode}
          >
            New Configuration
          </button>
          <button
            onClick={() => {
              if (compareMode) {
                setCompareMode(false);
                setComparedVersions([null, null]);
              } else {
                setShowComparisonModal(true);
              }
            }}
            className={`px-3 py-2 rounded ${
              compareMode ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
            disabled={rack.versions.length < 2}
          >
            {compareMode ? 'Exit Comparison' : 'Compare Versions'}
          </button>
        </div>
      </div>

      {showComparisonModal && (
        <ComparisonModal
          rack={rack}
          currentVersion={currentVersion}
          onSelect={(version) => {
            setComparedVersions([currentVersion, version]);
            setCompareMode(true);
            setShowComparisonModal(false);
          }}
          onClose={() => setShowComparisonModal(false)}
        />
      )}

      {!compareMode && <RackEquipmentSelector onAddEquipment={handleAddEquipment} />}

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
  
    // Main component return
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
                <div className="border rounded-lg p-4 bg-white">
          <h2 className="text-xl font-bold mb-4">Cabin Layout</h2>
          <div className="w-full" style={{ aspectRatio: '21/9' }}>
            {renderCabinLayout()}
          </div>
        </div>
  
        <div className="border rounded-lg p-4 bg-white">
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Configure Rack</h2>
            <RackSelector 
              racks={racks}
              selectedRack={selectedRack}
              onSelectRack={setSelectedRack}
              onCreateRack={(newRack) => {
                setRacks([...racks, newRack]);
                setSelectedRack(newRack.id);
              }}
            />
            {selectedRack ? (
              <div className="space-y-4">
                {renderRackDetail()}
              </div>
            ) : (
              <div className="text-gray-500 text-center py-8">
                Select a rack to configure
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }