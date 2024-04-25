const { defineConfig } = require("drizzle-kit");
const { pgSchema } = require("drizzle-orm/pg-core");
require("dotenv").config();

const config = defineConfig({
  schema: "./src/schemas/schema.js",
  out: "./src/schemas/migrations",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
});

module.exports = config;
