import {describe, it, vi, expect, afterAll} from "vitest";
import {renderPage} from "../../testRender.ts";
import ListUsers from "../../../../src/frontend/views/pages/ListUsers.tsx";
import {listEntriesWithPages} from "../../../../src/frontend/actions/listEntries.ts";

describe("ListUsers.tsx", async () => {
	vi.mock("../../../../src/frontend/actions/listEntries.ts", () => ({
		listEntriesWithPages: vi.fn()
	}));
	
	afterAll(() => {
		vi.restoreAllMocks();
	});
	
	it("should load correct list", async () => {
		await renderPage(ListUsers);
		expect(listEntriesWithPages).toHaveBeenCalledWith("users", 0, undefined);
	});
});