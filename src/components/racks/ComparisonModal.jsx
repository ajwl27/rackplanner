// components/racks/ComparisonModal.jsx
"use client";
import React from 'react';
import { sortVersionsByDate } from '@/lib/utils/rack';

export function ComparisonModal({ rack, currentVersion, onSelect, onClose }) {
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
}