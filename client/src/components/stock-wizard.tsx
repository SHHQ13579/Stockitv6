import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Calculator, 
  ShoppingCart, 
  TrendingUp,
  Play,
  CheckCircle,
  ArrowDown,
  MousePointer,
  Keyboard
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  animation?: "pulse" | "bounce" | "slide" | "highlight";
}

interface StockWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function StockWizard({ isOpen, onClose, onComplete }: StockWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const steps: WizardStep[] = [
    {
      id: "welcome",
      title: "Welcome to Stockit",
      description: "Your comprehensive salon stock management system",
      icon: <Play className="w-6 h-6" />,
      content: (
        <div className="text-center space-y-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center"
          >
            <ShoppingCart className="w-10 h-10 text-blue-600" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Let's Get Started!</h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              Stockit helps salon owners manage their inventory budgets, calculate profits, 
              and track supplier allocations efficiently. This quick tutorial will show you 
              the three main features.
            </p>
          </motion.div>
        </div>
      )
    },
    {
      id: "profit-calculator",
      title: "Profit Calculator",
      description: "Calculate profit margins for individual products",
      icon: <Calculator className="w-6 h-6" />,
      animation: "pulse",
      content: (
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-green-50 rounded-lg p-6 border border-green-200"
          >
            <div className="flex items-center mb-4">
              <Calculator className="w-8 h-8 text-green-600 mr-3" />
              <h3 className="text-xl font-semibold text-green-800">Individual Product Analysis</h3>
            </div>
            <div className="space-y-4">
              <motion.div
                animate={{ backgroundColor: ["#f0fdf4", "#dcfce7", "#f0fdf4"] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="p-4 rounded border-2 border-dashed border-green-300"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">List Price:</span>
                  <span className="text-green-600 font-bold">£45.00</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Your Cost:</span>
                  <span className="text-green-600 font-bold">£22.50</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Profit Margin:</span>
                  <Badge className="bg-green-600">50%</Badge>
                </div>
              </motion.div>
              <div className="flex items-center text-sm text-gray-600">
                <MousePointer className="w-4 h-4 mr-2" />
                <span>Enter product details and see instant profit calculations</span>
              </div>
            </div>
          </motion.div>
        </div>
      )
    },
    {
      id: "retail-budget",
      title: "Retail Budget Manager",
      description: "Manage your retail stock budget and supplier allocations",
      icon: <ShoppingCart className="w-6 h-6" />,
      animation: "slide",
      content: (
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-blue-50 rounded-lg p-6 border border-blue-200"
          >
            <div className="flex items-center mb-4">
              <ShoppingCart className="w-8 h-8 text-blue-600 mr-3" />
              <h3 className="text-xl font-semibold text-blue-800">Budget Distribution</h3>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="bg-white p-4 rounded border"
                >
                  <div className="text-sm text-gray-600">Net Sales</div>
                  <div className="text-2xl font-bold text-blue-600">£15,000</div>
                </motion.div>
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                  className="bg-white p-4 rounded border"
                >
                  <div className="text-sm text-gray-600">Budget (65%)</div>
                  <div className="text-2xl font-bold text-blue-600">£9,750</div>
                </motion.div>
              </div>
              <motion.div
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="space-y-2"
              >
                <div className="flex justify-between items-center p-3 bg-white rounded border">
                  <span>Kerastase</span>
                  <span className="font-semibold">£3,000</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded border">
                  <span>Redken</span>
                  <span className="font-semibold">£2,500</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded border">
                  <span>Olaplex</span>
                  <span className="font-semibold">£4,250</span>
                </div>
              </motion.div>
              <div className="flex items-center text-sm text-gray-600">
                <ArrowDown className="w-4 h-4 mr-2" />
                <span>Allocate your budget across different suppliers</span>
              </div>
            </div>
          </motion.div>
        </div>
      )
    },
    {
      id: "professional-budget",
      title: "Professional Stock Budget",
      description: "Track professional service stock based on revenue",
      icon: <TrendingUp className="w-6 h-6" />,
      animation: "highlight",
      content: (
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="bg-purple-50 rounded-lg p-6 border border-purple-200"
          >
            <div className="flex items-center mb-4">
              <TrendingUp className="w-8 h-8 text-purple-600 mr-3" />
              <h3 className="text-xl font-semibold text-purple-800">Service-Based Budgeting</h3>
            </div>
            <div className="space-y-4">
              <motion.div
                animate={{ 
                  boxShadow: [
                    "0 0 0 0 rgba(147, 51, 234, 0)",
                    "0 0 0 10px rgba(147, 51, 234, 0.1)",
                    "0 0 0 0 rgba(147, 51, 234, 0)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="p-4 bg-white rounded border-2 border-purple-200"
              >
                <div className="text-center mb-4">
                  <div className="text-sm text-gray-600">Service Revenue</div>
                  <div className="text-3xl font-bold text-purple-600">£20,000</div>
                </div>
                <div className="flex items-center justify-center">
                  <div className="text-sm text-gray-600 mr-2">Professional Stock Budget:</div>
                  <Badge className="bg-purple-600">7% = £1,400</Badge>
                </div>
              </motion.div>
              <div className="text-center">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="inline-block"
                >
                  💡
                </motion.div>
                <p className="text-sm text-gray-600 mt-2">
                  Perfect for tracking color, treatments, and professional products
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )
    },
    {
      id: "navigation",
      title: "Pro Tips & Navigation",
      description: "Master the keyboard shortcuts and advanced features",
      icon: <Keyboard className="w-6 h-6" />,
      content: (
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
              <h3 className="text-xl font-semibold text-yellow-800 mb-4 flex items-center">
                <Keyboard className="w-6 h-6 mr-2" />
                Keyboard Shortcuts
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white p-3 rounded border"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Navigate Fields</span>
                    <Badge variant="outline">Enter ↵</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Move to next input field</p>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white p-3 rounded border"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Undo Changes</span>
                    <Badge variant="outline">Undo Button</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Restore previous values</p>
                </motion.div>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-6 border border-green-200">
              <h3 className="text-xl font-semibold text-green-800 mb-4">Advanced Features</h3>
              <div className="space-y-3">
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                  className="flex items-center"
                >
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <span>Multi-currency support for international suppliers</span>
                </motion.div>
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  className="flex items-center"
                >
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <span>VAT calculations for accurate pricing</span>
                </motion.div>
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                  className="flex items-center"
                >
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <span>Export data to Excel for accounting</span>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      )
    },
    {
      id: "complete",
      title: "You're All Set!",
      description: "Start managing your salon stock like a pro",
      icon: <CheckCircle className="w-6 h-6" />,
      content: (
        <div className="text-center space-y-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center"
          >
            <CheckCircle className="w-12 h-12 text-green-600" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-4"
          >
            <h3 className="text-2xl font-bold text-gray-800">Congratulations!</h3>
            <p className="text-gray-600 text-lg leading-relaxed max-w-md mx-auto">
              You're now ready to take control of your salon's stock management. 
              Start with any module that fits your current needs.
            </p>
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="bg-blue-50 rounded-lg p-4 border border-blue-200"
            >
              <p className="text-blue-800 font-medium">
                💡 Tip: Your data is automatically saved as you work!
              </p>
            </motion.div>
          </motion.div>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Stock Wizard</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose}
                className="text-white hover:bg-white hover:bg-opacity-20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <Progress value={progress} className="h-2 bg-white bg-opacity-20" />
            <div className="flex items-center justify-between mt-2 text-sm">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 overflow-y-auto max-h-[60vh]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    {steps[currentStep].icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{steps[currentStep].title}</h3>
                    <p className="text-gray-600">{steps[currentStep].description}</p>
                  </div>
                </div>
                {steps[currentStep].content}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="border-t bg-gray-50 px-8 py-4 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            
            <div className="flex space-x-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index <= currentStep ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <Button
              onClick={nextStep}
              className="flex items-center bg-blue-600 hover:bg-blue-700"
            >
              {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}