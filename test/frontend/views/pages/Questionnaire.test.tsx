import {describe, it, vi, expect, afterEach, afterAll} from "vitest";
import {renderPage} from "../../testRender.ts";
import Questionnaire from "../../../../src/frontend/views/pages/Questionnaire.tsx";
import getData from "../../../../src/frontend/actions/getData.ts";
import {Lang} from "../../../../src/frontend/singleton/Lang.ts";

describe("Questionnaire", async () => {
	vi.mock("../../../../src/frontend/actions/getData.ts", () => ({
		default: vi.fn(() => ({
			questionnaireName: "testQuestionnaire",
		}))
	}));
	
	afterEach(() => {
		vi.resetAllMocks();
	});
	afterAll(() => {
		vi.restoreAllMocks();
	});
	
	it("should load the correct questionnaire", async () => {
		const id = 1;
		await renderPage(Questionnaire, `id=${id}`);
		
		expect(getData).toHaveBeenCalledWith("/getEntry", `?type=questionnaire&id=${id}`);
	});
	
	it("should show message if questionnaire could not be loaded", async () => {
		vi.mocked(getData).mockResolvedValue(undefined);
		const component = await renderPage(Questionnaire);
		
		expect(component.dom.innerText).toBe(Lang.get("notFound"));
	});
});