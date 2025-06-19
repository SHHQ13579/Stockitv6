import { pgTable, text, serial, integer, boolean, decimal, timestamp, jsonb, varchar, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  defaultVatPercent: decimal("default_vat_percent", { precision: 5, scale: 2 }).default("20.0"),
  defaultProfessionalBudgetPercent: decimal("default_professional_budget_percent", { precision: 5, scale: 2 }).default("7.0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const profitScenarios = pgTable("profit_scenarios", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  productName: text("product_name").notNull(),
  rrp: decimal("rrp", { precision: 10, scale: 2 }).notNull(),
  vatRegistered: boolean("vat_registered").default(false).notNull(),
  vatPercent: decimal("vat_percent", { precision: 5, scale: 2 }).default("20.0"),
  listPrice: decimal("list_price", { precision: 10, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 5, scale: 2 }).default("0").notNull(),
  retroDiscount: decimal("retro_discount", { precision: 5, scale: 2 }).default("0").notNull(),
  usage: decimal("usage", { precision: 5, scale: 2 }).default("0").notNull(),
  commission: decimal("commission", { precision: 10, scale: 2 }).default("0").notNull(),
  currency: text("currency").default("GBP").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const retailBudgets = pgTable("retail_budgets", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  netSales: decimal("net_sales", { precision: 10, scale: 2 }).notNull(),
  budgetPercent: decimal("budget_percent", { precision: 5, scale: 2 }).notNull(),
  currency: text("currency").default("GBP").notNull(),
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
  userId: varchar("user_id").references(() => users.id).notNull(),
  netServices: decimal("net_services", { precision: 10, scale: 2 }).notNull(),
  budgetPercent: decimal("budget_percent", { precision: 5, scale: 2 }).notNull(),
  currency: text("currency").default("GBP").notNull(),
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
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
  defaultVatPercent: true,
});

export const upsertUserSchema = createInsertSchema(users).pick({
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

export const insertProfitScenarioSchema = createInsertSchema(profitScenarios).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertRetailBudgetSchema = createInsertSchema(retailBudgets).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRetailSupplierSchema = createInsertSchema(retailSuppliers).omit({
  id: true,
});

export const insertProfessionalBudgetSchema = createInsertSchema(professionalBudgets).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProfessionalSupplierSchema = createInsertSchema(professionalSuppliers).omit({
  id: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = z.infer<typeof upsertUserSchema>;

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
