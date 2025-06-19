import { pgTable, text, serial, integer, boolean, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const profitScenarios = pgTable("profit_scenarios", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  productName: text("product_name").notNull(),
  rrp: decimal("rrp", { precision: 10, scale: 2 }).notNull(),
  vatRegistered: boolean("vat_registered").default(false),
  listPrice: decimal("list_price", { precision: 10, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 5, scale: 2 }).default("0"),
  retroDiscount: decimal("retro_discount", { precision: 5, scale: 2 }).default("0"),
  usage: decimal("usage", { precision: 5, scale: 2 }).default("0"),
  commission: decimal("commission", { precision: 10, scale: 2 }).default("0"),
  currency: text("currency").default("GBP"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const retailBudgets = pgTable("retail_budgets", {
  id: serial("id").primaryKey(),
  netSales: decimal("net_sales", { precision: 10, scale: 2 }).notNull(),
  budgetPercent: decimal("budget_percent", { precision: 5, scale: 2 }).notNull(),
  currency: text("currency").default("GBP"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const retailSuppliers = pgTable("retail_suppliers", {
  id: serial("id").primaryKey(),
  budgetId: integer("budget_id").references(() => retailBudgets.id),
  name: text("name").notNull(),
  allocation: decimal("allocation", { precision: 10, scale: 2 }).notNull(),
});

export const professionalBudgets = pgTable("professional_budgets", {
  id: serial("id").primaryKey(),
  netServices: decimal("net_services", { precision: 10, scale: 2 }).notNull(),
  budgetPercent: decimal("budget_percent", { precision: 5, scale: 2 }).notNull(),
  currency: text("currency").default("GBP"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const professionalSuppliers = pgTable("professional_suppliers", {
  id: serial("id").primaryKey(),
  budgetId: integer("budget_id").references(() => professionalBudgets.id),
  name: text("name").notNull(),
  allocation: decimal("allocation", { precision: 10, scale: 2 }).notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertProfitScenarioSchema = createInsertSchema(profitScenarios).omit({
  id: true,
  createdAt: true,
});

export const insertRetailBudgetSchema = createInsertSchema(retailBudgets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRetailSupplierSchema = createInsertSchema(retailSuppliers).omit({
  id: true,
});

export const insertProfessionalBudgetSchema = createInsertSchema(professionalBudgets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProfessionalSupplierSchema = createInsertSchema(professionalSuppliers).omit({
  id: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type ProfitScenario = typeof profitScenarios.$inferSelect;
export type InsertProfitScenario = z.infer<typeof insertProfitScenarioSchema>;

export type RetailBudget = typeof retailBudgets.$inferSelect;
export type InsertRetailBudget = z.infer<typeof insertRetailBudgetSchema>;

export type RetailSupplier = typeof retailSuppliers.$inferSelect;
export type InsertRetailSupplier = z.infer<typeof insertRetailSupplierSchema>;

export type ProfessionalBudget = typeof professionalBudgets.$inferSelect;
export type InsertProfessionalBudget = z.infer<typeof insertProfessionalBudgetSchema>;

export type ProfessionalSupplier = typeof professionalSuppliers.$inferSelect;
export type InsertProfessionalSupplier = z.infer<typeof insertProfessionalSupplierSchema>;
