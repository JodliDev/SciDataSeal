import {describe, it, expect} from 'vitest';
import NetworkErrorException from "../../../src/shared/exceptions/NetworkErrorException";
import RequestFailedException from "../../../src/shared/exceptions/RequestFailedException";
import postData from "../../../src/frontend/actions/postData";
import {mockFetch} from "../../convenience";

describe("postData()", () => {
	const uploadData = {content: "uploadData"}
	
	it("should return data when the response is successful", async() => {
		mockFetch({ok: true, data: "testData"}, 200, init => {
			expect(init.body).toBe(JSON.stringify(uploadData));
		});
		
		expect(await postData("solana", uploadData)).toBe("testData");
	});
	it("should throw NetworkErrorException when request failed", async() => {
		mockFetch({ok: true, data: "testData"}, 500);
		await expect(postData("solana", uploadData)).rejects.toThrow(NetworkErrorException);
	});
	it("should throw RequestFailedException when data.ok is false", async() => {
		mockFetch({ok: false, error: 'Request failed'}, 200);
		await expect(postData("solana", uploadData)).rejects.toThrow(RequestFailedException);
	});
})

