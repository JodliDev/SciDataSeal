import {describe, it, vi, expect, afterAll} from "vitest";
import {renderComponent} from "../../testRender.ts";
import ListEntries, {buttonEntry} from "../../../../src/frontend/views/structures/ListEntries.tsx";
import {wait} from "../../../convenience.ts";
import {ListDefinitions} from "../../../../src/shared/data/ListEntriesInterface.ts";
import {listEntriesWithPages} from "../../../../src/frontend/actions/listEntries.ts";

describe("ListEntries", () => {
	vi.mock("../../../../src/frontend/actions/listEntries.ts", () => ({
		listEntriesWithPages: vi.fn(() => ({
			list: [
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
			],
			totalCount: 55
		}))
	}));
	
	afterAll(() => {
		vi.restoreAllMocks();
	});
	
	const options = {
		query: {
			type: "users" as keyof ListDefinitions,
		},
		drawEntry: buttonEntry("Test"),
		direction: "horizontal" as const,
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
			query: {
				type: "users" as keyof ListDefinitions,
				test: "testData"
			},
			direction: "table" as const,
			drawEntry: buttonEntry("Test"),
			addTarget: "test",
			addLabel: "test",
			target: "test"
		};
		const component = renderComponent(ListEntries, options);
		await wait(1);
		component.redraw();
		
		expect(listEntriesWithPages).toHaveBeenCalled();
		vi.mocked(listEntriesWithPages).mockClear();
		
		//no change
		component.redraw();
		expect(listEntriesWithPages).not.toHaveBeenCalled();
		
		//query changed
		options.query = {
			type: "studies" as keyof ListDefinitions,
			test: "testData"
		};
		component.redraw();
		expect(listEntriesWithPages).toHaveBeenCalled();
		vi.mocked(listEntriesWithPages).mockClear();
		await wait(1);
		component.redraw();
		
		//no change
		component.redraw();
		expect(listEntriesWithPages).not.toHaveBeenCalled();
	});
});