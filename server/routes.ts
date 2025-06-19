import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertProfitScenarioSchema,
  insertRetailBudgetSchema,
  insertRetailSupplierSchema,
  insertProfessionalBudgetSchema,
  insertProfessionalSupplierSchema,
} from "@shared/schema";
import { z } from "zod";
import * as XLSX from 'xlsx';

export async function registerRoutes(app: Express): Promise<Server> {
  // Profit scenarios
  app.get("/api/profit-scenarios", async (req, res) => {
    try {
      const scenarios = await storage.getProfitScenarios();
      res.json(scenarios);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch profit scenarios" });
    }
  });

  app.post("/api/profit-scenarios", async (req, res) => {
    try {
      const scenario = insertProfitScenarioSchema.parse(req.body);
      const newScenario = await storage.createProfitScenario(scenario);
      res.json(newScenario);
    } catch (error) {
      res.status(400).json({ error: "Invalid scenario data" });
    }
  });

  app.delete("/api/profit-scenarios/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteProfitScenario(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete scenario" });
    }
  });

  // Retail budget
  app.get("/api/retail-budget", async (req, res) => {
    try {
      const budget = await storage.getLatestRetailBudget();
      res.json(budget);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch retail budget" });
    }
  });

  app.post("/api/retail-budget", async (req, res) => {
    try {
      const { budget, suppliers } = req.body;
      const budgetData = insertRetailBudgetSchema.parse(budget);
      const supplierData = z.array(insertRetailSupplierSchema.omit({ budgetId: true })).parse(suppliers);
      
      const result = await storage.saveRetailBudget(budgetData, supplierData);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: "Invalid budget data" });
    }
  });

  // Professional budget
  app.get("/api/professional-budget", async (req, res) => {
    try {
      const budget = await storage.getLatestProfessionalBudget();
      res.json(budget);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch professional budget" });
    }
  });

  app.post("/api/professional-budget", async (req, res) => {
    try {
      const { budget, suppliers } = req.body;
      const budgetData = insertProfessionalBudgetSchema.parse(budget);
      const supplierData = z.array(insertProfessionalSupplierSchema.omit({ budgetId: true })).parse(suppliers);
      
      const result = await storage.saveProfessionalBudget(budgetData, supplierData);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: "Invalid budget data" });
    }
  });

  // Excel export endpoints
  app.post("/api/export/profit-scenarios", async (req, res) => {
    try {
      const scenarios = await storage.getProfitScenarios();
      const workbook = XLSX.utils.book_new();
      
      const worksheetData = scenarios.map(scenario => ({
        'Scenario Name': scenario.name,
        'Product Name': scenario.productName,
        'RRP': parseFloat(scenario.rrp),
        'VAT Registered': scenario.vatRegistered ? 'Yes' : 'No',
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

  app.post("/api/export/retail-budget", async (req, res) => {
    try {
      const budget = await storage.getLatestRetailBudget();
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

  app.post("/api/export/professional-budget", async (req, res) => {
    try {
      const budget = await storage.getLatestProfessionalBudget();
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
