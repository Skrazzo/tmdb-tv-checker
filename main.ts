import { TestDatabase } from "./database/db.ts";

const tdb = new TestDatabase();

for (let i = 0; i < 10; i++) {
	const res = tdb.create(i);
	if (res.success) {
		console.log("Created");
	} else {
		console.error("Error:", res.error);
	}
}
