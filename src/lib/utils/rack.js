// lib/utils/rack.js
export function createEmptyRack(name = "Untitled Rack", version = {
  name: "Initial",
  date: new Date().toISOString().split('T')[0]
}) {
  return {
    id: `RACK_${Date.now()}`,
    name,
    notes: "",  // Add this
    versions: [{
      id: `VERSION_${Date.now()}`,
      name: version.name,
      date: version.date,
      notes: "",  // Add this
      leftSide: Array(22).fill().map(() => []),
      rightSide: Array(22).fill().map(() => [])
    }],
    activeVersion: 0
  };
}

export function sortVersionsByDate(versions) {
  return [...versions].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB - dateA;  // newest first
  });
}
