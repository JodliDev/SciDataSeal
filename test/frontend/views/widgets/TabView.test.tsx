import {describe, it, vi, expect} from "vitest";
import {renderComponent} from "../../testRender.ts";
import TabView from "../../../../src/frontend/views/widgets/TabView.tsx";
import css from "../../../../src/frontend/views/widgets/TabView.module.css";

describe("TabView", () => {
	
	it("should throw if not enough tabs are provided", () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		
		renderComponent(TabView, {tabs: []})
		
		expect(console.error).toHaveBeenCalledWith("TabView needs at least one tab");
	});
	
	it("should show correct tabs", () => {
		const component = renderComponent(TabView, {
			tabs: [
				{
					label: "Tab 1",
					view: () => "Tab Content 1",
				},
				{
					label: "Tab 2",
					view: () => "Tab Content 2",
				}
			]
		});
		
		const tabs = component.dom.querySelectorAll(`.${css.tab}`)!;
		expect((tabs[0] as HTMLElement).innerText).toBe("Tab 1");
		expect((tabs[1] as HTMLElement).innerText).toBe("Tab 2");
		
	});
	
	it("should switch tab when clicked", () => {
		const component = renderComponent(TabView, {
			tabs: [
				{
					label: "Tab 1",
					view: () => "Tab Content 1",
				},
				{
					label: "Tab 1",
					view: () => "Tab Content 2",
				}
			]
		});
		
		const content = component.dom.querySelector(`.${css.tabContent}`)!;
		const tabs = component.dom.querySelectorAll(`.${css.tab}`)!;
		expect(tabs[0].classList.contains(css.current)).toBeTruthy();
		expect(tabs[1].classList.contains(css.current)).toBeFalsy();
		expect((content as HTMLElement).innerText).toBe("Tab Content 1");
		
		tabs[1].dispatchEvent(new Event("click"));
		component.redraw();
		
		expect(tabs[0].classList.contains(css.current)).toBeFalsy();
		expect(tabs[1].classList.contains(css.current)).toBeTruthy();
		expect((content as HTMLElement).innerText).toBe("Tab Content 2");
		
	});
});