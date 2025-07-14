import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getContact, createContact, updateContact, deleteContact } from "../../app/actions/contactAction";
import { testDb, setupTestTransaction, teardownTestTransaction } from "../test-db";
import { DatabaseContext } from "../../database/context";
import { contacts } from "../../database/schema";
import { eq } from "drizzle-orm";

vi.mock("../../database/context", () => ({
  DatabaseContext: {
    getStore: vi.fn(() => testDb),
  },
  database: vi.fn(() => testDb),
}));

describe("Contact Actions", () => {
  beforeEach(async () => {
    await setupTestTransaction();
  });

  afterEach(async () => {
    await teardownTestTransaction();
  });

  describe("getContact", () => {
    it("should fetch a contact by id", async () => {
      const newContact = await testDb.insert(contacts).values({
        first: "John",
        last: "Doe",
        avatar: "avatar.jpg",
        twitter: "johndoe",
        notes: "Test notes",
        favorite: false,
      }).returning();

      const contact = await getContact(newContact[0].id.toString());

      expect(contact).toEqual({
        id: newContact[0].id,
        first: "John",
        last: "Doe",
        avatar: "avatar.jpg",
        twitter: "johndoe",
        notes: "Test notes",
        favorite: false,
        createdAt: expect.any(Date),
      });
    });

    it("should return null when contact not found", async () => {
      const contact = await getContact("999999");
      expect(contact).toBeNull();
    });
  });

  describe("createContact", () => {
    it("should create a new contact", async () => {
      const contactData = {
        first: "Jane",
        last: "Smith",
        favorite: false,
      };

      const newContact = await createContact(contactData);

      expect(newContact).toEqual({
        id: expect.any(Number),
        first: "Jane",
        last: "Smith",
        avatar: null,
        twitter: null,
        notes: null,
        favorite: false,
        createdAt: expect.any(Date),
      });

      const retrieved = await testDb.select().from(contacts).where(eq(contacts.id, newContact.id));
      expect(retrieved[0]).toEqual(newContact);
    });
  });

  describe("updateContact", () => {
    it("should update a contact", async () => {
      const newContact = await testDb.insert(contacts).values({
        first: "Original",
        last: "Name",
        favorite: false,
      }).returning();

      const updates = { first: "Updated", favorite: true };
      await updateContact(newContact[0].id.toString(), updates);

      const updated = await testDb.select().from(contacts).where(eq(contacts.id, newContact[0].id));
      expect(updated[0].first).toBe("Updated");
      expect(updated[0].favorite).toBe(true);
      expect(updated[0].last).toBe("Name");
    });
  });

  describe("deleteContact", () => {
    it("should delete a contact", async () => {
      const newContact = await testDb.insert(contacts).values({
        first: "ToDelete",
        last: "Contact",
      }).returning();

      await deleteContact(newContact[0].id.toString());

      const deleted = await testDb.select().from(contacts).where(eq(contacts.id, newContact[0].id));
      expect(deleted).toHaveLength(0);
    });
  });
});