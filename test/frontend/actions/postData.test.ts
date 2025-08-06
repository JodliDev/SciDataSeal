import {describe, it, expect} from 'vitest';
import postData from "../../../src/frontend/actions/postData";
import {mockFetch} from "../../convenience";

describe("postData()", () => {
	const uploadData = {content: "uploadData"}
	
	it("should fetch the correct url", async() => {
		mockFetch({ok: true}, 200, (url) => {
			expect(url).toBe("api/test?key=value");
		});
		await postData("/test", uploadData, {query: "?key=value"});
	});
	it("should return data when the response is successful", async() => {
		mockFetch({ok: true, data: "testData"}, 200, (_, init) => {
			expect(init.body).toBe(JSON.stringify(uploadData));
		});
		
		expect(await postData("/test", uploadData)).toBe("testData");
	});
	it("should return data when the response is successful", async() => {
		mockFetch({ok: true, data: "testData"}, 200, (_, init) => {
			expect(init.headers).toEqual({
				"Content-Type": "application/json",
				"header1": "value1",
				"header2": "value2"
			});
		});
		
		await postData("/test", uploadData, {
			headers: {
				"header1": "value1",
				"header2": "value2"
		}});
	});
})

