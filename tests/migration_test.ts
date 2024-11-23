import { assertEquals, assertGreater } from "jsr:@std/assert";
import { down, up } from "../database/migrate.ts";
import { initiate } from "../database/db.ts";
import { Path } from "jsr:@david/path";

Deno.test("Testing if database migration functions work", async (t) => {
	const dbPath = new Path("tmp-db.sqlite");
	if (dbPath.existsSync()) dbPath.removeSync(); // make sure database file doesnt exist before test

	const db = initiate(dbPath.toString());

	await t.step("Migration up", async () => {
		assertEquals(dbPath.existsSync(), true); // Database file exists
		await up(db);

		const stat = Deno.statSync(dbPath.toString());
		assertEquals(stat.isFile, true);
		assertGreater(stat.size, 8);
	});

	await t.step("Migration down", async () => {
		await down(db);
		const stat = Deno.statSync(dbPath.toString());
		assertEquals(stat.isFile, true);
	});

	dbPath.removeSync();
	db.destroy();
});
