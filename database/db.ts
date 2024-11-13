import { Database } from "jsr:@db/sqlite";
import { Error, Success } from "../types/db.ts";

const db = new Database("./database/db.db");

export class TestDatabase {
	#name: string = "test";

	constructor() {
		const query = `
            CREATE TABLE IF NOT EXISTS ${this.#name} (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                num INTEGER NOT NULL
            );
        `;

		db.run(query);
	}

	create(num: number): Success | Error {
		const query = `INSERT INTO ${this.#name} (num) VALUES (?);`;
		try {
			db.prepare(query).run(num);
			return { success: true };
		} catch (err) {
			return { success: false, error: err };
		}
	}
}

/*

===== Future tables =====

---- Shows ----
id
tmdb_id
title
description
seasons
status
trailer
rating
tmdb_link
downloaded
last_checked


---- Episodes ----
id
show_id
season
episode
title
description
rating

*/
