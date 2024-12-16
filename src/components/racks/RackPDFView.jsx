import React from 'react';
import { Table } from "@/components/ui/table";

const RackPDFView = ({ rack, versionIndex }) => {
  // Get equipment list for the rack
  const getEquipmentList = (rack, versionIndex) => {
    const version = rack.versions[versionIndex];
    const equipment = [];
    let counter = 1;

    ['leftSide', 'rightSide'].forEach(side => {
      version[side].forEach((items, position) => {
        if (Array.isArray(items)) {
          items.forEach(item => {
            if (!equipment.some(e => e.id === item.id)) {
              equipment.push({
                ...item,
                reference: counter++,
                side: side === 'leftSide' ? 'Aisle' : 'Window',
                position: 22 - position
              });
            }
          });
        }
      });
    });

    return equipment;
  };

  const equipment = getEquipmentList(rack, versionIndex);

  // Function to render a single rack side
  const renderRackSide = (equipment, side) => {
    const sideEquipment = equipment.filter(e => e.side === side);
    const cells = [];
    
    for (let i = 0; i < 22; i++) {
      const position = 22 - i;
      const itemsAtPosition = sideEquipment.filter(e => e.position === position);
      
      if (itemsAtPosition.length > 0) {
        cells.push(
          <div
            key={`${side}-${i}`}
            className="border bg-gray-50 flex"
            style={{ 
              height: `${itemsAtPosition[0].size * 24}px`,
              marginBottom: '1px'
            }}
          >
            {itemsAtPosition.map(item => (
              <div
                key={item.id}
                className="flex items-center overflow-hidden"
                style={{ width: `${item.width}%` }}
              >
                <div className="p-1 text-xs">
                  <span className="font-bold mr-1">{item.reference}</span>
                  {item.name}
                </div>
              </div>
            ))}
          </div>
        );
        i += itemsAtPosition[0].size - 1;
      } else {
        cells.push(
          <div
            key={`${side}-${i}`}
            className="border bg-gray-50"
            style={{ height: '24px', marginBottom: '1px' }}
          >
            <div className="p-1 text-xs">U{position}</div>
          </div>
        );
      }
    }
    return cells;
  };

  return (
    <div className="w-full max-w-[1100px] mx-auto p-8 space-y-8 bg-white">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">{rack.name}</h1>
        <h2 className="text-xl">
          Configuration: {rack.versions[versionIndex].name} 
          ({rack.versions[versionIndex].date})
        </h2>
      </div>

      <div className="flex gap-8 justify-center">
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="w-72">
              <div className="text-center font-bold mb-2">Aisle Side</div>
              <div className="flex flex-col">
                {renderRackSide(equipment, 'Aisle')}
              </div>
            </div>
            <div className="w-72">
              <div className="text-center font-bold mb-2">Window Side</div>
              <div className="flex flex-col">
                {renderRackSide(equipment, 'Window')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Equipment Table */}
      <div className="mt-8">
        <h3 className="text-lg font-bold mb-4">Equipment List</h3>
        <Table>
          <thead>
            <tr>
              <th className="text-left p-2">#</th>
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">Side</th>
              <th className="text-left p-2">Position</th>
              <th className="text-left p-2">Size</th>
              <th className="text-left p-2">Width</th>
              <th className="text-left p-2">Status</th>
              <th className="text-left p-2">Category</th>
              <th className="text-left p-2">Power</th>
              <th className="text-left p-2">Owner</th>
            </tr>
          </thead>
          <tbody>
            {equipment.map(item => (
              <tr key={item.id} className="border-t">
                <td className="p-2">{item.reference}</td>
                <td className="p-2">{item.name}</td>
                <td className="p-2">{item.side}</td>
                <td className="p-2">U{item.position}</td>
                <td className="p-2">{item.size}U</td>
                <td className="p-2">{item.width}%</td>
                <td className="p-2">{item.status}</td>
                <td className="p-2">{item.category}</td>
                <td className="p-2">{item.power}W</td>
                <td className="p-2">{item.owner}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default RackPDFView;