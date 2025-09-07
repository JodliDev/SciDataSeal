import {describe, it, vi, expect, afterEach, beforeAll} from "vitest";
import A from "../../../../src/frontend/views/structures/A.tsx";
import {SiteTools} from "../../../../src/frontend/singleton/SiteTools.ts";
import {renderComponent} from "../../testRender.ts";

describe("A", () => {
	const component = renderComponent(A, {page: "Test", query: "?key=value"});
	
	beforeAll(() => {
		SiteTools.init({}, () => {});
	});
	afterEach(() => {
		SiteTools.init({}, () => {});
	});
	
	it("should call switchPage with correct values when clicked", () => {
		let calledSwitchPage = false;
		SiteTools.init({}, (page, query) => {
			expect(page).toBe("Test");
			expect(query).toBe("?key=value");
			calledSwitchPage = true;
		});
		
		const element = component.dom.querySelector("a")!;
		element.dispatchEvent(new Event("click"));
		
		expect(calledSwitchPage, "switchPage was called").toBe(true);
	});

	it("should call prevent default when clicked", () => {
		const element = component.dom.querySelector("a")!;
		const event = new Event("click");
		Object.defineProperty(event, "preventDefault", {value: vi.fn(), writable: false});
		element.dispatchEvent(event);
		
		expect(event.preventDefault).toHaveBeenCalledOnce();
	});
});