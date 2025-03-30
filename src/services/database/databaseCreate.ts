import { getConnection } from "./dbconnect.js";

export async function createTables() {
    let db = getConnection();

    await db.schema.createTable('user_ratings', (table) => {
        table.string('guild_id').notNullable();
        table.string('user_id').notNullable();
        table.integer('score').notNullable();
        table.primary(['guild_id', 'user_id']);
    });

    await db.schema.createTable('user_changes', (table) => {
        table.string('guild_id').notNullable();
        table.string('user_id').notNullable();
        table.integer('change').notNullable();
        table.string('day', 8).notNullable(); // YYYYMMDD format
        table.primary(['guild_id', 'user_id', 'day']);
    });
}