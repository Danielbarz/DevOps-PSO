import { db } from "@scholar-seek/db";
import { migrate } from "drizzle-orm/node-postgres/migrator";

async function main() {
	console.log("Running database migrations...");
	try {
		await migrate(db, { migrationsFolder: "./migrations" });
		console.log("Migrations completed successfully!");
		process.exit(0);
	} catch (error) {
		console.error("Migration failed!", error);
		console.error("Continuing anyway so the server can start and we can diagnose the error...");
		process.exit(0); // Exit with 0 so index.mjs runs
	}
}

main();
