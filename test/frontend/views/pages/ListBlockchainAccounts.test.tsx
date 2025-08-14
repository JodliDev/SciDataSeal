import {describe, it, vi, expect, afterAll} from "vitest";
import {renderPage} from "../../testRender.ts";
import ListBlockchainAccounts from "../../../../src/frontend/views/pages/ListBlockchainAccounts.tsx";
import listData from "../../../../src/frontend/actions/listData.ts";

describe("ListBlockchainAccounts", async () => {
	vi.mock("../../../../src/frontend/actions/listData.ts", () => ({
		default: vi.fn()
	}));
	
	afterAll(() => {
		vi.resetAllMocks();
	});
	
	it("should load correct list", async () => {
		await renderPage(ListBlockchainAccounts);
		expect(listData).toHaveBeenCalledWith("blockchainAccounts", undefined);
	});
});