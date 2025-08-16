import {describe, it, vi, expect, afterAll, afterEach} from "vitest";
import {renderPage} from "../../testRender.ts";
import SetColumns from "../../../../src/frontend/views/pages/SetColumns.tsx";
import cssButton from "../../../../src/frontend/views/widgets/Btn.module.css";
import {wait} from "../../../convenience.ts";
import postData from "../../../../src/frontend/actions/postData.ts";

describe("SetColumns", async () => {
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
		vi.restoreAllMocks();
	});
	
	it("should create one input per column", async () => {
		const component = await renderPage(SetColumns);
		const forms = component.dom.querySelectorAll("form input[name='columns[]']");
		
		expect(forms.length).toBe(3);
		expect((forms[0] as HTMLInputElement).value).toBe("column1");
		expect((forms[1] as HTMLInputElement).value).toBe("column2");
		expect((forms[2] as HTMLInputElement).value).toBe("column3");
	});
	
	it("should add a column when pressing add btn", async () => {
		const component = await renderPage(SetColumns);
		
		expect(component.dom.querySelectorAll("form input[name='columns[]']").length).toBe(3);
		
		const btn = component.dom.querySelector(`.${cssButton.Btn}.add`)!;
		btn.dispatchEvent(new Event("click"));
		component.redraw();
		
		expect(component.dom.querySelectorAll("form input[name='columns[]']").length).toBe(4);
	});
	
	it("should remove a column when pressing remove btn", async () => {
		const component = await renderPage(SetColumns);
		
		let btn = component.dom.querySelectorAll(`.${cssButton.Btn}.remove`)!;
		btn[1].dispatchEvent(new Event("click"));
		component.redraw();
		let forms = component.dom.querySelectorAll("form input[name='columns[]']");
		expect(forms.length).toBe(2);
		expect((forms[0] as HTMLInputElement).value).toBe("column1");
		expect((forms[1] as HTMLInputElement).value).toBe("column3");
		
		
		btn = component.dom.querySelectorAll(`.${cssButton.Btn}.remove`)!;
		btn[1].dispatchEvent(new Event("click"));
		component.redraw();
		forms = component.dom.querySelectorAll("form input[name='columns[]']");
		expect(forms.length).toBe(1);
		expect((forms[0] as HTMLInputElement).value).toBe("column1");
		
		
		btn = component.dom.querySelectorAll(`.${cssButton.Btn}.remove`)!;
		btn[0].dispatchEvent(new Event("click"));
		component.redraw();
		forms = component.dom.querySelectorAll("form input[name='columns[]']");
		expect(forms.length).toBe(0);
	});
	
	it("should cancel sending when confirm was aborted", async () => {
		const confirmMock = vi.spyOn(window, "confirm").mockReturnValue(false);
		vi.mock("../../../../src/frontend/actions/postData.ts", () => ({
			default: vi.fn()
		}));
		const component = await renderPage(SetColumns);
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
});