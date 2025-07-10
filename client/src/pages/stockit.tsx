import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, ShoppingCart, Briefcase, TrendingUp, Sparkles } from "lucide-react";
import ProfitCalculator from "@/components/profit-calculator";
import RetailBudget from "@/components/retail-budget";
import ProfessionalBudget from "@/components/professional-budget";
import CurrencySelector from "@/components/currency-selector";
import StockWizard from "@/components/stock-wizard";
import { exportToExcel } from "@/lib/excel-export";

export default function Stockit() {
  const [activeTab, setActiveTab] = useState("profit-calculator");
  const [currency, setCurrency] = useState("GBP");
  const [showWizard, setShowWizard] = useState(false);

  // Check if user is new (show wizard on first visit)
  useEffect(() => {
    const hasSeenWizard = localStorage.getItem('stockit-wizard-completed');
    const dontShowAgain = localStorage.getItem('stockit-wizard-dont-show');
    if (!hasSeenWizard && !dontShowAgain) {
      setShowWizard(true);
    }
  }, []);

  const handleWizardComplete = () => {
    localStorage.setItem('stockit-wizard-completed', 'true');
    setShowWizard(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = async () => {
    try {
      await exportToExcel(activeTab);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-brand-blue rounded-lg flex items-center justify-center">
                <TrendingUp className="text-white" size={20} />
              </div>
              <h1 className="text-3xl font-bold text-slate-900">Stockit</h1>
              <span className="text-lg text-slate-500 hidden sm:inline">
                Salon Stock Management
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <CurrencySelector currency={currency} onCurrencyChange={setCurrency} />
              
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleExport}
                  className="text-slate-700 hover:text-brand-blue text-base px-4 py-2"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" />
                  </svg>
                  Export
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrint}
                  className="text-slate-700 hover:text-brand-blue text-base px-4 py-2"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
                  </svg>
                  Print
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowWizard(true)}
                  className="text-slate-700 hover:text-brand-blue text-base px-4 py-2"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Tutorial
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 no-print h-14">
            <TabsTrigger value="profit-calculator" className="flex items-center space-x-2 text-lg py-3">
              <Calculator size={20} />
              <span>Profit Calculator</span>
            </TabsTrigger>
            <TabsTrigger value="retail-budget" className="flex items-center space-x-2 text-lg py-3">
              <ShoppingCart size={20} />
              <span>Retail Stock Budget</span>
            </TabsTrigger>
            <TabsTrigger value="professional-budget" className="flex items-center space-x-2 text-lg py-3">
              <Briefcase size={20} />
              <span>Professional Stock Budget</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profit-calculator">
            <ProfitCalculator currency={currency} />
          </TabsContent>

          <TabsContent value="retail-budget">
            <RetailBudget currency={currency} />
          </TabsContent>

          <TabsContent value="professional-budget">
            <ProfessionalBudget currency={currency} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Stock Wizard */}
      <StockWizard
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        onComplete={handleWizardComplete}
      />
    </div>
  );
}
