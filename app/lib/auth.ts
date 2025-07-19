import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const authClient = postgres(process.env.DATABASE_URL!);
const authDb = drizzle(authClient);

export const auth = betterAuth({
  database: drizzleAdapter(authDb, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
  },
});