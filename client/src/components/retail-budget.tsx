import { useState, useEffect } from "react";
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
import type { RetailBudget, RetailSupplier } from "@shared/schema";

interface RetailBudgetProps {
  currency: string;
}

interface Supplier {
  id?: number;
  name: string;
  allocation: string;
}

export default function RetailBudget({ currency }: RetailBudgetProps) {
  const [netSales, setNetSales] = useState("");
  const [budgetPercent, setBudgetPercent] = useState("65.0");
  const [suppliers, setSuppliers] = useState<Supplier[]>([
    { name: "", allocation: "" }
  ]);
  const [undoStack, setUndoStack] = useState<{ netSales: string; suppliers: Supplier[]; budgetPercent: string }[]>([]);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: budgetData } = useQuery<{ budget: RetailBudget; suppliers: RetailSupplier[] } | null>({
    queryKey: ["/api/retail-budget"],
  });

  const saveBudgetMutation = useMutation({
    mutationFn: async (data: { budget: any; suppliers: any[] }) => {
      const response = await apiRequest("POST", "/api/retail-budget", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/retail-budget"] });
      toast({ title: "Success", description: "Budget saved successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save budget", variant: "destructive" });
    },
  });

  useEffect(() => {
    if (budgetData) {
      setNetSales(budgetData.budget.netSales);
      setBudgetPercent(budgetData.budget.budgetPercent);
      setSuppliers(budgetData.suppliers.map(s => ({
        id: s.id,
        name: s.name,
        allocation: s.allocation
      })));
    }
  }, [budgetData]);

  const totalBudget = parseFloat(netSales || "0") * (parseFloat(budgetPercent || "0") / 100);
  const totalAllocated = suppliers.reduce((sum, supplier) => sum + parseFloat(supplier.allocation || "0"), 0);
  const remaining = totalBudget - totalAllocated;
  const utilization = totalBudget > 0 ? (totalAllocated / totalBudget) * 100 : 0;

  const saveToUndoStack = () => {
    setUndoStack(prev => [...prev.slice(-9), { netSales, suppliers, budgetPercent }]); // Keep last 10 states
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

  const updateSupplier = (index: number, field: keyof Supplier, value: string) => {
    // Only save to undo stack when completing a supplier (both name and allocation filled)
    const updated = [...suppliers];
    updated[index] = { ...updated[index], [field]: value };
    
    // Save state when supplier becomes complete
    if (field === 'allocation' && value.trim() !== '' && updated[index].name.trim() !== '') {
      saveToUndoStack();
    } else if (field === 'name' && value.trim() !== '' && updated[index].allocation.trim() !== '') {
      saveToUndoStack();
    }
    
    setSuppliers(updated);
  };

  const handleSave = () => {
    const budgetData = {
      netSales: netSales || "0",
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
    setNetSales("");
    setSuppliers([{ name: "", allocation: "" }]);
  };

  const handleUndo = () => {
    if (undoStack.length > 0) {
      const previousState = undoStack[undoStack.length - 1];
      setUndoStack(prev => prev.slice(0, -1));
      setNetSales(previousState.netSales);
      setSuppliers(previousState.suppliers);
      setBudgetPercent(previousState.budgetPercent);
    }
  };

  const handleNetSalesChange = (value: string) => {
    // Only save to undo stack when net sales has a meaningful value
    if (value.trim() !== '' && parseFloat(value) > 0) {
      saveToUndoStack();
    }
    setNetSales(value);
  };

  const handleBudgetPercentChange = (value: string) => {
    // Save to undo stack when budget percent changes meaningfully
    if (value !== budgetPercent && value.trim() !== '') {
      saveToUndoStack();
    }
    setBudgetPercent(value);
  };

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-slate-900 mb-2">Retail Stock Budget</h2>
        <p className="text-xl text-slate-600">
          Manage your retail stock purchasing budget based on sales performance
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Budget Setup */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="print-friendly">
            <CardHeader>
              <CardTitle className="text-2xl">Budget Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Label htmlFor="netSales" className="text-lg font-medium">Net Sales</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info size={18} className="text-slate-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-base">Total amount of retail items sold</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="netSales"
                    type="number"
                    step="0.01"
                    value={netSales}
                    onChange={(e) => handleNetSalesChange(e.target.value)}
                    placeholder="0.00"
                    className="text-xl h-12"
                  />
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Label htmlFor="budgetPercent" className="text-lg font-medium">Stock Budget (%)</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info size={18} className="text-slate-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-base">Percentage of net sales allocated to replacing stock</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="budgetPercent"
                    type="number"
                    step="0.1"
                    max="100"
                    value={budgetPercent}
                    onChange={(e) => handleBudgetPercentChange(e.target.value)}
                    placeholder="65.0"
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
              {suppliers.map((supplier, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div>
                    <Label htmlFor={`supplier-name-${index}`} className="text-lg font-medium">Supplier Name</Label>
                    <Input
                      id={`supplier-name-${index}`}
                      value={supplier.name}
                      onChange={(e) => updateSupplier(index, "name", e.target.value)}
                      placeholder="Enter supplier name"
                      className="text-xl h-12"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`supplier-allocation-${index}`} className="text-lg font-medium">Allocation Amount</Label>
                    <Input
                      id={`supplier-allocation-${index}`}
                      type="number"
                      step="0.01"
                      value={supplier.allocation}
                      onChange={(e) => updateSupplier(index, "allocation", e.target.value)}
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
              ))}
            </CardContent>
          </Card>

          <div className="no-print flex space-x-4">
            <Button
              onClick={handleUndo}
              variant="outline"
              disabled={undoStack.length === 0}
              className="text-lg px-6 py-3 border-slate-300 hover:bg-slate-50"
            >
              Undo
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
