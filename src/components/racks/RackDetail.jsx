// components/racks/RackDetail.jsx
"use client";
import React, { useState } from "react";
import { RackEquipmentSelector } from "./RackEquipmentSelector";
import { ComparisonModal } from "./ComparisonModal";
import { sortVersionsByDate } from "@/lib/utils/rack";
import { Button } from "@/components/ui/button";
import { NotesModal } from "./NotesModal";
import html2pdf from "html2pdf.js";
import { createRoot } from "react-dom/client";
import { Download, NotebookPen } from "lucide-react";
import RackPDFView from './RackPDFView';


function renderRackSide(rack, versionIndex, side, {
  isDragging,
  dragType,
  draggedItem,
  canDropEquipment,
  handleDragStart,
  handleDragEnd,
  handleEquipmentDrop
}) {
  const version = rack.versions[versionIndex];
  if (!version) return [];

  const cells = [];
  let skipCount = 0;

  for (let i = 0; i < 22; i++) {
    if (skipCount > 0) {
      skipCount--;
      continue;
    }
    const items = Array.isArray(version[side][i]) ? version[side][i] : [];
    const isValidTarget = isDragging && dragType === 'equipment' &&
                       canDropEquipment(rack.id, side, i, draggedItem);
    const maxSize = items.reduce((max, eq) => Math.max(max, eq.size), 1);
    const cell = (
      <div
        key={`${side}-${i}`}
        className={`border ${
          isValidTarget ? 'bg-green-100' : 'bg-gray-50'
        }`}
        style={{ 
          height: `${maxSize * 2}rem`,
          background: items.length === 0 ? 'repeating-linear-gradient(45deg, #f0f0f0, #f0f0f0 10px, #f8f8f8 10px, #f8f8f8 20px)' : undefined
        }}
        onDragOver={(e) => {
          if (isValidTarget) e.preventDefault();
        }}
        onDrop={(e) => handleEquipmentDrop(e, rack.id, side, i)}
      >
        {items.length > 0 ? (
          <div className="flex h-full w-full overflow-hidden p-0.5">
            {items.map((equipment, idx) => (
              <div
                key={`${equipment.id}-${idx}`}
                draggable
                className={`h-full flex items-center cursor-grab active:cursor-grabbing overflow-hidden border-2 border-gray-400 rounded m-0.5 shadow-sm ${
                  equipment.status === 'obsolete' ? 'bg-red-100 hover:bg-red-200' :
                  equipment.status === 'planned' ? 'bg-blue-100 hover:bg-blue-200' :
                  'bg-green-100 hover:bg-green-200'
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
                <div className="px-2 py-1 truncate text-xs w-full font-medium">
                  {equipment.name}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-2 py-1 text-xs text-gray-600 font-medium">U{22 - i}</div>
        )}
      </div>
    );
    cells.push(cell);
    if (items.length > 0) {
      skipCount = maxSize - 1;
      for (let j = 1; j < maxSize && i + j < 22; j++) {
        version[side][i + j] = version[side][i];
      }
    }
  }
  return cells;
}
function RackSides({ rack, versionIndex, dragHandlers }) {
  return (
    <div className="flex gap-4">
      <div className="w-72 flex-shrink-0">
        <div className="text-center font-bold mb-2">Aisle Side</div>
        <div className="flex">
          <div
            className="flex flex-col justify-between pr-2 text-sm font-semibold text-gray-600 py-1"
            style={{ height: "44rem" }}
          >
            <div>Top</div>
            <div>Bottom</div>
          </div>
          <div className="flex-1">
            <div className="flex flex-col">
              {renderRackSide(rack, versionIndex, "leftSide", {
                ...dragHandlers,
                canDropEquipment: dragHandlers.canDropEquipment,
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="w-1 bg-gray-300 flex-shrink-0"></div>

      <div className="w-72 flex-shrink-0">
        <div className="text-center font-bold mb-2">Window Side</div>
        <div className="flex flex-col">
          {renderRackSide(rack, versionIndex, "rightSide", {
            ...dragHandlers,
            canDropEquipment: dragHandlers.canDropEquipment,
          })}
        </div>
      </div>
    </div>
  );
}

export function RackDetail({
  rack,
  compareMode,
  setCompareMode,
  comparedVersions,
  setComparedVersions,
  showComparisonModal,
  setShowComparisonModal,
  dragHandlers,
  setRacks,
  createRackVersion,
  canDropEquipment,
}) {
  //  safety check
  if (!rack) return null;

  const [showNotesModal, setShowNotesModal] = useState(false);
  const currentVersion = rack.versions[rack.activeVersion];

  const findFirstAvailablePosition = (equipment) => {
    for (const side of ["leftSide", "rightSide"]) {
      for (let i = 0; i < 22; i++) {
        if (canDropEquipment(rack.id, side, i, equipment)) {
          return { side, position: i };
        }
      }
    }
    return null;
  };
  const handleNotesUpdate = ({ rackNotes, versionNotes }) => {
    setRacks((racks) =>
      racks.map((r) => {
        if (r.id === rack.id) {
          const newVersions = [...r.versions];
          newVersions[r.activeVersion] = {
            ...newVersions[r.activeVersion],
            notes: versionNotes,
          };
          return {
            ...r,
            notes: rackNotes,
            versions: newVersions,
          };
        }
        return r;
      })
    );
  };

  const handleAddEquipment = (equipment) => {
    const position = findFirstAvailablePosition(equipment);
    if (!position) {
      alert("No available space for this equipment in the rack");
      return;
    }

    setRacks((racks) =>
      racks.map((r) => {
        if (r.id === rack.id) {
          const newVersions = [...r.versions];
          const targetVersion = { ...newVersions[r.activeVersion] };
          const newSide = [...targetVersion[position.side]];

          if (!Array.isArray(newSide[position.position])) {
            newSide[position.position] = [];
          }

          newSide[position.position] = [
            ...newSide[position.position],
            { ...equipment },
          ];

          targetVersion[position.side] = newSide;
          newVersions[r.activeVersion] = targetVersion;
          return { ...r, versions: newVersions };
        }
        return r;
      })
    );
  };
  async function handlePDFGeneration() {
    try {
      const tempContainer = document.createElement("div");
      tempContainer.style.width = "1100px";
      document.body.appendChild(tempContainer);

      // Create a new root for React rendering
      const root = createRoot(tempContainer);

      // Wait for the component to render
      await new Promise((resolve) => {
        root.render(
          <RackPDFView rack={rack} versionIndex={rack.activeVersion} />
        );
        setTimeout(resolve, 100);
      });

      // PDF options
      const opt = {
        margin: 10,
        filename: `${rack.name}_${currentVersion.name}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
      };

      // Generate and save the PDF
      await html2pdf().set(opt).from(tempContainer).save();

      // Cleanup
      document.body.removeChild(tempContainer);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-bold">{rack.name}</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowNotesModal(true)}
            className="flex items-center gap-2"
          >
            <NotebookPen className="h-4 w-4" />
            Notes
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePDFGeneration}
            className="flex items-center gap-2"
            disabled={compareMode}
          >
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
        <div className="flex items-center gap-4">
          <select
            className="p-2 border rounded"
            value={rack.activeVersion}
            onChange={(e) => {
              const newIndex = parseInt(e.target.value);
              setRacks((racks) =>
                racks.map((r) =>
                  r.id === rack.id ? { ...r, activeVersion: newIndex } : r
                )
              );
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
              const name = prompt("Enter configuration name (e.g., AMP21):");
              if (!name) return;
              const date = prompt(
                "Enter configuration date (YYYY-MM):",
                new Date().toISOString().split("-").slice(0, 2).join("-")
              );
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
              compareMode
                ? "bg-blue-500 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
            disabled={rack.versions.length < 2}
          >
            {compareMode ? "Exit Comparison" : "Compare Versions"}
          </button>
        </div>
      </div>

      <NotesModal
        open={showNotesModal}
        onOpenChange={setShowNotesModal}
        rack={rack}
        currentVersion={currentVersion}
        onSave={handleNotesUpdate}
      />

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

      {!compareMode && (
        <RackEquipmentSelector onAddEquipment={handleAddEquipment} />
      )}

      <div className="flex gap-4">
        <div className="flex-1">
          <div className="text-center font-bold mb-2">
            {currentVersion.name} ({currentVersion.date})
          </div>
          <RackSides
            rack={rack}
            versionIndex={rack.activeVersion}
            dragHandlers={dragHandlers}
          />
        </div>
        {compareMode && comparedVersions[1] && (
          <div className="flex-1">
            <div className="text-center font-bold mb-2">
              {comparedVersions[1].name} ({comparedVersions[1].date})
            </div>
            <RackSides
              rack={rack}
              versionIndex={rack.versions.findIndex(
                (v) => v.id === comparedVersions[1].id
              )}
              dragHandlers={dragHandlers}
            />
          </div>
        )}
      </div>
    </div>
  );
}
