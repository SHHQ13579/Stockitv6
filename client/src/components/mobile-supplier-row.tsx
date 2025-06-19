import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";

interface MobileSupplierRowProps {
  supplier: {
    name: string;
    allocation: string;
  };
  index: number;
  canRemove: boolean;
  onUpdate: (index: number, field: "name" | "allocation", value: string) => void;
  onRemove: (index: number) => void;
}

export default function MobileSupplierRow({ 
  supplier, 
  index, 
  canRemove, 
  onUpdate, 
  onRemove 
}: MobileSupplierRowProps) {
  return (
    <div className="bg-slate-50 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">Supplier {index + 1}</Label>
        {canRemove && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(index)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 size={16} />
          </Button>
        )}
      </div>
      
      <div className="space-y-3">
        <div>
          <Label htmlFor={`supplier-name-${index}`} className="text-sm">Supplier Name</Label>
          <Input
            id={`supplier-name-${index}`}
            value={supplier.name}
            onChange={(e) => onUpdate(index, "name", e.target.value)}
            placeholder="Enter supplier name"
            className="text-base h-11"
          />
        </div>
        
        <div>
          <Label htmlFor={`supplier-allocation-${index}`} className="text-sm">Allocation Amount</Label>
          <Input
            id={`supplier-allocation-${index}`}
            type="number"
            step="0.01"
            value={supplier.allocation}
            onChange={(e) => onUpdate(index, "allocation", e.target.value)}
            placeholder="0.00"
            className="text-base h-11"
          />
        </div>
      </div>
    </div>
  );
}