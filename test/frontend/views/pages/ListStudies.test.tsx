import {describe, it, vi, expect, afterAll} from "vitest";
import {renderPage} from "../../testRender.ts";
import ListStudies from "../../../../src/frontend/views/pages/ListStudies.tsx";
import listEntries from "../../../../src/frontend/actions/listEntries.ts";

describe("ListStudies", async () => {
	vi.mock("../../../../src/frontend/actions/listEntries.ts", () => ({
		default: vi.fn()
	}));
	
	afterAll(() => {
		vi.resetAllMocks();
	});
	
	it("should load correct list", async () => {
		await renderPage(ListStudies);
		expect(listEntries).toHaveBeenCalledWith("studies", undefined);
	});
});