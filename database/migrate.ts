import { Kysely } from "npm:kysely";
import { Database } from "../types/index.ts";

export async function up(db: Kysely<Database>): Promise<void> {
	console.time("shows");
	await db.schema.createTable("shows")
		.addColumn("id", "integer", (col) => col.primaryKey())
		.addColumn("tmdb_id", "integer", (col) => col.notNull())
		.addColumn("path", "text")
		.addColumn("title", "text")
		.addColumn("status", "text")
		.addColumn("banner", "text")
		.addColumn("poster", "text")
		.addColumn("user_score", "integer")
		.addColumn("year", "integer")
		.addColumn("overview", "text")
		.addColumn("last_checked", "text", (col) => col.notNull())
		.execute();
	console.timeEnd("shows");

	console.time("episodes");
	await db.schema.createTable("episodes")
		.addColumn("id", "integer", (col) => col.primaryKey())
		.addColumn("show_id", "integer", (col) => col.notNull())
		.addColumn("season", "integer", (col) => col.notNull())
		.addColumn("episode", "integer", (col) => col.notNull())
		.addColumn("path", "text")
		.addColumn("title", "text")
		.addColumn("overview", "text")
		.addColumn("release_date", "text")
		.addColumn("length", "integer")
		.addColumn("user_score", "integer")
		.addColumn("last_checked", "text", (col) => col.notNull())
		.execute();
	console.timeEnd("episodes");
}

export async function down(db: Kysely<Database>): Promise<void> {
	await db.schema.dropTable("shows").execute();
}

export default { up, down };
