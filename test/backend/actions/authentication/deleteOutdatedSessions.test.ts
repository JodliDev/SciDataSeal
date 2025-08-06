import {beforeEach, describe, expect, it} from "vitest";
import deleteOutdatedSessions from "../../../../src/backend/actions/authentication/deleteOutdatedSessions.ts";
import setupDb, {DbType} from "../../../../src/backend/database/setupDb.ts";


describe("deleteOutdatedSessions", () => {
	let db: DbType;
	
	beforeEach(async () => {
		db = await setupDb(":memory:", true);
		
		// Seed test data
		await db.insertInto("User").values([{
			isAdmin: false,
			username: "Aang",
			password: "",
			lastLogin: 0
		}]).execute();
	});
	
	it("deletes expired sessions while keeping valid ones", async() => {
		// Seed sessions
		await db.insertInto("Session").values([
			{expires: Date.now() - 1000, token: "1", userId: 1}, // Expired
			{expires: Date.now() + 1000, token: "2", userId: 1}, // Valid
		]).execute();
		
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

	it("does not delete sessions when no session is expired", async () => {
		// Seed sessions
		await db.insertInto("Session").values([
			{expires: Date.now() + 1000, token: "2", userId: 1}, // Valid
		]).execute();

		// Call the function
		await deleteOutdatedSessions(db);
		
		// Verify no sessions are deleted
		const sessions = await db.selectFrom("Session").selectAll().execute();
		expect(sessions.length).toBe(1);
		expect(sessions[0].token).toBe("2");
	});
	
	it("deletes all sessions when all are expired", async() => {
		// Seed sessions
		await db.insertInto("Session").values([
			{expires: Date.now() - 2000, token: "1", userId: 1}, // Expired
			{expires: Date.now() - 1000, token: "2", userId: 1}, // Expired
		]).execute();
		
		// Call the function
		await deleteOutdatedSessions(db);
		
		// Verify all sessions are deleted
		const sessions = await db.selectFrom("Session").selectAll().execute();
		expect(sessions.length).toBe(0);
	});
});