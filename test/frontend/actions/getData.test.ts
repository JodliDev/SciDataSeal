import {describe, it, expect} from 'vitest';
import getData from "../../../src/frontend/actions/getData";
import NetworkErrorException from "../../../src/shared/exceptions/NetworkErrorException";
import RequestFailedException from "../../../src/shared/exceptions/RequestFailedException";
import {mockFetch} from "../../convenience";

describe("getData()", () => {
	it("should return data when the response is successful", async() => {
		mockFetch({ok: true, data: "testData"}, 200);
		
		expect(await getData("/solana")).toBe("testData");
	});
	it("should throw NetworkErrorException when request failed", async() => {
		mockFetch({ok: true, data: "testData"}, 500);
		await expect(getData("/solana")).rejects.toThrow(NetworkErrorException);
	});
	it("should throw RequestFailedException when data.ok is false", async() => {
		mockFetch({ok: false, error: 'Request failed'}, 200);
		await expect(getData("/solana")).rejects.toThrow(RequestFailedException);
	});
})

