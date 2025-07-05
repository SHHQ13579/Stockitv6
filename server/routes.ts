import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import { 
  registerUser, 
  loginUser, 
  requestPasswordReset, 
  resetPassword, 
  changePassword,
  requireAuth,
  getCurrentUser 
} from "./auth";
import { 
  insertProfitScenarioSchema,
  insertRetailBudgetSchema,
  insertRetailSupplierSchema,
  insertProfessionalBudgetSchema,
  insertProfessionalSupplierSchema,
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from "@shared/schema";
import { z } from "zod";
import * as XLSX from 'xlsx';

export async function registerRoutes(app: Express): Promise<Server> {
  // Session setup
  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-session-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }));

  // Add current user to all requests
  app.use(getCurrentUser);

  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      const result = await registerUser(validatedData);
      res.json(result);
    } catch (error: any) {
      console.error('Registration error:', error);
      res.status(400).json({ message: error.message || 'Registration failed' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      const result = await loginUser(validatedData);
      
      // Set session
      (req.session as any).userId = result.user.id;
      
      res.json(result);
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(400).json({ message: error.message || 'Login failed' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
        res.status(500).json({ message: 'Logout failed' });
      } else {
        res.json({ message: 'Logged out successfully' });
      }
    });
  });

  app.post('/api/auth/forgot-password', async (req, res) => {
    try {
      const validatedData = forgotPasswordSchema.parse(req.body);
      const result = await requestPasswordReset(validatedData);
      res.json(result);
    } catch (error: any) {
      console.error('Password reset request error:', error);
      res.status(400).json({ message: error.message || 'Password reset request failed' });
    }
  });

  app.post('/api/auth/reset-password', async (req, res) => {
    try {
      const validatedData = resetPasswordSchema.parse(req.body);
      const result = await resetPassword(validatedData);
      res.json(result);
    } catch (error: any) {
      console.error('Password reset error:', error);
      res.status(400).json({ message: error.message || 'Password reset failed' });
    }
  });

  app.post('/api/auth/change-password', requireAuth, async (req, res) => {
    try {
      const validatedData = changePasswordSchema.parse(req.body);
      const session = req.session as any;
      const result = await changePassword(session.userId, validatedData);
      res.json(result);
    } catch (error: any) {
      console.error('Password change error:', error);
      res.status(400).json({ message: error.message || 'Password change failed' });
    }
  });

  app.get('/api/auth/user', requireAuth, async (req, res) => {
    try {
      const session = req.session as any;
      const user = await storage.getUser(session.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Remove password hash from response
      const { passwordHash, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.patch('/api/auth/user/vat', requireAuth, async (req: any, res) => {
    try {
      const session = req.session as any;
      const { vatPercent } = req.body;
      await storage.updateUserVatPercent(session.userId, vatPercent);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating VAT percent:", error);
      res.status(500).json({ message: "Failed to update VAT percent" });
    }
  });

  app.patch('/api/auth/user/professional-budget-percent', requireAuth, async (req: any, res) => {
    try {
      const session = req.session as any;
      const { budgetPercent } = req.body;
      await storage.updateUserProfessionalBudgetPercent(session.userId, budgetPercent);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating professional budget percent:", error);
      res.status(500).json({ message: "Failed to update professional budget percent" });
    }
  });

  // Profit scenarios
  app.get("/api/profit-scenarios", requireAuth, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const scenarios = await storage.getProfitScenarios(userId);
      res.json(scenarios);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch profit scenarios" });
    }
  });

  app.post("/api/profit-scenarios", requireAuth, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const scenario = insertProfitScenarioSchema.parse(req.body);
      const newScenario = await storage.createProfitScenario(userId, scenario);
      res.json(newScenario);
    } catch (error) {
      res.status(400).json({ error: "Invalid scenario data" });
    }
  });

  app.delete("/api/profit-scenarios/:id", requireAuth, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const id = parseInt(req.params.id);
      await storage.deleteProfitScenario(id, userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete scenario" });
    }
  });

  // Retail budget
  app.get("/api/retail-budget", requireAuth, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const budget = await storage.getLatestRetailBudget(userId);
      res.json(budget);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch retail budget" });
    }
  });

  app.post("/api/retail-budget", requireAuth, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const { budget, suppliers } = req.body;
      const budgetData = insertRetailBudgetSchema.parse(budget);
      const supplierData = z.array(insertRetailSupplierSchema.omit({ budgetId: true })).parse(suppliers);
      
      const result = await storage.saveRetailBudget(userId, budgetData, supplierData);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: "Invalid budget data" });
    }
  });

  // Professional budget
  app.get("/api/professional-budget", requireAuth, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const budget = await storage.getLatestProfessionalBudget(userId);
      res.json(budget);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch professional budget" });
    }
  });

  app.post("/api/professional-budget", requireAuth, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const { budget, suppliers } = req.body;
      const budgetData = insertProfessionalBudgetSchema.parse(budget);
      const supplierData = z.array(insertProfessionalSupplierSchema.omit({ budgetId: true })).parse(suppliers);
      
      const result = await storage.saveProfessionalBudget(userId, budgetData, supplierData);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: "Invalid budget data" });
    }
  });

  // Excel export endpoints
  app.post("/api/export/profit-scenarios", requireAuth, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const scenarios = await storage.getProfitScenarios(userId);
      const workbook = XLSX.utils.book_new();
      
      const worksheetData = scenarios.map(scenario => ({
        'Scenario Name': scenario.name,
        'Product Name': scenario.productName,
        'RRP': parseFloat(scenario.rrp),
        'VAT Registered': scenario.vatRegistered ? 'Yes' : 'No',
        'VAT %': scenario.vatPercent ? parseFloat(scenario.vatPercent) : 0,
        'List Price': parseFloat(scenario.listPrice),
        'Discount %': parseFloat(scenario.discount),
        'Retro Discount %': parseFloat(scenario.retroDiscount),
        'Usage %': parseFloat(scenario.usage),
        'Commission': parseFloat(scenario.commission),
        'Currency': scenario.currency,
        'Created': new Date(scenario.createdAt!).toLocaleDateString(),
      }));
      
      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Profit Scenarios');
      
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=profit-scenarios.xlsx');
      res.send(buffer);
    } catch (error) {
      res.status(500).json({ error: "Failed to export scenarios" });
    }
  });

  app.post("/api/export/retail-budget", requireAuth, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const budget = await storage.getLatestRetailBudget(userId);
      if (!budget) {
        return res.status(404).json({ error: "No retail budget found" });
      }
      
      const workbook = XLSX.utils.book_new();
      
      // Budget summary
      const summaryData = [{
        'Net Sales': parseFloat(budget.budget.netSales),
        'Budget Percentage': parseFloat(budget.budget.budgetPercent),
        'Total Budget': parseFloat(budget.budget.netSales) * parseFloat(budget.budget.budgetPercent) / 100,
        'Currency': budget.budget.currency,
      }];
      
      const summarySheet = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Budget Summary');
      
      // Suppliers
      const supplierData = budget.suppliers.map(supplier => ({
        'Supplier Name': supplier.name,
        'Allocation': parseFloat(supplier.allocation),
      }));
      
      const supplierSheet = XLSX.utils.json_to_sheet(supplierData);
      XLSX.utils.book_append_sheet(workbook, supplierSheet, 'Suppliers');
      
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=retail-budget.xlsx');
      res.send(buffer);
    } catch (error) {
      res.status(500).json({ error: "Failed to export retail budget" });
    }
  });

  app.post("/api/export/professional-budget", requireAuth, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const budget = await storage.getLatestProfessionalBudget(userId);
      if (!budget) {
        return res.status(404).json({ error: "No professional budget found" });
      }
      
      const workbook = XLSX.utils.book_new();
      
      // Budget summary
      const summaryData = [{
        'Net Services': parseFloat(budget.budget.netServices),
        'Budget Percentage': parseFloat(budget.budget.budgetPercent),
        'Total Budget': parseFloat(budget.budget.netServices) * parseFloat(budget.budget.budgetPercent) / 100,
        'Currency': budget.budget.currency,
      }];
      
      const summarySheet = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Budget Summary');
      
      // Suppliers
      const supplierData = budget.suppliers.map(supplier => ({
        'Supplier Name': supplier.name,
        'Allocation': parseFloat(supplier.allocation),
      }));
      
      const supplierSheet = XLSX.utils.json_to_sheet(supplierData);
      XLSX.utils.book_append_sheet(workbook, supplierSheet, 'Suppliers');
      
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=professional-budget.xlsx');
      res.send(buffer);
    } catch (error) {
      res.status(500).json({ error: "Failed to export professional budget" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
