import {describe, it, vi, expect, afterAll} from "vitest";
import {renderPage} from "../../testRender.ts";
import ListBlockchainAccounts from "../../../../src/frontend/views/pages/ListBlockchainAccounts.tsx";
import {listEntriesWithPages} from "../../../../src/frontend/actions/listEntries.ts";

describe("ListBlockchainAccounts.tsx", async () => {
	vi.mock("../../../../src/frontend/actions/listEntries.ts", () => ({
		listEntriesWithPages: vi.fn()
	}));
	
	afterAll(() => {
		vi.restoreAllMocks();
	});
	
	it("should load correct list", async () => {
		await renderPage(ListBlockchainAccounts);
		expect(listEntriesWithPages).toHaveBeenCalledWith("blockchainAccounts", 0, undefined);
	});
});