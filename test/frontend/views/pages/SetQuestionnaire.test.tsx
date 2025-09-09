import {describe, it, vi, expect, afterAll, afterEach, beforeAll} from "vitest";
import {renderPage} from "../../testRender.ts";
import {wait} from "../../../convenience.ts";
import postData from "../../../../src/frontend/actions/postData.ts";
import {SiteTools} from "../../../../src/frontend/singleton/SiteTools.ts";
import cssButton from "../../../../src/frontend/views/structures/Btn.module.css";
import SetQuestionnaire from "../../../../src/frontend/views/pages/SetQuestionnaire.tsx";

describe("SetQuestionnaire", async () => {
	vi.mock("../../../../src/frontend/actions/postData.ts", () => ({
		default: vi.fn(() => ({
			questionnaireId: 123
		}))
	}));
	vi.mock("../../../../src/frontend/actions/listEntries.ts", () => ({
		default: vi.fn(() => [
			{
				id: 4,
				label: "blockchain"
			},
			{
				id: 5,
				label: "blockchain2"
			}
		])
	}));
	vi.mock("../../../../src/frontend/actions/getEntry.ts", () => ({
		default: vi.fn(() => ({
			questionnaireName:"questionnaire",
			blockchainAccountId: 4,
			blockchainDenotation: 4,
			apiPassword: "pass",
			dataKey: "key"
		}))
	}));
	vi.mock("../../../../src/frontend/actions/getData.ts", () => ({
		default: vi.fn(() => ({
			denotation: 10
		}))
	}));
	
	beforeAll(() => {
		SiteTools.init({}, () => {});
	});
	afterEach(() => {
		vi.clearAllMocks();
	});
	afterAll(() => {
		vi.restoreAllMocks();
	});
	
	describe("submit data", async () => {
		afterEach(() => {
			vi.clearAllMocks();
			SiteTools.init({}, () => {});
		});
		
		
		async function createAndSubmitForm(id?: number) {
			const component = await renderPage(SetQuestionnaire, id ? `id=${id}` : "");
			const form = component.dom.querySelector("form")! as HTMLFormElement;
			
			form.dispatchEvent(new Event("submit"));
			await wait(1);
			component.redraw();
			
			return component;
		}
		
		it("should switch page when data was sent successfully", async () => {
			let calledSwitchPage = false;
			SiteTools.init({}, (page, query) => {
				expect(page).toBe("Questionnaire");
				expect(query).toBe(`?id=123`);
				calledSwitchPage = true;
			});
			await createAndSubmitForm();
			
			expect(postData).toHaveBeenCalled();
			expect(calledSwitchPage).toBe(true);
		});
		
		it("should not switch page when same questionnaire was changed", async () => {
			let calledSwitchPage = false;
			SiteTools.init({}, () => {
				calledSwitchPage = true;
			});
			await createAndSubmitForm(123);
			
			expect(postData).toHaveBeenCalled();
			expect(calledSwitchPage).toBe(false);
		});
	});
	
	describe("delete data", () => {
		afterEach(() => {
			vi.clearAllMocks();
			SiteTools.init({}, () => {});
		});
		afterAll(() => {
			confirmMock.mockRestore();
		});
		
		const confirmMock = vi.spyOn(window, "confirm").mockReturnValue(true);
		
		async function createAndPressDelete(id: number) {
			const component = await renderPage(SetQuestionnaire, `id=${id}`);
			const element = component.dom.querySelector(`.${cssButton.Btn}.delete`)!
			element.dispatchEvent(new Event("click"));
			
			await wait(1);
			component.redraw();
			
			return component;
		}
		
		it("should switch page when data was deleted successfully", async () => {
			let calledSwitchPage = false;
			SiteTools.init({}, (page) => {
				expect(page).toBe("ListQuestionnaires");
				calledSwitchPage = true;
			});
			await createAndPressDelete(123);
			
			expect(calledSwitchPage).toBe(true);
		});
	});
	
	it("should show warning if denotation was changed and questionnaire id was provided", async () => {
		const component = await renderPage(SetQuestionnaire, "id=66");
		let input = component.dom.querySelector("input[name=blockchainDenotation]") as HTMLInputElement;
		let warnSymbol = input.parentNode?.querySelector(".warn");
		expect(warnSymbol).toBeNull();
		
		input.value = "99";
		input.dispatchEvent(new Event("change"))
		await wait(1);
		component.redraw();
		
		input = component.dom.querySelector("input[name=blockchainDenotation]") as HTMLInputElement;
		warnSymbol = input.parentNode?.querySelector(".warn");
		expect(warnSymbol).not.toBeNull();
	});
	
	it("should show no warning if denotation was changed and no questionnaire id was provided", async () => {
		const component = await renderPage(SetQuestionnaire);
		let input = component.dom.querySelector("input[name=blockchainDenotation]") as HTMLInputElement;
		
		input.value = "99";
		input.dispatchEvent(new Event("change"))
		await wait(1);
		component.redraw();
		
		input = component.dom.querySelector("input[name=blockchainDenotation]") as HTMLInputElement;
		const warnSymbol = input.parentNode?.querySelector(".warn");
		expect(warnSymbol).toBeNull();
	});
});