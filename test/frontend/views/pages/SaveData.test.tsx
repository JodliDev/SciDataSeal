import {describe, it, vi, expect, afterAll, afterEach} from "vitest";
import {renderPage} from "../../testRender.ts";
import SaveData from "../../../../src/frontend/views/pages/SaveData.tsx";

describe("SaveData", async () => {
	vi.mock("../../../../src/frontend/actions/getData.ts", () => ({
		default: vi.fn(() => ({
			questionnaireId: 8,
			questionnaireName: "testQuestionnaire",
			apiPassword: "testApiPassword",
			columns: '"column1","column2","column3"'
		}))
	}));
	
	afterEach(() => {
		vi.clearAllMocks();
	});
	afterAll(() => {
		vi.resetAllMocks();
	});
	
	it("should create one textarea per column", async () => {
		const component = await renderPage(SaveData);
		const forms = component.dom.querySelectorAll("form textarea");
		
		expect(forms.length).toBe(3);
		expect((forms[0] as HTMLTextAreaElement).name).toBe("column1");
		expect((forms[1] as HTMLTextAreaElement).name).toBe("column2");
		expect((forms[2] as HTMLTextAreaElement).name).toBe("column3");
	});
});