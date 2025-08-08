import {describe, expect, it, vi} from "vitest";
import bindValueToInput, {bindPropertyToInput} from "../../../src/frontend/actions/bindValueToInput.ts";

describe("bindValueToInput", () => {
	it("should bind a string input's value and call the setter", () => {
		const mockSet = vi.fn();
		const binding = bindValueToInput("initialValue", mockSet);
		
		expect(binding.value).toBe("initialValue");
		
		const event = {
			target: {value: "newValue"},
		} as unknown as InputEvent;
		
		binding.onchange(event);
		expect(mockSet).toHaveBeenCalledWith("newValue");
	});
	
	it("should bind a number input's value and convert it to a number", () => {
		const mockSet = vi.fn();
		const binding = bindValueToInput(10, mockSet);
		
		expect(binding.value).toBe(10);
		
		const event = {
			target: {value: "42"},
		} as unknown as InputEvent;
		
		binding.onchange(event);
		expect(mockSet).toHaveBeenCalledWith(42);
	});
	
	it("should bind a boolean input's checked attribute and call the setter", () => {
		const mockSet = vi.fn();
		const binding = bindValueToInput(true, mockSet);
		
		expect(binding.checked).toBe(true);
		
		const event = {
			target: {checked: false},
		} as unknown as InputEvent;
		
		binding.onchange(event);
		expect(mockSet).toHaveBeenCalledWith(false);
	});
	
	it("should call the setter on onkeyup for a string input", () => {
		const mockSet = vi.fn();
		const binding = bindValueToInput("test", mockSet);
		
		expect(binding.value).toBe("test");
		
		const event = {
			target: {value: "typing"},
		} as unknown as InputEvent;
		
		binding.onkeyup(event);
		expect(mockSet).toHaveBeenCalledWith("typing");
	});
	
	it("should call the setter on onkeyup for a number input", () => {
		const mockSet = vi.fn();
		const binding = bindValueToInput(50, mockSet);
		
		expect(binding.value).toBe(50);
		
		const event = {
			target: {value: "100"},
		} as unknown as InputEvent;
		
		binding.onkeyup(event);
		expect(mockSet).toHaveBeenCalledWith(100);
	});
	
	it("should call the setter on onkeyup for a boolean input", () => {
		const mockSet = vi.fn();
		const binding = bindValueToInput(false, mockSet);
		
		expect(binding.checked).toBe(false);
		
		const event = {
			target: {checked: true},
		} as unknown as InputEvent;
		
		binding.onkeyup(event);
		expect(mockSet).toHaveBeenCalledWith(true);
	});
});

describe("bindPropertyToInput", () => {
	it("should bind a string property to input", () => {
		const obj = {key: "initialValue"};
		const binding = bindPropertyToInput(obj, "key");
		
		expect(binding.value).toBe("initialValue");
		
		const event = {
			target: {value: "newValue"},
		} as unknown as InputEvent;
		
		binding.onchange(event);
		expect(obj.key).toBe("newValue");
	});
	
	it("should bind a number property to input", () => {
		const obj = {key: 10};
		const binding = bindPropertyToInput(obj, "key");
		
		expect(binding.value).toBe(10);
		
		const event = {
			target: {value: "42"},
		} as unknown as InputEvent;
		
		binding.onchange(event);
		expect(obj.key).toBe(42);
	});
	
	it("should bind a boolean property to input", () => {
		const obj = {key: true};
		const binding = bindPropertyToInput(obj, "key");
		
		expect(binding.checked).toBe(true);
		
		const event = {
			target: {checked: false},
		} as unknown as InputEvent;
		
		binding.onchange(event);
		expect(obj.key).toBe(false);
	});
});