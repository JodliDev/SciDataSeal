import {describe, it, vi, expect, afterAll} from "vitest";
import {renderPage} from "../../testRender.ts";
import ListStudies from "../../../../src/frontend/views/pages/ListStudies.tsx";
import {listEntriesWithPages} from "../../../../src/frontend/actions/listEntries.ts";

describe("ListStudies.tsx", async () => {
	vi.mock("../../../../src/frontend/actions/listEntries.ts", () => ({
		listEntriesWithPages: vi.fn()
	}));
	
	afterAll(() => {
		vi.restoreAllMocks();
	});
	
	it("should load correct list", async () => {
		await renderPage(ListStudies);
		expect(listEntriesWithPages).toHaveBeenCalledWith("studies", 0, undefined);
	});
});