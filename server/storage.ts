import { 
  users, 
  profitScenarios,
  retailBudgets,
  retailSuppliers,
  professionalBudgets,
  professionalSuppliers,
  type User, 
  type UpsertUser,
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
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserVatPercent(userId: string, vatPercent: string): Promise<void>;
  updateUserProfessionalBudgetPercent(userId: string, budgetPercent: string): Promise<void>;
  
  // Profit scenarios
  getProfitScenarios(userId: string): Promise<ProfitScenario[]>;
  createProfitScenario(userId: string, scenario: InsertProfitScenario): Promise<ProfitScenario>;
  deleteProfitScenario(id: number, userId: string): Promise<void>;
  
  // Retail budgets
  getLatestRetailBudget(userId: string): Promise<{ budget: RetailBudget; suppliers: RetailSupplier[] } | null>;
  saveRetailBudget(userId: string, budget: InsertRetailBudget, suppliers: InsertRetailSupplier[]): Promise<{ budget: RetailBudget; suppliers: RetailSupplier[] }>;
  
  // Professional budgets
  getLatestProfessionalBudget(userId: string): Promise<{ budget: ProfessionalBudget; suppliers: ProfessionalSupplier[] } | null>;
  saveProfessionalBudget(userId: string, budget: InsertProfessionalBudget, suppliers: InsertProfessionalSupplier[]): Promise<{ budget: ProfessionalBudget; suppliers: ProfessionalSupplier[] }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserVatPercent(userId: string, vatPercent: string): Promise<void> {
    await db
      .update(users)
      .set({ defaultVatPercent: vatPercent, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async getProfitScenarios(userId: string): Promise<ProfitScenario[]> {
    return await db
      .select()
      .from(profitScenarios)
      .where(eq(profitScenarios.userId, userId))
      .orderBy(profitScenarios.createdAt);
  }

  async createProfitScenario(userId: string, scenario: InsertProfitScenario): Promise<ProfitScenario> {
    const [newScenario] = await db
      .insert(profitScenarios)
      .values({ ...scenario, userId })
      .returning();
    return newScenario;
  }

  async deleteProfitScenario(id: number, userId: string): Promise<void> {
    await db
      .delete(profitScenarios)
      .where(eq(profitScenarios.id, id) && eq(profitScenarios.userId, userId));
  }

  async getLatestRetailBudget(userId: string): Promise<{ budget: RetailBudget; suppliers: RetailSupplier[] } | null> {
    const [budget] = await db
      .select()
      .from(retailBudgets)
      .where(eq(retailBudgets.userId, userId))
      .orderBy(retailBudgets.updatedAt)
      .limit(1);

    if (!budget) return null;

    const suppliers = await db
      .select()
      .from(retailSuppliers)
      .where(eq(retailSuppliers.budgetId, budget.id));

    return { budget, suppliers };
  }

  async saveRetailBudget(userId: string, budget: InsertRetailBudget, suppliers: InsertRetailSupplier[]): Promise<{ budget: RetailBudget; suppliers: RetailSupplier[] }> {
    const [newBudget] = await db
      .insert(retailBudgets)
      .values({ ...budget, userId })
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

  async getLatestProfessionalBudget(userId: string): Promise<{ budget: ProfessionalBudget; suppliers: ProfessionalSupplier[] } | null> {
    const [budget] = await db
      .select()
      .from(professionalBudgets)
      .where(eq(professionalBudgets.userId, userId))
      .orderBy(professionalBudgets.updatedAt)
      .limit(1);

    if (!budget) return null;

    const suppliers = await db
      .select()
      .from(professionalSuppliers)
      .where(eq(professionalSuppliers.budgetId, budget.id));

    return { budget, suppliers };
  }

  async saveProfessionalBudget(userId: string, budget: InsertProfessionalBudget, suppliers: InsertProfessionalSupplier[]): Promise<{ budget: ProfessionalBudget; suppliers: ProfessionalSupplier[] }> {
    const [newBudget] = await db
      .insert(professionalBudgets)
      .values({ ...budget, userId })
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
