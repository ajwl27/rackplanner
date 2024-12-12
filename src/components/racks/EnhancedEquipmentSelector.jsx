import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Filter } from "lucide-react";
import { initialEquipment } from '@/lib/constants';

// Column definitions with fixed widths
const columns = [
  { key: 'name', header: 'Name', width: '20%' },
  { key: 'category', header: 'Category', width: '15%' },
  { key: 'status', header: 'Status', width: '12%' },
  { key: 'size', header: 'Size', width: '10%' },
  { key: 'width', header: 'Width', width: '10%' },
  { key: 'power', header: 'Power', width: '12%' },
  { key: 'owner', header: 'Owner', width: '15%' },
  { key: 'actions', header: '', width: '6%' }
];

export default function EnhancedEquipmentSelector({ onAddEquipment }) {
  // Track which filters are active and their values
  const [activeFilters, setActiveFilters] = useState({
    name: false,
    status: false,
    category: false,
    owner: false
  });

  // Track filter values
  const [filterValues, setFilterValues] = useState({
    name: "",
    status: [],
    category: [],
    owner: []
  });

  // Get unique values for each field
  const filterOptions = useMemo(() => ({
    status: [...new Set(initialEquipment.map(eq => eq.status))],
    category: [...new Set(initialEquipment.map(eq => eq.category))],
    owner: [...new Set(initialEquipment.map(eq => eq.owner))]
  }), []);

  // Filter equipment based on active filters
  const filteredEquipment = useMemo(() => {
    return initialEquipment.filter(eq => {
      const nameMatch = !activeFilters.name || 
        eq.name.toLowerCase().includes(filterValues.name.toLowerCase());
      const statusMatch = !activeFilters.status || 
        filterValues.status.length === 0 || 
        filterValues.status.includes(eq.status);
      const categoryMatch = !activeFilters.category || 
        filterValues.category.length === 0 || 
        filterValues.category.includes(eq.category);
      const ownerMatch = !activeFilters.owner || 
        filterValues.owner.length === 0 || 
        filterValues.owner.includes(eq.owner);
      
      return nameMatch && statusMatch && categoryMatch && ownerMatch;
    });
  }, [activeFilters, filterValues]);

  // Count active filters
  const activeFilterCount = Object.values(activeFilters).filter(Boolean).length;

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="ml-2 rounded-full bg-primary w-5 h-5 text-xs flex items-center justify-center text-primary-foreground">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h4 className="font-medium">Filter Equipment</h4>
                
                {/* Name filter */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      checked={activeFilters.name}
                      onCheckedChange={(checked) => 
                        setActiveFilters(prev => ({...prev, name: checked}))
                      }
                    />
                    <label className="text-sm">Filter by name</label>
                  </div>
                  {activeFilters.name && (
                    <Input
                      placeholder="Enter name..."
                      value={filterValues.name}
                      onChange={(e) => setFilterValues(prev => ({
                        ...prev,
                        name: e.target.value
                      }))}
                    />
                  )}
                </div>

                {/* Status filter */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      checked={activeFilters.status}
                      onCheckedChange={(checked) => 
                        setActiveFilters(prev => ({...prev, status: checked}))
                      }
                    />
                    <label className="text-sm">Filter by status</label>
                  </div>
                  {activeFilters.status && (
                    <div className="grid grid-cols-2 gap-2">
                      {filterOptions.status.map(status => (
                        <div key={status} className="flex items-center gap-2">
                          <Checkbox 
                            checked={filterValues.status.includes(status)}
                            onCheckedChange={(checked) => {
                              setFilterValues(prev => ({
                                ...prev,
                                status: checked 
                                  ? [...prev.status, status]
                                  : prev.status.filter(s => s !== status)
                              }));
                            }}
                          />
                          <label className="text-sm">{status}</label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Category filter */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      checked={activeFilters.category}
                      onCheckedChange={(checked) => 
                        setActiveFilters(prev => ({...prev, category: checked}))
                      }
                    />
                    <label className="text-sm">Filter by category</label>
                  </div>
                  {activeFilters.category && (
                    <div className="grid grid-cols-1 gap-2">
                      {filterOptions.category.map(category => (
                        <div key={category} className="flex items-center gap-2">
                          <Checkbox 
                            checked={filterValues.category.includes(category)}
                            onCheckedChange={(checked) => {
                              setFilterValues(prev => ({
                                ...prev,
                                category: checked 
                                  ? [...prev.category, category]
                                  : prev.category.filter(c => c !== category)
                              }));
                            }}
                          />
                          <label className="text-sm">{category}</label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Owner filter */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      checked={activeFilters.owner}
                      onCheckedChange={(checked) => 
                        setActiveFilters(prev => ({...prev, owner: checked}))
                      }
                    />
                    <label className="text-sm">Filter by owner</label>
                  </div>
                  {activeFilters.owner && (
                    <div className="grid grid-cols-1 gap-2">
                      {filterOptions.owner.map(owner => (
                        <div key={owner} className="flex items-center gap-2">
                          <Checkbox 
                            checked={filterValues.owner.includes(owner)}
                            onCheckedChange={(checked) => {
                              setFilterValues(prev => ({
                                ...prev,
                                owner: checked 
                                  ? [...prev.owner, owner]
                                  : prev.owner.filter(o => o !== owner)
                              }));
                            }}
                          />
                          <label className="text-sm">{owner}</label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setActiveFilters({
                        name: false,
                        status: false,
                        category: false,
                        owner: false
                      });
                      setFilterValues({
                        name: "",
                        status: [],
                        category: [],
                        owner: []
                      });
                    }}
                  >
                    Clear All
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      const someValuesSelected = Object.entries(activeFilters).some(([key, isActive]) => {
                        if (!isActive) return false;
                        if (key === 'name') return filterValues.name !== "";
                        return filterValues[key].length > 0;
                      });
                      
                      if (!someValuesSelected) {
                        setActiveFilters({
                          name: false,
                          status: false,
                          category: false,
                          owner: false
                        });
                      }
                    }}
                  >
                    Done
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="border rounded-md">
        <div className="relative">
          <div className="overflow-hidden">
            <div className="overflow-auto max-h-[280px]">
              <Table>
                <TableHeader className="sticky top-0 bg-white z-10">
                  <TableRow>
                    {columns.map(column => (
                      <TableHead 
                        key={column.key}
                        style={{ width: column.width }}
                        className="bg-white"
                      >
                        {column.header}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEquipment.map((equipment) => (
                    <TableRow key={equipment.id}>
                      <TableCell className="font-medium" style={{ width: columns[0].width }}>
                        {equipment.name}
                      </TableCell>
                      <TableCell style={{ width: columns[1].width }}>
                        {equipment.category}
                      </TableCell>
                      <TableCell style={{ width: columns[2].width }}>
                        <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium
                          ${equipment.status === 'active' ? 'bg-green-100 text-green-800' : 
                            equipment.status === 'obsolete' ? 'bg-red-100 text-red-800' : 
                            'bg-blue-100 text-blue-800'}`}>
                          {equipment.status}
                        </div>
                      </TableCell>
                      <TableCell style={{ width: columns[3].width }}>
                        {equipment.size}U
                      </TableCell>
                      <TableCell style={{ width: columns[4].width }}>
                        {equipment.width}%
                      </TableCell>
                      <TableCell style={{ width: columns[5].width }}>
                        {equipment.power}W
                      </TableCell>
                      <TableCell style={{ width: columns[6].width }}>
                        {equipment.owner}
                      </TableCell>
                      <TableCell style={{ width: columns[7].width }}>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => onAddEquipment(equipment)}
                        >
                          Add
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}