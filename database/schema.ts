import { boolean, integer, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const contacts = pgTable("contacts", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  first: text("first"),
  last: text("last"),
  avatar: text("avatar"),
  twitter: varchar({ length: 255 }),
  notes: text("notes"),
  favorite: boolean("favorite").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
