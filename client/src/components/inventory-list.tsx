import React, { useState, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit, Trash2 } from "lucide-react";
import { type Medicine } from "@/lib/store";
import BulkActions from "@/components/bulk-actions";

interface InventoryListProps {
  medicines: Medicine[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function InventoryList({ medicines, onEdit, onDelete }: InventoryListProps) {
  const [selectedMedicines, setSelectedMedicines] = useState<Medicine[]>([]);
  const [selectMode, setSelectMode] = useState(false);
  
  const getStatusBadge = (quantity: number) => {
    if (quantity === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    } else {
      return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">In Stock</Badge>;
    }
  };
  
  const toggleMedicineSelection = (medicine: Medicine) => {
    if (selectedMedicines.some(m => m.id === medicine.id)) {
      setSelectedMedicines(selectedMedicines.filter(m => m.id !== medicine.id));
    } else {
      setSelectedMedicines([...selectedMedicines, medicine]);
    }
    
    // If no medicines are selected anymore, exit select mode
    if (selectedMedicines.length === 1) {
      setSelectMode(false);
    }
  };
  
  const handleBulkSelectionChange = (selected: boolean, medicinesToSelect: Medicine[]) => {
    // This function will be called from BulkActions component
    if (selected) {
      // When "Select All" is clicked, select ALL medicines from the main list
      setSelectedMedicines([...medicines]);
    }
  };
  
  const clearSelection = () => {
    setSelectedMedicines([]);
    setSelectMode(false);
  };
  
  // Long press detection to enter select mode on mobile
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const handleTouchStart = (medicine: Medicine) => {
    longPressTimerRef.current = setTimeout(() => {
      setSelectMode(true);
      toggleMedicineSelection(medicine);
    }, 600); // 600ms for long press
  };
  
  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  return (
    <div className="relative">
      <div className="bg-card shadow-xl overflow-hidden rounded-lg mb-6 premium-card glass-effect pulse-glow">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-purple-50/40 to-indigo-50/40 dark:from-purple-900/10 dark:to-indigo-900/10">
              <TableHead className="w-[50px]">
                {/* Always show checkbox header (Gmail-style) */}
                <Checkbox
                  checked={selectedMedicines.length === medicines.length && medicines.length > 0}
                  onCheckedChange={(checked) => {
                    setSelectMode(true);
                    if (checked) {
                      setSelectedMedicines([...medicines]);
                    } else {
                      setSelectedMedicines([]);
                    }
                  }}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead>Medicine Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {medicines.map((medicine) => (
              <TableRow 
                key={medicine.id}
                className={selectMode ? "cursor-pointer hover:bg-muted/50" : undefined}
                onClick={selectMode ? () => toggleMedicineSelection(medicine) : undefined}
                onTouchStart={() => handleTouchStart(medicine)}
                onTouchEnd={handleTouchEnd}
                onTouchMove={handleTouchEnd}
                onTouchCancel={handleTouchEnd}
                data-state={selectedMedicines.some(m => m.id === medicine.id) ? "selected" : ""}
              >
                <TableCell className="w-[50px]">
                  <Checkbox
                    checked={selectedMedicines.some(m => m.id === medicine.id)}
                    onCheckedChange={(checked) => {
                      setSelectMode(true);
                      if (checked) {
                        setSelectedMedicines([...selectedMedicines, medicine]);
                      } else {
                        setSelectedMedicines(selectedMedicines.filter(m => m.id !== medicine.id));
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Select ${medicine.name}`}
                  />
                </TableCell>
                <TableCell>
                  <div className="font-medium medicine-container">
                    <span className="premium-gradient-text">{medicine.name}</span>
                    <div className="text-sm text-muted-foreground">{medicine.potency}</div>
                    {medicine.bottleSize && (
                      <div className="text-xs text-muted-foreground">{medicine.bottleSize}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>{medicine.company}</TableCell>
                <TableCell>
                  <div>{medicine.location}</div>
                  {medicine.subLocation && (
                    <div className="text-sm text-muted-foreground">{medicine.subLocation}</div>
                  )}
                </TableCell>
                <TableCell>{medicine.quantity}</TableCell>
                <TableCell>{getStatusBadge(medicine.quantity)}</TableCell>
                <TableCell className="text-right">
                  {!selectMode && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(medicine.id);
                        }}
                        className="text-secondary h-8 w-8 p-0 mr-1 premium-simple-button premium-glow button-press"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(medicine.id);
                        }}
                        className="text-destructive h-8 w-8 p-0 premium-simple-button premium-glow button-press"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}

                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* No floating button, checkboxes will be used instead */}
      
      {/* Bulk Actions component */}
      {selectedMedicines.length > 0 && (
        <BulkActions
          selectedMedicines={selectedMedicines}
          onClearSelection={clearSelection}
          onSelectionChange={handleBulkSelectionChange}
        />
      )}
    </div>
  );
}
