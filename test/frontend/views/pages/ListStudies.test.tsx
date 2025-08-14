import {describe, it, vi, expect, afterAll} from "vitest";
import {renderPage} from "../../testRender.ts";
import ListStudies from "../../../../src/frontend/views/pages/ListStudies.tsx";
import listData from "../../../../src/frontend/actions/listData.ts";

describe("ListStudies", async () => {
	vi.mock("../../../../src/frontend/actions/listData.ts", () => ({
		default: vi.fn()
	}));
	
	afterAll(() => {
		vi.resetAllMocks();
	});
	
	it("should load correct list", async () => {
		await renderPage(ListStudies);
		expect(listData).toHaveBeenCalledWith("studies", undefined);
	});
});