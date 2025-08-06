import {afterEach, describe, expect, it} from "vitest";
import {FrontendOptionsString, recreateOptionsString} from "../../../src/backend/actions/recreateOptionsString.ts";
import {mockKysely} from "../../convenience.ts";
import {Options} from "../../../src/backend/Options.ts";

describe("recreateOptionsString", () => {
	afterEach(() => {
		mockDb.resetMocks();
	});
	
	const mockDb = mockKysely();
	
	it("should recreate options with isInit = true when user accounts exist", async() => {
		mockDb.selectFrom.chain("User")
			.executeTakeFirst.mockResolvedValue({count: 10});
		
		await recreateOptionsString(mockDb);
		
		expect(FrontendOptionsString).toEqual(JSON.stringify({
			isInit: true,
			urlPath: Options.urlPath
		}));
	});
	
	it("should recreate options with isInit = false when no user accounts exist", async() => {
		mockDb.selectFrom.chain("User")
			.executeTakeFirst.mockResolvedValue({count: 0});
		
		await recreateOptionsString(mockDb);
		
		expect(FrontendOptionsString).toEqual(JSON.stringify({
			isInit: false,
			urlPath: Options.urlPath
		}));
	});
});