import {describe, it, expect, afterAll, vi} from 'vitest';
import getData from "../../../src/frontend/actions/getData";
import {mockFetch} from "../../convenience";

describe("getData", () => {
	afterAll(() => {
		vi.restoreAllMocks();
	});
	it("should fetch the correct url", async() => {
		mockFetch({ok: true}, 200, (url) => {
			expect(url).toBe("api/test?key=value");
		});
		await getData("/test", "?key=value")
	});
	it("should return the correct data", async() => {
		mockFetch({ok: true, data: "testData"}, 200);
		
		expect(await getData("/test")).toBe("testData");
	});
})

