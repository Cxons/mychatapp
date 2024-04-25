const { drizzle } = require("drizzle-orm/node-postgres");
const pg = require("pg");
require("dotenv").config();
const schemas = require("../../src/schemas/schema.js");
const connectionUrl = process.env.DATABASE_URL;
const pool = new pg.Pool({
  connectionString: connectionUrl,
});

pool
  .connect()
  .then((port) => {
    console.log(`Db connected successfully at port ${port.port}`);
  })
  .catch((err) => {
    console.log("an error occured", err);
  });
// or
// const pool = new Pool({
//   host: "localhost",
//   port: 5432,
//   user: "postgres",
//   password: "password",
//   database: "db_name",
// });

const db = drizzle(pool, { schemas, logger: true });

module.exports = { db };
