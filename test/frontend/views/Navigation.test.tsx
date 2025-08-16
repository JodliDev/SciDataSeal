import {describe, expect, it} from "vitest";
import {renderComponent} from "../testRender.ts";
import Navigation from "../../../src/frontend/views/Navigation.tsx";
import css from "../../../src/frontend/views/Navigation.module.css";

describe("Navigation", () => {
	
	it("should contain the correct links", async () => {
		const component = renderComponent(Navigation, {entries: [
			{
				label: "Label1",
				page: "Page1"
			},
			{
				label: "Label2",
				page: "Page2",
				query: "?test=test"
			},
			{
				label: "Label3",
				page: "Page3"
			}
		]});
		
		const urls = component.dom.querySelectorAll(`.${css.entry}`);
		expect(urls.length).toBe(3);
		
		expect((urls[0] as HTMLLinkElement).innerText).toBe("Label1");
		expect((urls[1] as HTMLLinkElement).innerText).toBe("Label2");
		expect((urls[2] as HTMLLinkElement).innerText).toBe("Label3");
		
		expect((urls[0] as HTMLLinkElement).href).toBe("http://localhost:3000/Page1");
		expect((urls[1] as HTMLLinkElement).href).toBe("http://localhost:3000/Page2?test=test");
		expect((urls[2] as HTMLLinkElement).href).toBe("http://localhost:3000/Page3");
	});
});