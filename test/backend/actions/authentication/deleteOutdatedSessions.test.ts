import {beforeEach, describe, expect, it} from "vitest";
import deleteOutdatedSessions from "../../../../src/backend/actions/authentication/deleteOutdatedSessions.ts";
import setupDb, {DbType} from "../../../../src/backend/database/setupDb.ts";


describe("deleteOutdatedSessions", () => {
	let db: DbType;
	
	beforeEach(async () => {
		db = await setupDb(":memory:", true);
		
		// Seed test data
		await db.insertInto("User").values([{name: "Aang", password: "", lastLogin: 0}]).execute();
		
		await db.insertInto("Session")
			.values([
				{expires: Date.now() - 1000, token: "1", userId: 1}, // Expired
				{expires: Date.now() + 1000, token: "2", userId: 1}, // Valid
			])
			.execute();
	});
	
	it("deletes sessions with expiration date earlier than the current time", async() => {
		// Verify initial state
		const beforeDelete = await db.selectFrom("Session").selectAll().execute();
		expect(beforeDelete.length).toBe(2);
		
		// Call the function
		await deleteOutdatedSessions(db);
		
		// Verify only the valid session remains
		const afterDelete = await db.selectFrom("Session").select("token").execute();
		expect(afterDelete.length).toBe(1);
		expect(afterDelete[0].token).toBe("2"); // Only the valid session should remain
	});
});