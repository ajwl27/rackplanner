"use client";
import React, { useState } from "react";
import CabinLayout from "@/components/cabin/CabinLayout";
import { useRackManagement } from "@/hooks/useRackManagement";
import { RackSelector } from "@/components/racks/RackSelector";
import { RackDetail } from "@/components/racks/RackDetail";

export default function RackPlanner() {
  const {
    racks,
    setRacks,
    selectedRack,
    setSelectedRack,
    positions,
    handleRackPositionChange,
    handleVersionChange,
  } = useRackManagement();

  const [compareMode, setCompareMode] = useState(false);
  const [comparedVersions, setComparedVersions] = useState([null, null]);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragSource, setDragSource] = useState(null);

  const handleDragStart = (e, item, type, source = null) => {
    setIsDragging(true);
    setDragType(type);
    setDraggedItem(item);
    setDragSource(source);
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({
        item,
        type,
        source: source
          ? {
              ...source,
              versionIndex: source.rackId
                ? racks.find((r) => r.id === source.rackId)?.activeVersion
                : undefined,
            }
          : null,
      })
    );
  };

  const handleDragEnd = (e) => {
    if (e.dataTransfer.dropEffect === "none") {
      if (dragType === "equipment" && dragSource?.rackId) {
        const { rackId, side, position } = dragSource;
        setRacks(
          racks.map((rack) => {
            if (rack.id === rackId) {
              const newVersions = [...rack.versions];
              const currentVersion = { ...newVersions[rack.activeVersion] };
              const newSide = [...currentVersion[side]];

              for (let i = position; i < position + draggedItem.size; i++) {
                if (i < 19) {
                  newSide[i] = (newSide[i] || []).filter(
                    (item) => item.id !== draggedItem.id
                  );
                }
              }

              currentVersion[side] = newSide;
              newVersions[rack.activeVersion] = currentVersion;
              return { ...rack, versions: newVersions };
            }
            return rack;
          })
        );
      }
    }
    setIsDragging(false);
    setDragType(null);
    setDraggedItem(null);
    setDragSource(null);
  };

  const canDropEquipment = (rackId, side, position, equipment) => {
    const rack = racks.find((r) => r.id === rackId);
    if (!rack) return false;

    const currentVersion = rack.versions[rack.activeVersion];
    if (!currentVersion) return false;

    for (let i = position; i < position + equipment.size; i++) {
      if (i >= 19) return false;

      const itemsAtPosition = Array.isArray(currentVersion[side][i])
        ? currentVersion[side][i]
        : [];

      if (
        itemsAtPosition.length > 0 &&
        !itemsAtPosition.every((item) => item.id === equipment.id)
      ) {
        return false;
      }
    }

    const existingItems = Array.isArray(currentVersion[side][position])
      ? currentVersion[side][position]
      : [];

    const totalExistingWidth = existingItems
      .filter((item) => item.id !== equipment.id)
      .reduce((sum, item) => sum + item.width, 0);

    return totalExistingWidth + equipment.width <= 100;
  };

  const handleEquipmentDrop = (e, rackId, side, position) => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData("application/json"));
    if (data.type !== "equipment") return;

    const equipment = data.item;
    const rack = racks.find((r) => r.id === rackId);
    if (!rack || !canDropEquipment(rackId, side, position, equipment)) return;

    setRacks(
      racks.map((r) => {
        if (data.source?.rackId === r.id) {
          const newVersions = [...r.versions];
          const sourceVersion = { ...newVersions[r.activeVersion] };
          const newSourceSide = [...sourceVersion[data.source.side]];

          for (
            let i = data.source.position;
            i < data.source.position + equipment.size;
            i++
          ) {
            if (i < 19) {
              newSourceSide[i] = (newSourceSide[i] || []).filter(
                (item) => item.id !== equipment.id
              );
            }
          }

          sourceVersion[data.source.side] = newSourceSide;
          newVersions[r.activeVersion] = sourceVersion;

          if (r.id === rackId) {
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
      })
    );
  };

  const createRackVersion = (rackId, versionName, versionDate) => {
    setRacks(
      racks.map((rack) => {
        if (rack.id === rackId) {
          const currentVersion = rack.versions[rack.activeVersion];
          return {
            ...rack,
            versions: [
              ...rack.versions,
              {
                id: `VERSION_${Date.now()}`,
                name: versionName,
                date: versionDate,
                leftSide: [...currentVersion.leftSide],
                rightSide: [...currentVersion.rightSide],
              },
            ],
            activeVersion: rack.versions.length,
          };
        }
        return rack;
      })
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="border rounded-lg p-4 bg-white">
        <h2 className="text-xl font-bold mb-4">Cabin Layout</h2>
        <div className="w-full" style={{ aspectRatio: "21/9" }}>
          <CabinLayout
            racks={racks}
            positions={positions}
            onRackChange={handleRackPositionChange}
            onVersionChange={handleVersionChange}
          />
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
    {/* Find the rack first and only render if found */}
    {(() => {
      const rack = racks.find(r => r.id === selectedRack);
      if (!rack) return null;
      
      return (
        <RackDetail 
          rack={rack}
          compareMode={compareMode}
          setCompareMode={setCompareMode}
          comparedVersions={comparedVersions}
          setComparedVersions={setComparedVersions}
          showComparisonModal={showComparisonModal}
          setShowComparisonModal={setShowComparisonModal}
          dragHandlers={{
            isDragging,
            dragType,
            draggedItem,
            handleDragStart,
            handleDragEnd,
            handleEquipmentDrop,
            canDropEquipment
          }}
          setRacks={setRacks}
          createRackVersion={createRackVersion}
          canDropEquipment={canDropEquipment}
        />
      );
    })()}
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
