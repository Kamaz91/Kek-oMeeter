import { getConnection } from "./dbconnect.js";

export async function createTables() {
    let db = getConnection();

    await db.schema.createTable('user_ratings', (table) => {
        table.increments('id').primary().notNullable(); // Auto-incrementing primary key
        table.string('guild_id').notNullable();
        table.string('user_id').notNullable();
        table.integer('score').notNullable();
        table.timestamp('created_at').notNullable(); // Timestamp in milliseconds
    });

    await db.schema.createTable('user_changes', (table) => {
        table.increments('id').primary().notNullable(); // Auto-incrementing primary key
        table.string('guild_id').notNullable();
        table.string('user_id').notNullable();
        table.integer('change').notNullable();
        table.string('day', 8).notNullable(); // YYYYMMDD format
        table.timestamp('created_at').notNullable(); // Timestamp in milliseconds
    });

    await db.schema.createTable('files_hash', (table) => {
        table.increments('id').primary().notNullable(); // Auto-incrementing primary key
        table.string('hash').notNullable();
        table.string('filename').notNullable();
        table.timestamp('created_at').notNullable(); // Timestamp in milliseconds
    });
}