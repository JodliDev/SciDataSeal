import {describe, it, vi, expect, afterAll} from "vitest";
import {renderPage} from "../../testRender.ts";
import ListQuestionnaires from "../../../../src/frontend/views/pages/ListQuestionnaires.tsx";
import listEntries from "../../../../src/frontend/actions/listEntries.ts";

describe("ListQuestionnaires", async () => {
	vi.mock("../../../../src/frontend/actions/listEntries.ts", () => ({
		default: vi.fn()
	}));
	vi.mock("../../../../src/frontend/actions/getData.ts", () => ({
		default: vi.fn()
	}));
	
	afterAll(() => {
		vi.restoreAllMocks();
	});
	
	it("should load correct list", async () => {
		await renderPage(ListQuestionnaires, "?studyId=9");
		expect(listEntries).toHaveBeenCalledWith("questionnaires", "?studyId=9");
	});
});