import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, ShoppingCart, Briefcase } from "lucide-react";
import hannaLogoPath from "@assets/HANNA Logo_1750364236944.png";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-8">
          <div className="flex items-center justify-center mb-6">
            <img 
              src={hannaLogoPath} 
              alt="Hanna Logo" 
              className="h-24 w-auto"
            />
          </div>
          <h1 className="text-6xl font-bold text-slate-900 mb-4">Stockit</h1>
          <p className="text-2xl text-slate-600 mb-8">
            Professional Salon Stock Management System
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <Calculator className="w-8 h-8 text-brand-blue mx-auto mb-2" />
              <CardTitle className="text-xl">Profit Calculator</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Calculate profit margins for individual products with VAT calculations and cost breakdowns
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <ShoppingCart className="w-8 h-8 text-brand-blue mx-auto mb-2" />
              <CardTitle className="text-xl">Retail Budget</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Manage retail stock purchasing budgets based on sales performance
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Briefcase className="w-8 h-8 text-brand-blue mx-auto mb-2" />
              <CardTitle className="text-xl">Professional Budget</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Track professional service stock budgets and supplier allocations
              </p>
            </CardContent>
          </Card>
        </div>

        <Button 
          size="lg" 
          className="bg-brand-blue hover:bg-blue-700 text-xl px-8 py-4"
          onClick={() => window.location.href = "/auth"}
        >
          Login to Get Started
        </Button>
      </div>
    </div>
  );
}