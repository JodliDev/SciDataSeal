import {describe, it, vi, expect, afterAll} from "vitest";
import {renderPage} from "../../testRender.ts";
import {listEntriesWithPages} from "../../../../src/frontend/actions/listEntries.ts";
import ListDataLogs from "../../../../src/frontend/views/pages/ListDataLogs.tsx";
import {wait} from "../../../convenience.ts";
import getBlockchainSignatureUrl from "../../../../src/shared/actions/getBlockchainSignatureUrl.ts";
import floatingMenuCss from "../../../../src/frontend/actions/floatingMenu.module.css";
import css from "../../../../src/frontend/views/pages/ListDataLogs.module.css";

describe("ListDataLogs.tsx", async () => {
	vi.mock("../../../../src/frontend/actions/listEntries.ts", () => ({
		listEntriesWithPages: vi.fn(() => ({
			list: [
				{
					id: 2,
					label: 1780704000000,
					signatures: JSON.stringify(["sig1", "sig2", "sig3"]),
					blockchainType: "solana"
				},
				{
					id: 4,
					label: 1709519880000,
					signatures: JSON.stringify(["signature1"]),
					blockchainType: "solanaTest"
				}
			]
		}))
	}));
	vi.mock("../../../../src/frontend/actions/getData.ts", () => ({
		default: vi.fn()
	}));
	
	afterAll(() => {
		vi.restoreAllMocks();
	});
	
	it("should load correct list", async () => {
		const component = await renderPage(ListDataLogs, "?id=9");
		await wait(1);
		component.redraw();
		expect(listEntriesWithPages).toHaveBeenCalledWith("dataLogs", 0, "?questionnaireId=9");
	});
	
	it("should draw signature urls", async () => {
		const component = await renderPage(ListDataLogs, "?id=99");
		await wait(1);
		component.redraw();
		const lines = component.dom.querySelectorAll(".line");
		expect(lines.length).toBe(2);
		
		//dates:
		expect((lines[0].querySelector(`.${css.date}`) as HTMLElement).innerText).toBe((new Date(1780704000000)).toLocaleString());
		expect((lines[1].querySelector(`.${css.date}`) as HTMLElement).innerText).toBe((new Date(1709519880000)).toLocaleString());
		
		//single signature menu:
		const a = lines[1].querySelector(`.${css.url}`)!.firstChild as HTMLLinkElement;
		expect(a.href).toBe((getBlockchainSignatureUrl("solanaTest", "signature1")));
		
		//single multi signature menu:
		const div = lines[0].querySelector(`.${css.url}`)!.firstChild as HTMLDivElement;
		div.dispatchEvent(new Event("click"));
		
		const menuLinks = component.dom.querySelectorAll(`.${floatingMenuCss.openedMenu} a`);
		expect(menuLinks.length).toBe(3);
		expect((menuLinks[0] as HTMLLinkElement).href).toBe((getBlockchainSignatureUrl("solana", "sig1")));
		expect((menuLinks[1] as HTMLLinkElement).href).toBe((getBlockchainSignatureUrl("solana", "sig2")));
		expect((menuLinks[2] as HTMLLinkElement).href).toBe((getBlockchainSignatureUrl("solana", "sig3")));
	});
});