import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/currency";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileSupplierRow from "./mobile-supplier-row";
import type { ProfessionalBudget, ProfessionalSupplier, InsertProfessionalBudget, InsertProfessionalSupplier, User } from "@shared/schema";

interface ProfessionalBudgetProps {
  currency: string;
}

interface Supplier {
  id?: number;
  name: string;
  allocation: string;
}

export default function ProfessionalBudget({ currency, user }: ProfessionalBudgetProps) {
  const isMobile = useIsMobile();
  const [netServices, setNetServices] = useState("");
  const [budgetPercent, setBudgetPercent] = useState(user?.defaultProfessionalBudgetPercent || "7.0");
  const [suppliers, setSuppliers] = useState<Supplier[]>([
    { name: "", allocation: "" }
  ]);
  const [undoStack, setUndoStack] = useState<{ netServices: string; suppliers: Supplier[]; budgetPercent: string }[]>([]);

  // Refs for keyboard navigation
  const netServicesRef = useRef<HTMLInputElement>(null);
  const budgetPercentRef = useRef<HTMLInputElement>(null);
  const supplierRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: budgetData } = useQuery<{ budget: ProfessionalBudget; suppliers: ProfessionalSupplier[] } | null>({
    queryKey: ["/api/professional-budget"],
    retry: false,
  });

  const updateBudgetPercentMutation = useMutation({
    mutationFn: async (budgetPercent: string) => {
      const response = await apiRequest("PATCH", "/api/auth/user/professional-budget-percent", { budgetPercent });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Default professional budget percentage updated" });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({ title: "Error", description: "Failed to update budget percentage", variant: "destructive" });
    },
  });

  const saveBudgetMutation = useMutation({
    mutationFn: async (data: { budget: any; suppliers: any[] }) => {
      const response = await apiRequest("POST", "/api/professional-budget", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/professional-budget"] });
      toast({ title: "Success", description: "Budget saved successfully" });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized", 
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({ title: "Error", description: "Failed to save budget", variant: "destructive" });
    },
  });

  useEffect(() => {
    if (budgetData) {
      setNetServices(budgetData.budget.netServices);
      setBudgetPercent(budgetData.budget.budgetPercent);
      setSuppliers(budgetData.suppliers.map(s => ({
        id: s.id,
        name: s.name,
        allocation: s.allocation
      })));
    }
  }, [budgetData]);

  const totalBudget = parseFloat(netServices || "0") * (parseFloat(budgetPercent || "0") / 100);
  const totalAllocated = suppliers.reduce((sum, supplier) => sum + parseFloat(supplier.allocation || "0"), 0);
  const remaining = totalBudget - totalAllocated;
  const utilization = totalBudget > 0 ? (totalAllocated / totalBudget) * 100 : 0;

  const saveToUndoStack = () => {
    setUndoStack(prev => [...prev.slice(-9), { 
      netServices, 
      suppliers: suppliers.map(s => ({ ...s })), // Deep copy
      budgetPercent 
    }]);
  };



  const addSupplier = () => {
    saveToUndoStack();
    setSuppliers([...suppliers, { name: "", allocation: "" }]);
  };

  const removeSupplier = (index: number) => {
    if (suppliers.length > 1) {
      saveToUndoStack();
      setSuppliers(suppliers.filter((_, i) => i !== index));
    }
  };

  const handleSave = () => {
    const budgetData = {
      netServices: netServices || "0",
      budgetPercent: budgetPercent || "0",
      currency,
    };

    const supplierData = suppliers
      .filter(s => s.name.trim() && s.allocation.trim())
      .map(s => ({
        name: s.name,
        allocation: s.allocation,
      }));

    saveBudgetMutation.mutate({ budget: budgetData, suppliers: supplierData });
  };

  const handleClear = () => {
    saveToUndoStack();
    setNetServices("");
    setSuppliers([{ name: "", allocation: "" }]);
    setShouldSaveUndo(true);
  };

  const handleUndo = () => {
    if (undoStack.length > 0) {
      const previousState = undoStack[undoStack.length - 1];
      setNetServices(previousState.netServices);
      setSuppliers(previousState.suppliers.map(s => ({ ...s })));
      setBudgetPercent(previousState.budgetPercent);
      setUndoStack(prev => prev.slice(0, -1));
    }
  };

  // Track if we need to save undo on next change
  const [shouldSaveUndo, setShouldSaveUndo] = useState(true);

  const handleNetServicesChange = (value: string) => {
    if (shouldSaveUndo) {
      saveToUndoStack();
      setShouldSaveUndo(false);
    }
    setNetServices(value);
  };

  const handleBudgetPercentChange = (value: string) => {
    if (shouldSaveUndo) {
      saveToUndoStack();
      setShouldSaveUndo(false);
    }
    setBudgetPercent(value);
  };

  const handleSupplierChange = (index: number, field: keyof Supplier, value: string) => {
    if (shouldSaveUndo) {
      saveToUndoStack();
      setShouldSaveUndo(false);
    }
    const newSuppliers = [...suppliers];
    newSuppliers[index] = { ...newSuppliers[index], [field]: value };
    setSuppliers(newSuppliers);
  };

  // Reset undo flag when fields lose focus or on key navigation
  const handleFieldBlur = () => {
    setShouldSaveUndo(true);
  };

  // Handle Enter key navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, nextRef?: React.RefObject<HTMLInputElement>) => {
    if (e.key === 'Enter' && nextRef?.current) {
      nextRef.current.focus();
    }
  };

  return (
    <div className="space-y-4 sm:space-y-8">
      <div className="mb-4 sm:mb-8">
        <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 mb-2">Professional Stock Budget</h2>
        <p className="text-base sm:text-xl text-slate-600">
          Manage your professional stock budget based on service revenue
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
        {/* Budget Setup */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <Card className="print-friendly">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl">Budget Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Label htmlFor="netServices" className="text-lg font-medium">Total Salon Net Services</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info size={18} className="text-slate-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-base">Total revenue from salon services</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    ref={netServicesRef}
                    id="netServices"
                    type="number"
                    step="0.01"
                    value={netServices}
                    onChange={(e) => handleNetServicesChange(e.target.value)}
                    onBlur={handleFieldBlur}
                    onKeyDown={(e) => handleKeyDown(e, budgetPercentRef)}
                    placeholder="0.00"
                    className="text-xl h-12"
                  />
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Label htmlFor="budgetPercent" className="text-lg font-medium">Professional Stock Budget (%)</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info size={18} className="text-slate-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-base">Percentage of service revenue allocated to professional stock</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    ref={budgetPercentRef}
                    id="budgetPercent"
                    type="number"
                    step="0.1"
                    max="100"
                    value={budgetPercent}
                    onChange={(e) => handleBudgetPercentChange(e.target.value)}
                    onBlur={handleFieldBlur}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        // Focus on first supplier name field
                        const firstSupplierRef = supplierRefs.current['name-0'];
                        if (firstSupplierRef) firstSupplierRef.focus();
                      }
                    }}
                    placeholder="7.0"
                    className="text-xl h-12"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="print-friendly">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">Supplier Allocations</CardTitle>
                <Button
                  onClick={addSupplier}
                  className="bg-brand-blue hover:bg-blue-700 no-print text-base px-4 py-2"
                >
                  <Plus className="mr-2" size={18} />
                  Add Supplier
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
{isMobile ? (
                // Mobile view - stacked layout
                suppliers.map((supplier, index) => (
                  <MobileSupplierRow
                    key={index}
                    supplier={supplier}
                    index={index}
                    canRemove={suppliers.length > 1}
                    onUpdate={updateSupplier}
                    onRemove={removeSupplier}
                  />
                ))
              ) : (
                // Desktop view - grid layout
                suppliers.map((supplier, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                      <Label htmlFor={`supplier-name-${index}`} className="text-lg font-medium">Supplier Name</Label>
                      <Input
                        ref={(el) => supplierRefs.current[`name-${index}`] = el}
                        id={`supplier-name-${index}`}
                        value={supplier.name}
                        onChange={(e) => handleSupplierChange(index, "name", e.target.value)}
                        onBlur={handleFieldBlur}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const allocationRef = supplierRefs.current[`allocation-${index}`];
                            if (allocationRef) allocationRef.focus();
                          }
                        }}
                        placeholder="Enter supplier name"
                        className="text-xl h-12"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`supplier-allocation-${index}`} className="text-lg font-medium">Allocation Amount</Label>
                      <Input
                        ref={(el) => supplierRefs.current[`allocation-${index}`] = el}
                        id={`supplier-allocation-${index}`}
                        type="number"
                        step="0.01"
                        value={supplier.allocation}
                        onChange={(e) => handleSupplierChange(index, "allocation", e.target.value)}
                        onBlur={handleFieldBlur}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const nextIndex = index + 1;
                            if (nextIndex < suppliers.length) {
                              const nextNameRef = supplierRefs.current[`name-${nextIndex}`];
                              if (nextNameRef) nextNameRef.focus();
                            }
                          }
                        }}
                        placeholder="0.00"
                        className="text-xl h-12"
                      />
                    </div>
                    <div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSupplier(index)}
                        className="text-red-600 hover:bg-red-50 no-print px-4 py-2"
                        disabled={suppliers.length === 1}
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <div className="no-print flex flex-wrap gap-2 sm:gap-4">
            <Button
              onClick={handleUndo}
              variant="outline"
              disabled={undoStack.length === 0}
              className="text-lg px-6 py-3 border-slate-300 hover:bg-slate-50"
            >
              Undo ({undoStack.length})
            </Button>
            <Button
              onClick={handleSave}
              disabled={saveBudgetMutation.isPending}
              className="bg-brand-blue hover:bg-blue-700 text-lg px-6 py-3"
            >
              {saveBudgetMutation.isPending ? "Saving..." : "Save Budget"}
            </Button>
            <Button
              onClick={handleClear}
              variant="outline"
              className="text-lg px-6 py-3 border-slate-300 hover:bg-slate-50"
            >
              Clear
            </Button>
          </div>
        </div>

        {/* Budget Summary */}
        <div className="lg:col-span-1">
          <Card className="print-friendly">
            <CardHeader>
              <CardTitle className="text-2xl">Budget Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-medium text-blue-700">Total Budget</span>
                  <span className="text-3xl font-bold text-blue-700">
                    {formatCurrency(totalBudget, currency)}
                  </span>
                </div>
                <div className="text-base text-blue-600 opacity-80">Available for stock purchases</div>
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-medium text-slate-600">Allocated</span>
                  <span className="text-xl font-semibold text-slate-900">
                    {formatCurrency(totalAllocated, currency)}
                  </span>
                </div>
                <div className="text-base text-slate-500">Assigned to suppliers</div>
              </div>

              <div className={`rounded-lg p-4 ${
                remaining < 0
                  ? 'bg-red-50 border border-red-200'
                  : 'bg-green-50 border border-green-200'
              }`}>
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-lg font-medium ${
                    remaining < 0 ? 'text-red-700' : 'text-green-700'
                  }`}>
                    {remaining < 0 ? 'Over Budget' : 'Remaining'}
                  </span>
                  <span className={`text-2xl font-bold ${
                    remaining < 0 ? 'text-red-700' : 'text-green-700'
                  }`}>
                    {formatCurrency(Math.abs(remaining), currency)}
                  </span>
                </div>
                <div className={`text-base ${
                  remaining < 0 ? 'text-red-600' : 'text-green-600'
                } opacity-80`}>
                  {remaining < 0 ? 'Exceeds allocated budget' : 'Left to allocate'}
                </div>
              </div>

              <Separator />

              <div>
                <div className="flex justify-between text-lg mb-3">
                  <span className="text-slate-600 font-medium">Budget Utilization:</span>
                  <span className="font-bold text-xl">{utilization.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-300 ${
                      utilization > 100
                        ? 'bg-red-500'
                        : utilization > 80
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(utilization, 100)}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
