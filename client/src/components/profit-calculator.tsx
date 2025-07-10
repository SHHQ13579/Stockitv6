import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Info, Save, Copy, Trash2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/currency";
import type { ProfitScenario, InsertProfitScenario } from "@shared/schema";

interface ProfitCalculatorProps {
  currency: string;
}

interface ProfitCalculation {
  realCost: number;
  salePrice: number;
  netProfit: number;
  profitMargin: number;
  breakdown: {
    listPrice: number;
    afterDiscount: number;
    afterRetro: number;
    usageAdjustment: number;
    commissionAmount: number;
  };
}

export default function ProfitCalculator({ currency }: ProfitCalculatorProps) {
  const [formData, setFormData] = useState({
    productName: "",
    rrp: "",
    vatRegistered: false,
    vatPercent: "20.0",
    listPrice: "",
    discount: "",
    retroDiscount: "",
    usage: "",
    commission: "",
  });
  const [scenarioName, setScenarioName] = useState("");
  const [calculation, setCalculation] = useState<ProfitCalculation | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [undoStack, setUndoStack] = useState<typeof formData[]>([]);
  
  // Refs for keyboard navigation
  const productNameRef = useRef<HTMLInputElement>(null);
  const rrpRef = useRef<HTMLInputElement>(null);
  const vatPercentRef = useRef<HTMLInputElement>(null);
  const listPriceRef = useRef<HTMLInputElement>(null);
  const discountRef = useRef<HTMLInputElement>(null);
  const retroDiscountRef = useRef<HTMLInputElement>(null);
  const usageRef = useRef<HTMLInputElement>(null);
  const commissionRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: scenarios = [] } = useQuery<ProfitScenario[]>({
    queryKey: ["/api/profit-scenarios"],
    retry: false,
  });

  // No VAT update mutation needed - VAT is local only

  const saveScenarioMutation = useMutation({
    mutationFn: async (scenario: InsertProfitScenario) => {
      const response = await apiRequest("POST", "/api/profit-scenarios", scenario);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profit-scenarios"] });
      toast({ title: "Success", description: "Scenario saved successfully" });
      setSaveDialogOpen(false);
      setScenarioName("");
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to save scenario", variant: "destructive" });
    },
  });

  const deleteScenarioMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/profit-scenarios/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profit-scenarios"] });
      toast({ title: "Success", description: "Scenario deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to delete scenario", variant: "destructive" });
    },
  });

  useEffect(() => {
    calculateProfit();
  }, [formData]);

  const calculateProfit = () => {
    let salePrice = parseFloat(formData.rrp) || 0;
    const listPrice = parseFloat(formData.listPrice) || 0;
    const discount = parseFloat(formData.discount) || 0;
    const retroDiscount = parseFloat(formData.retroDiscount) || 0;
    const usage = parseFloat(formData.usage) || 0;
    const commission = parseFloat(formData.commission) || 0;
    const vatPercent = parseFloat(formData.vatPercent) || 0;

    if (listPrice === 0 && salePrice === 0) {
      setCalculation(null);
      return;
    }

    // If VAT registered, calculate net price from RRP
    if (formData.vatRegistered && salePrice > 0) {
      salePrice = salePrice / (1 + vatPercent / 100);
    }

    // Step 1: Apply discount to list price
    const afterDiscount = listPrice * (1 - discount / 100);
    
    // Step 2: Apply retro discount
    const afterRetro = afterDiscount * (1 - retroDiscount / 100);
    
    // Step 3: Add usage percentage as additional cost
    const usageAdjustment = afterRetro * (usage / 100);
    const costAfterUsage = afterRetro + usageAdjustment;
    
    // Step 4: Calculate commission as percentage of NET sale price
    const commissionAmount = salePrice * (commission / 100);
    
    // Step 5: Total real cost includes commission
    const realCost = costAfterUsage + commissionAmount;

    // Step 6: Calculate profit and margin
    const netProfit = salePrice - realCost;
    const profitMargin = realCost > 0 ? (netProfit / realCost) * 100 : 0;

    setCalculation({
      realCost,
      salePrice,
      netProfit,
      profitMargin,
      breakdown: {
        listPrice,
        afterDiscount,
        afterRetro,
        usageAdjustment,
        commissionAmount,
      },
    });
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    // Only save to undo stack if the value is actually different
    const currentValue = formData[field as keyof typeof formData];
    if (value !== currentValue) {
      setUndoStack(prev => [...prev.slice(-9), formData]); // Keep last 10 states
    }
    
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Update default VAT percentage when changed
    if (field === "vatPercent" && typeof value === "string" && value !== user?.defaultVatPercent) {
      updateVatMutation.mutate(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, nextRef?: React.RefObject<HTMLInputElement>) => {
    if (e.key === 'Enter' && nextRef?.current) {
      e.preventDefault();
      nextRef.current.focus();
    }
  };

  const handleSaveScenario = () => {
    if (!scenarioName.trim()) {
      toast({ title: "Error", description: "Please enter a scenario name", variant: "destructive" });
      return;
    }

    if (!formData.productName.trim()) {
      toast({ title: "Error", description: "Please enter a product name", variant: "destructive" });
      return;
    }

    const scenario: InsertProfitScenario = {
      name: scenarioName,
      productName: formData.productName,
      rrp: formData.rrp,
      vatRegistered: formData.vatRegistered,
      vatPercent: formData.vatPercent || "20.0",
      listPrice: formData.listPrice,
      discount: formData.discount || "0",
      retroDiscount: formData.retroDiscount || "0",
      usage: formData.usage || "0",
      commission: formData.commission || "0",
      currency,
    };

    saveScenarioMutation.mutate(scenario);
  };

  const loadScenario = (scenario: ProfitScenario) => {
    // Save current state to undo stack before loading scenario
    setUndoStack(prev => [...prev.slice(-9), formData]);
    setFormData({
      productName: scenario.productName,
      rrp: scenario.rrp,
      vatRegistered: scenario.vatRegistered,
      vatPercent: scenario.vatPercent || "20.0",
      listPrice: scenario.listPrice,
      discount: scenario.discount || "0",
      retroDiscount: scenario.retroDiscount || "0",
      usage: scenario.usage || "0",
      commission: scenario.commission || "0",
    });
  };

  const handleUndo = () => {
    if (undoStack.length > 0) {
      const previousState = undoStack[undoStack.length - 1];
      setUndoStack(prev => prev.slice(0, -1));
      setFormData(previousState);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-8">
      <div className="mb-4 sm:mb-8">
        <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 mb-2">Profit Calculator</h2>
        <p className="text-base sm:text-xl text-slate-600">
          Calculate profit margins for individual products with VAT calculations and scenario comparisons
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
        {/* Input Form */}
        <div className="lg:col-span-2">
          <Card className="print-friendly">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <CardTitle className="text-xl sm:text-2xl">Product Details</CardTitle>
                <div className="flex flex-wrap gap-2 no-print">
                  <Button
                    variant="outline"
                    onClick={handleUndo}
                    disabled={undoStack.length === 0}
                    className="border-slate-300 hover:bg-slate-50"
                  >
                    Undo
                  </Button>
                  <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-brand-blue hover:bg-blue-700">
                        <Save className="mr-2" size={16} />
                        Save Scenario
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Save Scenario</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="scenarioName">Scenario Name</Label>
                          <Input
                            id="scenarioName"
                            value={scenarioName}
                            onChange={(e) => setScenarioName(e.target.value)}
                            placeholder="Enter scenario name"
                          />
                        </div>
                        <Button onClick={handleSaveScenario} disabled={saveScenarioMutation.isPending}>
                          {saveScenarioMutation.isPending ? "Saving..." : "Save"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="md:col-span-2">
                  <Label htmlFor="productName" className="text-lg font-medium">Product Name</Label>
                  <Input
                    ref={productNameRef}
                    id="productName"
                    value={formData.productName}
                    onChange={(e) => handleInputChange("productName", e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, rrpRef)}
                    placeholder="Enter product name"
                    className="text-xl h-12"
                  />
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Label htmlFor="rrp" className="text-lg font-medium">RRP (Retail Price)</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info size={18} className="text-slate-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-base">The retail price you will sell this product for (including VAT if applicable)</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    ref={rrpRef}
                    id="rrp"
                    type="number"
                    step="0.01"
                    value={formData.rrp}
                    onChange={(e) => handleInputChange("rrp", e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, formData.vatRegistered ? vatPercentRef : listPriceRef)}
                    placeholder="0.00"
                    className="text-xl h-12"
                  />
                </div>

                <div className="flex flex-col space-y-4">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="vatRegistered"
                      checked={formData.vatRegistered}
                      onCheckedChange={(checked) => handleInputChange("vatRegistered", !!checked)}
                    />
                    <Label htmlFor="vatRegistered" className="text-lg font-medium">VAT Registered Business</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info size={18} className="text-slate-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-base">Check if your business is VAT registered</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  
                  {formData.vatRegistered && (
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Label htmlFor="vatPercent" className="text-lg font-medium">VAT Percentage (%)</Label>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info size={18} className="text-slate-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-base">VAT rate - will be saved as your default for future calculations</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Input
                        ref={vatPercentRef}
                        id="vatPercent"
                        type="number"
                        step="0.1"
                        max="100"
                        value={formData.vatPercent}
                        onChange={(e) => handleInputChange("vatPercent", e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, listPriceRef)}
                        placeholder="20.0"
                        className="text-xl h-12"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Label htmlFor="listPrice" className="text-lg font-medium">List Price</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info size={18} className="text-slate-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-base">The standard wholesale price you normally pay</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    ref={listPriceRef}
                    id="listPrice"
                    type="number"
                    step="0.01"
                    value={formData.listPrice}
                    onChange={(e) => handleInputChange("listPrice", e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, discountRef)}
                    placeholder="0.00"
                    className="text-xl h-12"
                  />
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Label htmlFor="discount" className="text-lg font-medium">Discount (%)</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info size={18} className="text-slate-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-base">Any negotiated discount off the list price</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    ref={discountRef}
                    id="discount"
                    type="number"
                    step="0.1"
                    max="100"
                    value={formData.discount}
                    onChange={(e) => handleInputChange("discount", e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, retroDiscountRef)}
                    placeholder="0.0"
                    className="text-xl h-12"
                  />
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Label htmlFor="retroDiscount" className="text-lg font-medium">Retro Discount (%)</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info size={18} className="text-slate-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-base">Any retrospective discount or rebate</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    ref={retroDiscountRef}
                    id="retroDiscount"
                    type="number"
                    step="0.1"
                    max="100"
                    value={formData.retroDiscount}
                    onChange={(e) => handleInputChange("retroDiscount", e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, usageRef)}
                    placeholder="0.0"
                    className="text-xl h-12"
                  />
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Label htmlFor="usage" className="text-lg font-medium">Usage/Loss (%)</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info size={18} className="text-slate-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-base">Allowance for product usage, wastage, or losses</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    ref={usageRef}
                    id="usage"
                    type="number"
                    step="0.1"
                    max="100"
                    value={formData.usage}
                    onChange={(e) => handleInputChange("usage", e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, commissionRef)}
                    placeholder="0.0"
                    className="text-xl h-12"
                  />
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Label htmlFor="commission" className="text-lg font-medium">Commission (%)</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info size={18} className="text-slate-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-base">Commission percentage of net sale price paid to team member</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    ref={commissionRef}
                    id="commission"
                    type="number"
                    step="0.1"
                    max="100"
                    value={formData.commission}
                    onChange={(e) => handleInputChange("commission", e.target.value)}
                    placeholder="10.0"
                    className="text-xl h-12"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calculation Results */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="print-friendly">
            <CardHeader>
              <CardTitle className="text-2xl">Profit Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {calculation ? (
                <>
                  {formData.vatRegistered && (
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-lg font-medium text-blue-700">RRP (Inc VAT)</span>
                        <span className="text-xl font-semibold text-blue-700">
                          {formatCurrency(parseFloat(formData.rrp) || 0, currency)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-base font-medium text-blue-600">Net Price (Ex VAT)</span>
                        <span className="text-lg font-semibold text-blue-600">
                          {formatCurrency(calculation.salePrice, currency)}
                        </span>
                      </div>
                      <div className="text-sm text-blue-600 mt-1">VAT: {formData.vatPercent}%</div>
                    </div>
                  )}

                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-lg font-medium text-slate-600">Real Cost</span>
                      <span className="text-xl font-semibold text-slate-900">
                        {formatCurrency(calculation.realCost, currency)}
                      </span>
                    </div>
                    <div className="text-base text-slate-500">After all discounts and adjustments</div>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-lg font-medium text-slate-600">
                        {formData.vatRegistered ? "Net Sale Price" : "Sale Price"}
                      </span>
                      <span className="text-xl font-semibold text-slate-900">
                        {formatCurrency(calculation.salePrice, currency)}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">Retail price (RRP)</div>
                  </div>

                  <div className={`rounded-lg p-4 border ${
                    calculation.netProfit >= 0 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-sm font-medium ${
                        calculation.netProfit >= 0 ? 'text-green-700' : 'text-red-700'
                      }`}>
                        Net Profit
                      </span>
                      <span className={`text-2xl font-bold ${
                        calculation.netProfit >= 0 ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {formatCurrency(calculation.netProfit, currency)}
                      </span>
                    </div>
                    <div className={`text-xs ${
                      calculation.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                    } opacity-80`}>
                      After commission and costs
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-blue-700">Profit Margin</span>
                      <span className="text-xl font-bold text-blue-700">
                        {calculation.profitMargin.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="text-sm font-medium text-slate-700 mb-3">Cost Breakdown</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">List Price:</span>
                        <span className="font-medium">
                          {formatCurrency(calculation.breakdown.listPrice, currency)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">After Discount:</span>
                        <span className="font-medium">
                          {formatCurrency(calculation.breakdown.afterDiscount, currency)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">After Retro:</span>
                        <span className="font-medium">
                          {formatCurrency(calculation.breakdown.afterRetro, currency)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Usage Adjustment:</span>
                        <span className="font-medium">
                          +{formatCurrency(calculation.breakdown.usageAdjustment, currency)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Commission Amount:</span>
                        <span className="font-medium">
                          +{formatCurrency(calculation.breakdown.commissionAmount, currency)}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-slate-200">
                        <span className="text-slate-700 font-medium">Total Cost:</span>
                        <span className="font-bold">
                          {formatCurrency(calculation.realCost, currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center text-slate-500 py-8">
                  Enter product details to see profit calculation
                </div>
              )}
            </CardContent>
          </Card>

          {/* Saved Scenarios */}
          <Card className="no-print">
            <CardHeader>
              <CardTitle>Saved Scenarios</CardTitle>
            </CardHeader>
            <CardContent>
              {scenarios.length === 0 ? (
                <div className="text-sm text-slate-500 italic">No scenarios saved yet</div>
              ) : (
                <div className="space-y-2">
                  {scenarios.map((scenario) => (
                    <div
                      key={scenario.id}
                      className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{scenario.name}</div>
                        <div className="text-sm text-slate-500">{scenario.productName}</div>
                        <Badge variant="secondary" className="text-xs">
                          {scenario.currency}
                        </Badge>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => loadScenario(scenario)}
                        >
                          <Copy size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteScenarioMutation.mutate(scenario.id)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
