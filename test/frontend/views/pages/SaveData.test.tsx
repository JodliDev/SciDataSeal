import {describe, it, vi, expect, afterAll, afterEach} from "vitest";
import {renderPage} from "../../testRender.ts";
import SaveData from "../../../../src/frontend/views/pages/SaveData.tsx";
import {wait} from "../../../convenience.ts";
import postData from "../../../../src/frontend/actions/postData.ts";
import getData from "../../../../src/frontend/actions/getData.ts";
import {Lang} from "../../../../src/frontend/singleton/Lang.ts";

describe("SaveData", async () => {
	vi.mock("../../../../src/frontend/actions/getData.ts", () => ({
		default: vi.fn(() => ({
			questionnaireId: 8,
			questionnaireName: "testQuestionnaire",
			apiPassword: "testApiPassword",
			columns: '["column1","column2","column3"]'
		}))
	}));
	
	afterEach(() => {
		vi.clearAllMocks();
	});
	afterAll(() => {
		vi.restoreAllMocks();
	});
	
	it("should create one textarea per column", async () => {
		const component = await renderPage(SaveData);
		const forms = component.dom.querySelectorAll("form textarea");
		
		expect(forms.length).toBe(3);
		expect((forms[0] as HTMLTextAreaElement).name).toBe("column1");
		expect((forms[1] as HTMLTextAreaElement).name).toBe("column2");
		expect((forms[2] as HTMLTextAreaElement).name).toBe("column3");
	});
	
	it("should cancel sending when confirm was aborted", async () => {
		const confirmMock = vi.spyOn(window, "confirm").mockReturnValue(false);
		vi.mock("../../../../src/frontend/actions/postData.ts", () => ({
			default: vi.fn()
		}));
		const component = await renderPage(SaveData);
		const form = component.dom.querySelector("form")! as HTMLFormElement;
		
		//cancel sending
		form.dispatchEvent(new Event("submit"));
		await wait(1);
		component.redraw();
		expect(postData).not.toHaveBeenCalled();
		
		//confirm sending
		confirmMock.mockReturnValue(true);
		form.dispatchEvent(new Event("submit"));
		await wait(1);
		component.redraw();
		expect(postData).toHaveBeenCalled();
		
		//cleanup:
		vi.mocked(postData).mockRestore();
		confirmMock.mockRestore();
	});
	
	it("should show warning when questionnaire has no columns", async () => {
		vi.mocked(getData).mockResolvedValue({
			questionnaireId: 8,
			questionnaireName: "testQuestionnaire",
			apiPassword: "testApiPassword",
			columns: ""
		});
		const component = await renderPage(SaveData);
		
		expect(component.dom.innerText).toBe(Lang.get("warnNoColumns"));
		
		vi.mocked(getData).mockReset();
	});
});