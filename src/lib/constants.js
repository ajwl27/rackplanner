//lib/constants.js
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

export { initialEquipment, aircraftPositions };