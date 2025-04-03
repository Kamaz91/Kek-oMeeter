import fs from "fs";
import knexPkg, { Knex } from "knex";
import path from "path";
import { createTables } from "./databaseCreate.js";
import config from "./knexFile.js"

const knex = knexPkg.default;

let knexConnection: Knex;

export async function connect(): Promise<{ status: boolean; message: string }> {
  if (!isDatabaseExist()) {
    console.error("Database file does not exist");
  }

  knexConnection = knex(config)
    .on("connection-error", (e) => {
      console.error("Knex database connection-error");
      console.log(e);
    });
  console.log("Are Tables created?", await areTablesCreated());
  if (!await areTablesCreated()) {
    createTables()
      .then(() => {
        console.log('Tables created');
      })
      .catch((error) => {
        console.error('Error creating tables:', error);
        process.exit(1);
      });
  }

  return isConnectionEstablished(knexConnection);
}

export function disconnect(): void {
  console.info(`Database successfully disconnected`);
  knexConnection.destroy();
}

export function getConnection(): Knex {
  return knexConnection;
}

function isConnectionEstablished(connecting: Knex) {
  return connecting.raw('SELECT 1+1 AS result')
    .then((result) => { console.log("DB result should be 2=", result[0]); return { status: true, message: "Database Connected" } })
    .catch((error) => { console.log(error); return { status: false, message: error.toString() } });
}

function isDatabaseExist(): boolean {
  let file = path.resolve(process.env.DB_FILENAME);
  return fs.existsSync(file);
}

async function areTablesCreated() {
  let db = knexConnection;

  const hasUserRatingsTable = await db.schema.hasTable('user_ratings');
  const hasUserChangesTable = await db.schema.hasTable('user_changes');

  return hasUserRatingsTable && hasUserChangesTable;
}