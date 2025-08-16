import {afterEach, describe, expect, it, vi} from "vitest";
import {getUrlData} from "../../../src/frontend/actions/getUrlData.ts";
import {FrontendOptions} from "../../../src/shared/FrontendOptions.ts";

describe("getUrlData", () => {
	const mockWindowLocation = (pathname: string, search: string) => {
		vi.stubGlobal("window", {
			location: {
				pathname,
				search,
			},
		});
	};
	
	afterEach(() => {
		vi.restoreAllMocks();
	});
	
	it("should return correct page", () => {
		mockWindowLocation("/home", "?search=example");
		
		const options: FrontendOptions = {
			isInit: true,
			urlPath: "/",
		};
		
		const result = getUrlData(options);
		
		expect(result).toEqual({
			page: "home",
			query: "?search=example",
		});
	});
	
	it("should return correct page when urlPath is a subfolder", () => {
		mockWindowLocation("/app/home", "?search=example");
		
		const options: FrontendOptions = {
			isInit: true,
			urlPath: "/app/",
		};
		
		const result = getUrlData(options);
		
		expect(result).toEqual({
			page: "home",
			query: "?search=example",
		});
	});
	
	it("should handle sub subfolder", () => {
		mockWindowLocation("/other-path/page", "?foo=bar");
		
		const options: FrontendOptions = {
			isInit: true,
			urlPath: "/",
		};
		
		const result = getUrlData(options);
		
		expect(result).toEqual({
			page: "other-path/page",
			query: "?foo=bar",
		});
	});
	
	it("should handle sub subfolder when urlPath is a subfolder", () => {
		mockWindowLocation("/app/other-path/page", "?foo=bar");
		
		const options: FrontendOptions = {
			isInit: true,
			urlPath: "/app/",
		};
		
		const result = getUrlData(options);
		
		expect(result).toEqual({
			page: "other-path/page",
			query: "?foo=bar",
		});
	});
	
	it("should handle empty query string", () => {
		mockWindowLocation("/app/dashboard", "");
		
		const options: FrontendOptions = {
			isInit: true,
			urlPath: "/app/",
		};
		
		const result = getUrlData(options);
		
		expect(result).toEqual({
			page: "dashboard",
			query: "",
		});
	});
	
	it("should handle root path correctly", () => {
		mockWindowLocation("/", "?filter=test");
		
		const options: FrontendOptions = {
			isInit: true,
			urlPath: "/",
		};
		
		const result = getUrlData(options);
		
		expect(result).toEqual({
			page: "",
			query: "?filter=test",
		});
	});
	
	it("should handle root path correctly when urlPath is a subfolder", () => {
		mockWindowLocation("/app/", "?filter=test");
		
		const options: FrontendOptions = {
			isInit: true,
			urlPath: "/app/",
		};
		
		const result = getUrlData(options);
		
		expect(result).toEqual({
			page: "",
			query: "?filter=test",
		});
	});
});