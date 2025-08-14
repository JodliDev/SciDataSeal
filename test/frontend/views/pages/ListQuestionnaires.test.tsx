import {describe, it, vi, expect, afterAll} from "vitest";
import {renderPage} from "../../testRender.ts";
import ListQuestionnaires from "../../../../src/frontend/views/pages/ListQuestionnaires.tsx";
import listData from "../../../../src/frontend/actions/listData.ts";

describe("ListQuestionnaires", async () => {
	vi.mock("../../../../src/frontend/actions/listData.ts", () => ({
		default: vi.fn()
	}));
	vi.mock("../../../../src/frontend/actions/getData.ts", () => ({
		default: vi.fn()
	}));
	
	afterAll(() => {
		vi.resetAllMocks();
	});
	
	it("should load correct list", async () => {
		await renderPage(ListQuestionnaires, "?studyId=9");
		expect(listData).toHaveBeenCalledWith("questionnaires", "?studyId=9");
	});
});