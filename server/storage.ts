import { 
  users, 
  profitScenarios,
  retailBudgets,
  retailSuppliers,
  professionalBudgets,
  professionalSuppliers,
  type User, 
  type InsertUser,
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

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Profit scenarios
  getProfitScenarios(): Promise<ProfitScenario[]>;
  createProfitScenario(scenario: InsertProfitScenario): Promise<ProfitScenario>;
  deleteProfitScenario(id: number): Promise<void>;
  
  // Retail budgets
  getLatestRetailBudget(): Promise<{ budget: RetailBudget; suppliers: RetailSupplier[] } | null>;
  saveRetailBudget(budget: InsertRetailBudget, suppliers: InsertRetailSupplier[]): Promise<{ budget: RetailBudget; suppliers: RetailSupplier[] }>;
  
  // Professional budgets
  getLatestProfessionalBudget(): Promise<{ budget: ProfessionalBudget; suppliers: ProfessionalSupplier[] } | null>;
  saveProfessionalBudget(budget: InsertProfessionalBudget, suppliers: InsertProfessionalSupplier[]): Promise<{ budget: ProfessionalBudget; suppliers: ProfessionalSupplier[] }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private profitScenarios: Map<number, ProfitScenario>;
  private retailBudgets: Map<number, RetailBudget>;
  private retailSuppliers: Map<number, RetailSupplier>;
  private professionalBudgets: Map<number, ProfessionalBudget>;
  private professionalSuppliers: Map<number, ProfessionalSupplier>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.profitScenarios = new Map();
    this.retailBudgets = new Map();
    this.retailSuppliers = new Map();
    this.professionalBudgets = new Map();
    this.professionalSuppliers = new Map();
    this.currentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getProfitScenarios(): Promise<ProfitScenario[]> {
    return Array.from(this.profitScenarios.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async createProfitScenario(scenario: InsertProfitScenario): Promise<ProfitScenario> {
    const id = this.currentId++;
    const newScenario: ProfitScenario = {
      ...scenario,
      id,
      createdAt: new Date(),
    };
    this.profitScenarios.set(id, newScenario);
    return newScenario;
  }

  async deleteProfitScenario(id: number): Promise<void> {
    this.profitScenarios.delete(id);
  }

  async getLatestRetailBudget(): Promise<{ budget: RetailBudget; suppliers: RetailSupplier[] } | null> {
    const budgets = Array.from(this.retailBudgets.values());
    if (budgets.length === 0) return null;
    
    const latestBudget = budgets.sort((a, b) => 
      new Date(b.updatedAt!).getTime() - new Date(a.updatedAt!).getTime()
    )[0];
    
    const suppliers = Array.from(this.retailSuppliers.values())
      .filter(s => s.budgetId === latestBudget.id);
    
    return { budget: latestBudget, suppliers };
  }

  async saveRetailBudget(budget: InsertRetailBudget, suppliers: InsertRetailSupplier[]): Promise<{ budget: RetailBudget; suppliers: RetailSupplier[] }> {
    const budgetId = this.currentId++;
    const now = new Date();
    const newBudget: RetailBudget = {
      ...budget,
      id: budgetId,
      createdAt: now,
      updatedAt: now,
    };
    this.retailBudgets.set(budgetId, newBudget);
    
    // Clear existing suppliers for this budget
    const existingSuppliers = Array.from(this.retailSuppliers.entries())
      .filter(([_, supplier]) => supplier.budgetId === budgetId);
    existingSuppliers.forEach(([id, _]) => this.retailSuppliers.delete(id));
    
    // Add new suppliers
    const newSuppliers: RetailSupplier[] = suppliers.map(supplier => {
      const id = this.currentId++;
      const newSupplier: RetailSupplier = {
        ...supplier,
        id,
        budgetId,
      };
      this.retailSuppliers.set(id, newSupplier);
      return newSupplier;
    });
    
    return { budget: newBudget, suppliers: newSuppliers };
  }

  async getLatestProfessionalBudget(): Promise<{ budget: ProfessionalBudget; suppliers: ProfessionalSupplier[] } | null> {
    const budgets = Array.from(this.professionalBudgets.values());
    if (budgets.length === 0) return null;
    
    const latestBudget = budgets.sort((a, b) => 
      new Date(b.updatedAt!).getTime() - new Date(a.updatedAt!).getTime()
    )[0];
    
    const suppliers = Array.from(this.professionalSuppliers.values())
      .filter(s => s.budgetId === latestBudget.id);
    
    return { budget: latestBudget, suppliers };
  }

  async saveProfessionalBudget(budget: InsertProfessionalBudget, suppliers: InsertProfessionalSupplier[]): Promise<{ budget: ProfessionalBudget; suppliers: ProfessionalSupplier[] }> {
    const budgetId = this.currentId++;
    const now = new Date();
    const newBudget: ProfessionalBudget = {
      ...budget,
      id: budgetId,
      createdAt: now,
      updatedAt: now,
    };
    this.professionalBudgets.set(budgetId, newBudget);
    
    // Clear existing suppliers for this budget
    const existingSuppliers = Array.from(this.professionalSuppliers.entries())
      .filter(([_, supplier]) => supplier.budgetId === budgetId);
    existingSuppliers.forEach(([id, _]) => this.professionalSuppliers.delete(id));
    
    // Add new suppliers
    const newSuppliers: ProfessionalSupplier[] = suppliers.map(supplier => {
      const id = this.currentId++;
      const newSupplier: ProfessionalSupplier = {
        ...supplier,
        id,
        budgetId,
      };
      this.professionalSuppliers.set(id, newSupplier);
      return newSupplier;
    });
    
    return { budget: newBudget, suppliers: newSuppliers };
  }
}

export const storage = new MemStorage();
