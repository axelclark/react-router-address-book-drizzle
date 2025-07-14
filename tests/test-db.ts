import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql } from "drizzle-orm";
import * as schema from "../database/schema";

const testConnectionString = process.env.TEST_DATABASE_URL || 
  process.env.DATABASE_URL || 
  "postgresql://localhost:5432/address_book_test";

const testClient = postgres(testConnectionString, { max: 1 });
export const testDb = drizzle(testClient, { schema });

export async function setupTestTransaction() {
  await testClient`BEGIN`;
}

export async function teardownTestTransaction() {
  await testClient`ROLLBACK`;
}

export async function closeTestDb() {
  await testClient.end();
}