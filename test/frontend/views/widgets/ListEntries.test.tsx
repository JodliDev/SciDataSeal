import {describe, it, vi, expect, afterAll} from "vitest";
import {renderComponent} from "../../testRender.ts";
import ListEntries from "../../../../src/frontend/views/widgets/ListEntries.tsx";
import {wait} from "../../../convenience.ts";
import {ListDefinitions} from "../../../../src/shared/data/ListEntriesInterface.ts";
import listEntries from "../../../../src/frontend/actions/listEntries.ts";

describe("ListEntries", () => {
	vi.mock("../../../../src/frontend/actions/listEntries.ts", () => ({
		default: vi.fn(() => [
			{
				id: 1,
				label: "test1",
			},
			{
				id: 5,
				label: "test2",
			},
			{
				id: 6,
				label: "test3",
			}
		])
	}));
	
	afterAll(() => {
		vi.resetAllMocks();
	});
	
	const options = {
		type: "users" as keyof ListDefinitions,
		addQuery: undefined,
		addTarget: "test",
		addLabel: "test",
		target: "test"
	};
	
	it("should show one button per array entry", async () => {
		const component = renderComponent(ListEntries, options);
		await wait(1);
		component.redraw();
		
		const urls = component.dom.querySelectorAll(".bigButton");
		
		expect(urls.length).toBe(3);
		expect((urls[0] as HTMLLinkElement).innerText).toBe("test1");
		expect((urls[1] as HTMLLinkElement).innerText).toBe("test2");
		expect((urls[2] as HTMLLinkElement).innerText).toBe("test3");
	});
	
	it("should reload when list data changes", async () => {
		const options = {
			type: "users" as keyof ListDefinitions,
			query: "?test" as `?${string}`,
			addTarget: "test",
			addLabel: "test",
			target: "test"
		};
		const component = renderComponent(ListEntries, options);
		await wait(1);
		component.redraw();
		
		expect(listEntries).toHaveBeenCalled();
		vi.mocked(listEntries).mockClear();
		
		//no change
		component.redraw();
		expect(listEntries).not.toHaveBeenCalled();
		
		//type changed
		options.type = "studies";
		component.redraw();
		expect(listEntries).toHaveBeenCalled();
		vi.mocked(listEntries).mockClear();
		await wait(1);
		component.redraw();
		
		//no change
		component.redraw();
		expect(listEntries).not.toHaveBeenCalled();
		
		//query changed
		options.query = "?test2";
		component.redraw();
		expect(listEntries).toHaveBeenCalled();
	});
});