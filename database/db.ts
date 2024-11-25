// Database
import { Kysely } from "npm:kysely";
import { DB as Sqlite } from "https://deno.land/x/sqlite/mod.ts";
import { DenoSqliteDialect } from "jsr:@soapbox/kysely-deno-sqlite";
import { Database } from "../types/index.ts";


export function initiate(database: string): Kysely<Database> {
	const db: Kysely<Database> = new Kysely({
		dialect: new DenoSqliteDialect({
			database: new Sqlite(database),
		}),
	});
	return db;
}

export default { initiate };
