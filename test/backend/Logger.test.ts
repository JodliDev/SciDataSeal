import {afterAll, describe, expect, it, vi} from "vitest";
import {Logger} from "../../src/backend/Logger.ts";

describe("Logger", () => {
	const spyLog = vi.spyOn(console, "log")
		.mockImplementation(() => {});
	const spyDebug = vi.spyOn(console, "debug")
		.mockImplementation(() => {});
	const spyWarn = vi.spyOn(console, "warn")
		.mockImplementation(() => {});
	const spyError = vi.spyOn(console, "error")
		.mockImplementation(() => {});
	
	afterAll(() => {
		spyLog.mockRestore();
		spyDebug.mockRestore();
		spyWarn.mockRestore();
		spyError.mockRestore();
	});
	
	it("should call console.log when log is called", () => {
		Logger.log("Log message");
		expect(spyLog).toHaveBeenCalledWith("Log message");
	});
	
	it("should call console.log when debug is called", () => {
		Logger.debug("Debug message");
		expect(spyDebug).toHaveBeenCalledWith("Debug message");
	});
	
	it("should call console.warn when warn is called", () => {
		Logger.warn("Warn message");
		expect(spyWarn).toHaveBeenCalledWith("Warn message");
	});
	
	it("should call console.error when error is called", () => {
		Logger.error("Error message");
		expect(spyError).toHaveBeenCalledWith("Error message");
	});
});