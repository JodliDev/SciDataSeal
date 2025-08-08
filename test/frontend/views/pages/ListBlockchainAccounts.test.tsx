import {describe, it, vi, expect, afterEach} from "vitest";
import {renderPage} from "../../testRender.ts";
import ListBlockchainAccounts from "../../../../src/frontend/views/pages/ListBlockchainAccounts.tsx";

describe("ListBlockchainAccounts", async () => {
	vi.mock("../../../../src/frontend/actions/getData.ts", () => ({
		default: vi.fn(() => ({
			accounts: [
				{
					blockchainAccountId: 1,
					blockchainName: "test1",
				},
				{
					blockchainAccountId: 5,
					blockchainName: "test2",
				},
				{
					blockchainAccountId: 6,
					blockchainName: "test3",
				}
			],
		}))
	}));
	
	afterEach(() => {
		vi.resetAllMocks();
	});
	
	it("should display all loaded questionnaires", async () => {
		const component = await renderPage(ListBlockchainAccounts);
		
		const urls = component.dom.querySelectorAll(".bigButton");
		
		expect(urls.length).toBe(3);
		expect((urls[0] as HTMLLinkElement).innerText).toBe("test1");
		expect((urls[1] as HTMLLinkElement).innerText).toBe("test2");
		expect((urls[2] as HTMLLinkElement).innerText).toBe("test3");
	});
});