import { eq, not, or, ilike } from "drizzle-orm";
import { database } from "../../database/context";
import { contacts } from "../../database/schema";

export type ContactRecord = typeof contacts.$inferSelect;

export const getContacts = async (query?: string) => {
  const db = database();
  
  if (query) {
    const data = await db
      .select()
      .from(contacts)
      .where(
        or(
          ilike(contacts.first, `%${query}%`),
          ilike(contacts.last, `%${query}%`)
        )
      )
      .orderBy(contacts.last, contacts.createdAt);
    return data;
  }
  
  const data = await db.select().from(contacts).orderBy(contacts.last, contacts.createdAt);
  return data;
};

export const getContact = async (id: string) => {
  const db = database();
  const data = await db.select().from(contacts).where(eq(contacts.id, parseInt(id)));
  return data[0] || null;
};

export const createContact = async (contactData: {
  first?: string;
  last?: string;
  avatar?: string;
  twitter?: string;
  notes?: string;
  favorite?: boolean;
}) => {
  const db = database();
  const result = await db.insert(contacts).values(contactData).returning();
  return result[0];
};

export const updateContact = async (
  id: string,
  updates: {
    first?: string;
    last?: string;
    avatar?: string;
    twitter?: string;
    notes?: string;
    favorite?: boolean;
  }
) => {
  const db = database();
  await db.update(contacts).set(updates).where(eq(contacts.id, parseInt(id)));
};

export const deleteContact = async (id: string) => {
  const db = database();
  await db.delete(contacts).where(eq(contacts.id, parseInt(id)));
};

export const toggleFavorite = async (id: string) => {
  const db = database();
  await db
    .update(contacts)
    .set({
      favorite: not(contacts.favorite),
    })
    .where(eq(contacts.id, parseInt(id)));
};

export const createEmptyContact = async () => {
  return await createContact({});
};