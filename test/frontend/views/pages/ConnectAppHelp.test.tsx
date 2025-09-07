import {describe, it, vi, expect, afterEach, afterAll} from "vitest";
import {renderPage} from "../../testRender.ts";
import {Lang} from "../../../../src/frontend/singleton/Lang.ts";
import ConnectAppHelp from "../../../../src/frontend/views/pages/ConnectAppHelp.tsx";
import cssTabBar from "../../../../src/frontend/views/structures/TabView.module.css";
import getEntry from "../../../../src/frontend/actions/getEntry.ts";
import {wait} from "../../../convenience.ts";
import css from "../../../../src/frontend/views/pages/ConnectAppHelp.module.css";

describe("ConnectAppHelp.tsx", async () => {
	vi.mock("../../../../src/frontend/actions/getEntry.ts", () => ({
		default: vi.fn((type) => {
			switch(type) {
				case "study":
					return {
						studyName: "test",
						studyApiPassword: "test"
					}
				case "questionnaire":
					return {
						questionnaireId: 6,
						apiPassword: "test"
					}
			}
		})
	}));
	vi.mock("../../../../src/frontend/actions/listEntries.ts", () => ({
		default: vi.fn(() => [
			{
				questionnaireId: 6,
				apiPassword: "test"
			},
			{
				questionnaireId: 16,
				apiPassword: "test2"
			},
			{
				questionnaireId: 26,
				apiPassword: "test3"
			}
		])
	}));
	
	afterEach(() => {
		vi.resetAllMocks();
	});
	afterAll(() => {
		vi.restoreAllMocks();
	});
	
	async function createPage(tab: number) {
		const component = await renderPage(ConnectAppHelp, "id=5");
		const tabs = component.dom.querySelectorAll(`.${cssTabBar.tab}`)!;
		tabs[tab].dispatchEvent(new Event("click"));
		
		component.redraw();
		return component;
	}
	
	it("should change post data when questionnaire changes", async () => {
		const tabs = [1, 2];
		
		for(const tab of tabs) {
			const component = await createPage(tab);
			let box = component.dom.querySelector(`.${css.postDataBox}`)! as HTMLElement;
			expect(box.innerText, `tab: ${tab}`).toContain('"id": 6');
			expect(box.innerText, `tab: ${tab}`).toContain('"pass": "test"');
			
			vi.mocked(getEntry).mockResolvedValue({
				questionnaireId: 16,
				apiPassword: "test2"
			} as any);
			
			const select = component.dom.querySelector("select")!;
			select.dispatchEvent(new Event("change"));
			await wait(1);
			component.redraw();
			
			box = component.dom.querySelector(`.${css.postDataBox}`)! as HTMLElement;
			expect(box.innerText, `tab: ${tab}`).toContain('"id": 16');
			expect(box.innerText, `tab: ${tab}`).toContain('"pass": "test2"');
			
			vi.mocked(getEntry).mockReset();
		}
	});
	
	it("should show error when study is not found", async () => {
		vi.mocked(getEntry).mockResolvedValue(undefined);
		const component = await renderPage(ConnectAppHelp, "id=5");
		expect(component.dom.innerText).toBe(Lang.get("notFound"));
		
	});
});