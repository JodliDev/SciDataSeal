import {describe, it, vi, expect, afterAll} from "vitest";
import {renderPage} from "../../testRender.ts";
import ListBlockchainAccounts from "../../../../src/frontend/views/pages/ListBlockchainAccounts.tsx";
import listEntries from "../../../../src/frontend/actions/listEntries.ts";

describe("ListBlockchainAccounts", async () => {
	vi.mock("../../../../src/frontend/actions/listEntries.ts", () => ({
		default: vi.fn()
	}));
	
	afterAll(() => {
		vi.restoreAllMocks();
	});
	
	it("should load correct list", async () => {
		await renderPage(ListBlockchainAccounts);
		expect(listEntries).toHaveBeenCalledWith("blockchainAccounts", undefined);
	});
});