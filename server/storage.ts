import { 
  profitScenarios,
  retailBudgets,
  retailSuppliers,
  professionalBudgets,
  professionalSuppliers,
  type ProfitScenario,
  type InsertProfitScenario,
  type RetailBudget,
  type InsertRetailBudget,
  type RetailSupplier,
  type InsertRetailSupplier,
  type ProfessionalBudget,
  type InsertProfessionalBudget,
  type ProfessionalSupplier,
  type InsertProfessionalSupplier,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Profit scenarios - simplified without user isolation
  getProfitScenarios(): Promise<ProfitScenario[]>;
  createProfitScenario(scenario: InsertProfitScenario): Promise<ProfitScenario>;
  deleteProfitScenario(id: number): Promise<void>;
  
  // Retail budgets - simplified without user isolation
  getLatestRetailBudget(): Promise<{ budget: RetailBudget; suppliers: RetailSupplier[] } | null>;
  saveRetailBudget(budget: InsertRetailBudget, suppliers: InsertRetailSupplier[]): Promise<{ budget: RetailBudget; suppliers: RetailSupplier[] }>;
  
  // Professional budgets - simplified without user isolation
  getLatestProfessionalBudget(): Promise<{ budget: ProfessionalBudget; suppliers: ProfessionalSupplier[] } | null>;
  saveProfessionalBudget(budget: InsertProfessionalBudget, suppliers: InsertProfessionalSupplier[]): Promise<{ budget: ProfessionalBudget; suppliers: ProfessionalSupplier[] }>;
}

export class DatabaseStorage implements IStorage {
  // Profit scenarios - simplified without user isolation
  async getProfitScenarios(): Promise<ProfitScenario[]> {
    return await db
      .select()
      .from(profitScenarios)
      .orderBy(desc(profitScenarios.createdAt));
  }

  async createProfitScenario(scenario: InsertProfitScenario): Promise<ProfitScenario> {
    const [newScenario] = await db
      .insert(profitScenarios)
      .values(scenario)
      .returning();
    return newScenario;
  }

  async deleteProfitScenario(id: number): Promise<void> {
    await db
      .delete(profitScenarios)
      .where(eq(profitScenarios.id, id));
  }

  // Retail budgets - simplified without user isolation
  async getLatestRetailBudget(): Promise<{ budget: RetailBudget; suppliers: RetailSupplier[] } | null> {
    const [budget] = await db
      .select()
      .from(retailBudgets)
      .orderBy(desc(retailBudgets.updatedAt))
      .limit(1);

    if (!budget) return null;

    const suppliers = await db
      .select()
      .from(retailSuppliers)
      .where(eq(retailSuppliers.budgetId, budget.id));

    return { budget, suppliers };
  }

  async saveRetailBudget(budget: InsertRetailBudget, suppliers: InsertRetailSupplier[]): Promise<{ budget: RetailBudget; suppliers: RetailSupplier[] }> {
    const [newBudget] = await db
      .insert(retailBudgets)
      .values(budget)
      .returning();

    const newSuppliers = [];
    for (const supplier of suppliers) {
      const [newSupplier] = await db
        .insert(retailSuppliers)
        .values({ ...supplier, budgetId: newBudget.id })
        .returning();
      newSuppliers.push(newSupplier);
    }

    return { budget: newBudget, suppliers: newSuppliers };
  }

  // Professional budgets - simplified without user isolation
  async getLatestProfessionalBudget(): Promise<{ budget: ProfessionalBudget; suppliers: ProfessionalSupplier[] } | null> {
    const [budget] = await db
      .select()
      .from(professionalBudgets)
      .orderBy(desc(professionalBudgets.updatedAt))
      .limit(1);

    if (!budget) return null;

    const suppliers = await db
      .select()
      .from(professionalSuppliers)
      .where(eq(professionalSuppliers.budgetId, budget.id));

    return { budget, suppliers };
  }

  async saveProfessionalBudget(budget: InsertProfessionalBudget, suppliers: InsertProfessionalSupplier[]): Promise<{ budget: ProfessionalBudget; suppliers: ProfessionalSupplier[] }> {
    const [newBudget] = await db
      .insert(professionalBudgets)
      .values(budget)
      .returning();

    const newSuppliers = [];
    for (const supplier of suppliers) {
      const [newSupplier] = await db
        .insert(professionalSuppliers)
        .values({ ...supplier, budgetId: newBudget.id })
        .returning();
      newSuppliers.push(newSupplier);
    }

    return { budget: newBudget, suppliers: newSuppliers };
  }
}

export const storage = new DatabaseStorage();
