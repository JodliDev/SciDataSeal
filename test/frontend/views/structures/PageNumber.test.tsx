import {describe, it, vi, expect} from "vitest";
import {renderComponent} from "../../testRender.ts";
import PageNumbers from "../../../../src/frontend/views/structures/PageNumbers.tsx";
import {PAGE_SIZE} from "../../../../src/shared/definitions/Constants.ts";
import {wait} from "../../../convenience.ts";

describe("PageNumbers", () => {
	it("should call loadPage on init", () => {
		const loadPage = vi.fn();
		renderComponent(PageNumbers, {loadPage: loadPage});
		
		expect(loadPage).toHaveBeenCalled();
	});
	
	it("should not be visible if totalPage is too small", async () => {
		//should be visible
		let component = renderComponent(PageNumbers, {loadPage: () => Promise.resolve(PAGE_SIZE - 1)});
		await wait(1);
		component.redraw();
		expect(component.dom.innerHTML).toBe("");
		
		//should not be visible
		component = renderComponent(PageNumbers, {loadPage: () => Promise.resolve(PAGE_SIZE)});
		await wait(1);
		component.redraw();
		expect(component.dom.innerHTML).not.toBe("");
	});
	
	it("should show next button if needed", async () => {
		//should not be shown
		let component = renderComponent(PageNumbers, {loadPage: () => Promise.resolve(PAGE_SIZE - 1)});
		await wait(1);
		component.redraw();
		expect(component.dom.querySelector(".next")).toBeNull();
		
		//should be shown
		component = renderComponent(PageNumbers, {loadPage: () => Promise.resolve(PAGE_SIZE)});
		await wait(1);
		component.redraw();
		expect(component.dom.querySelector(".next")).not.toBeNull();
	});
	
	it("should show next button if needed", async () => {
		//should not be shown
		let component = renderComponent(PageNumbers, {loadPage: () => Promise.resolve(PAGE_SIZE * 2 - 1)});
		await wait(1);
		component.redraw();
		expect(component.dom.querySelector(".toEnd")).toBeNull();
		
		//should be shown
		component = renderComponent(PageNumbers, {loadPage: () => Promise.resolve(PAGE_SIZE * 2)});
		await wait(1);
		component.redraw();
		expect(component.dom.querySelector(".toEnd")).not.toBeNull();
	});
	
	it("should change page on press next or prev", async () => {
		let component = renderComponent(PageNumbers, {loadPage: () => Promise.resolve(PAGE_SIZE * 5)});
		await wait(1);
		component.redraw();
		expect(component.dom.innerText.replace(/\s/g, "")).toBe("1/6");
		
		component.dom.querySelector(".next")!.dispatchEvent(new Event("click"));
		await wait(1);
		component.redraw();
		expect(component.dom.innerText.replace(/\s/g, "")).toBe("2/6");
		
		component.dom.querySelector(".next")!.dispatchEvent(new Event("click"));
		await wait(1);
		component.redraw();
		expect(component.dom.innerText.replace(/\s/g, "")).toBe("3/6");
		
		component.dom.querySelector(".prev")!.dispatchEvent(new Event("click"));
		await wait(1);
		component.redraw();
		expect(component.dom.innerText.replace(/\s/g, "")).toBe("2/6");
	});
	
	it("should change page on press toEnd or toStart", async () => {
		let component = renderComponent(PageNumbers, {loadPage: () => Promise.resolve(PAGE_SIZE * 15)});
		await wait(1);
		component.redraw();
		expect(component.dom.innerText.replace(/\s/g, "")).toBe("1/16");
		
		component.dom.querySelector(".toEnd")!.dispatchEvent(new Event("click"));
		await wait(1);
		component.redraw();
		expect(component.dom.innerText.replace(/\s/g, "")).toBe("16/16");
		
		component.dom.querySelector(".toStart")!.dispatchEvent(new Event("click"));
		await wait(1);
		component.redraw();
		expect(component.dom.innerText.replace(/\s/g, "")).toBe("1/16");
	});
});