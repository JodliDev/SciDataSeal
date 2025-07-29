import {afterEach, beforeEach, describe, expect, it} from "vitest";
import {createNewOptionsForTest} from "../../src/backend/Options.ts";

describe("Options", () => {
	let originalEnv: NodeJS.ProcessEnv;
	let originalArgv: string[];
	
	beforeEach(() => {
		// Save original environment variables and arguments
		originalEnv = {...process.env};
		originalArgv = [...process.argv];
	});
	
	afterEach(() => {
		// Restore original environment variables and arguments
		process.env = originalEnv;
		process.argv = originalArgv;
	});
	
	it("should override properties with environment variables", () => {
		process.env.mode = "production";
		process.env.port = "8080";
		process.env.root = "/custom/root";
		process.env.urlPath = "/custom/path/";
		process.env.isInit = "";
		
		const options = createNewOptionsForTest();
		
		expect(options.mode).toBe("production");
		expect(options.port).toBe(8080);
		expect(options.root).toBe("/custom/root");
		expect(options.urlPath).toBe("/custom/path/");
		expect(options.isInit).toBe(false);
	});
	
	it("should override properties with command-line arguments", () => {
		process.argv.push("mode=production", "port=8080", "root=/custom/root", "urlPath=/custom/path/", "isInit=true");
		
		const options = createNewOptionsForTest();
		
		expect(options.mode).toBe("production");
		expect(options.port).toBe(8080);
		expect(options.root).toBe("/custom/root");
		expect(options.urlPath).toBe("/custom/path/");
		expect(options.isInit).toBe(true);
	});
	
	it("should prioritize command-line arguments over environment variables", () => {
		process.env.mode = "development";
		process.env.port = "3000";
		process.env.root = "/env/root";
		process.env.urlPath = "/env/path/";
		process.env.isInit = "";
		
		process.argv.push("mode=production", "port=8080", "root=/arg/root", "urlPath=/arg/path/", "isInit=true");
		
		const options = createNewOptionsForTest();
		
		expect(options.mode).toBe("production");
		expect(options.port).toBe(8080);
		expect(options.root).toBe("/arg/root");
		expect(options.urlPath).toBe("/arg/path/");
		expect(options.isInit).toBe(true);
	});
	
	it("should append a trailing slash to urlPath if missing", () => {
		process.argv.push("urlPath=/no-trailing-slash");
		
		const options = createNewOptionsForTest();
		
		expect(options.urlPath).toBe("/no-trailing-slash/");
	});
});