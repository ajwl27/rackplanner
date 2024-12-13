// components/racks/NotesModal.jsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export function NotesModal({ 
  open, 
  onOpenChange, 
  rack, 
  currentVersion, 
  onSave 
}) {
  const [rackNotes, setRackNotes] = useState(rack.notes || "");
  const [versionNotes, setVersionNotes] = useState(currentVersion.notes || "");

  const handleSave = () => {
    onSave({
      rackNotes,
      versionNotes
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Notes</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="rack" className="w-full">
          <TabsList>
            <TabsTrigger value="rack">Rack Notes</TabsTrigger>
            <TabsTrigger value="version">Version Notes</TabsTrigger>
          </TabsList>
          <TabsContent value="rack">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Notes for {rack.name}
              </h4>
              <Textarea
                value={rackNotes}
                onChange={(e) => setRackNotes(e.target.value)}
                placeholder="Enter notes about this rack..."
                className="min-h-[200px]"
              />
            </div>
          </TabsContent>
          <TabsContent value="version">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Notes for version {currentVersion.name}
              </h4>
              <Textarea
                value={versionNotes}
                onChange={(e) => setVersionNotes(e.target.value)}
                placeholder="Enter notes about this version..."
                className="min-h-[200px]"
              />
            </div>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Notes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}