import { useState, useEffect } from "react";
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
  };
}

export default function ProfitCalculator({ currency }: ProfitCalculatorProps) {
  const [formData, setFormData] = useState({
    productName: "",
    rrp: "",
    vatRegistered: false,
    listPrice: "",
    discount: "",
    retroDiscount: "",
    usage: "",
    commission: "",
  });
  const [scenarioName, setScenarioName] = useState("");
  const [calculation, setCalculation] = useState<ProfitCalculation | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: scenarios = [] } = useQuery<ProfitScenario[]>({
    queryKey: ["/api/profit-scenarios"],
  });

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
    onError: () => {
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
    onError: () => {
      toast({ title: "Error", description: "Failed to delete scenario", variant: "destructive" });
    },
  });

  useEffect(() => {
    calculateProfit();
  }, [formData]);

  const calculateProfit = () => {
    const rrp = parseFloat(formData.rrp) || 0;
    const listPrice = parseFloat(formData.listPrice) || 0;
    const discount = parseFloat(formData.discount) || 0;
    const retroDiscount = parseFloat(formData.retroDiscount) || 0;
    const usage = parseFloat(formData.usage) || 0;
    const commission = parseFloat(formData.commission) || 0;

    if (listPrice === 0 && rrp === 0) {
      setCalculation(null);
      return;
    }

    const afterDiscount = listPrice * (1 - discount / 100);
    const afterRetro = afterDiscount * (1 - retroDiscount / 100);
    const usageAdjustment = afterRetro * (usage / 100);
    const realCost = afterRetro + usageAdjustment;

    const netProfit = rrp - realCost - commission;
    const profitMargin = rrp > 0 ? (netProfit / rrp) * 100 : 0;

    setCalculation({
      realCost,
      salePrice: rrp,
      netProfit,
      profitMargin,
      breakdown: {
        listPrice,
        afterDiscount,
        afterRetro,
        usageAdjustment,
      },
    });
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
    setFormData({
      productName: scenario.productName,
      rrp: scenario.rrp,
      vatRegistered: scenario.vatRegistered,
      listPrice: scenario.listPrice,
      discount: scenario.discount,
      retroDiscount: scenario.retroDiscount,
      usage: scenario.usage,
      commission: scenario.commission,
    });
  };

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Profit Calculator</h2>
        <p className="text-lg text-slate-600">
          Calculate profit margins for individual products and compare scenarios
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Form */}
        <div className="lg:col-span-2">
          <Card className="print-friendly">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Product Details</CardTitle>
                <div className="flex space-x-2 no-print">
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
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Label htmlFor="productName">Product Name</Label>
                  <Input
                    id="productName"
                    value={formData.productName}
                    onChange={(e) => handleInputChange("productName", e.target.value)}
                    placeholder="Enter product name"
                    className="text-lg"
                  />
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Label htmlFor="rrp">RRP (Retail Price)</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info size={16} className="text-slate-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>The retail price you will sell this product for</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="rrp"
                    type="number"
                    step="0.01"
                    value={formData.rrp}
                    onChange={(e) => handleInputChange("rrp", e.target.value)}
                    placeholder="0.00"
                    className="text-lg"
                  />
                </div>

                <div className="flex items-center space-x-3 pt-8">
                  <Checkbox
                    id="vatRegistered"
                    checked={formData.vatRegistered}
                    onCheckedChange={(checked) => handleInputChange("vatRegistered", !!checked)}
                  />
                  <Label htmlFor="vatRegistered">VAT Registered Business</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info size={16} className="text-slate-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Check if your business is VAT registered</p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Label htmlFor="listPrice">List Price</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info size={16} className="text-slate-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>The standard wholesale price you normally pay</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="listPrice"
                    type="number"
                    step="0.01"
                    value={formData.listPrice}
                    onChange={(e) => handleInputChange("listPrice", e.target.value)}
                    placeholder="0.00"
                    className="text-lg"
                  />
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Label htmlFor="discount">Discount (%)</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info size={16} className="text-slate-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Any negotiated discount off the list price</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="discount"
                    type="number"
                    step="0.1"
                    max="100"
                    value={formData.discount}
                    onChange={(e) => handleInputChange("discount", e.target.value)}
                    placeholder="0.0"
                    className="text-lg"
                  />
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Label htmlFor="retroDiscount">Retro Discount (%)</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info size={16} className="text-slate-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Any retrospective discount or rebate</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="retroDiscount"
                    type="number"
                    step="0.1"
                    max="100"
                    value={formData.retroDiscount}
                    onChange={(e) => handleInputChange("retroDiscount", e.target.value)}
                    placeholder="0.0"
                    className="text-lg"
                  />
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Label htmlFor="usage">Usage/Loss (%)</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info size={16} className="text-slate-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Allowance for product usage, wastage, or losses</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="usage"
                    type="number"
                    step="0.1"
                    max="100"
                    value={formData.usage}
                    onChange={(e) => handleInputChange("usage", e.target.value)}
                    placeholder="0.0"
                    className="text-lg"
                  />
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Label htmlFor="commission">Commission</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info size={16} className="text-slate-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Commission paid to team member for selling this product</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="commission"
                    type="number"
                    step="0.01"
                    value={formData.commission}
                    onChange={(e) => handleInputChange("commission", e.target.value)}
                    placeholder="0.00"
                    className="text-lg"
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
              <CardTitle>Profit Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {calculation ? (
                <>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-slate-600">Real Cost</span>
                      <span className="text-lg font-semibold text-slate-900">
                        {formatCurrency(calculation.realCost, currency)}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">After all discounts and adjustments</div>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-slate-600">Sale Price</span>
                      <span className="text-lg font-semibold text-slate-900">
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
                          {formatCurrency(calculation.breakdown.usageAdjustment, currency)}
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
