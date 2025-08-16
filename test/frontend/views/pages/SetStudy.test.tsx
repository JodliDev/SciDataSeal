import {describe, it, vi, expect, afterAll, afterEach, beforeAll, beforeEach} from "vitest";
import {renderPage} from "../../testRender.ts";
import {wait} from "../../../convenience.ts";
import postData from "../../../../src/frontend/actions/postData.ts";
import {Lang} from "../../../../src/frontend/singleton/Lang.ts";
import {SiteTools} from "../../../../src/frontend/singleton/SiteTools.ts";
import cssButton from "../../../../src/frontend/views/widgets/Btn.module.css";
import SetStudy from "../../../../src/frontend/views/pages/SetStudy.tsx";
import listEntries from "../../../../src/frontend/actions/listEntries.ts";

describe("SetStudy.tsx", async () => {
	vi.mock("../../../../src/frontend/actions/postData.ts", () => ({
		default: vi.fn(() => ({
			studyId: 123
		}))
	}));
	vi.mock("../../../../src/frontend/actions/getData.ts", () => ({
		default: vi.fn(() => ({
			generatedString: "qwe"
		}))
	}));
	vi.mock("../../../../src/frontend/actions/getEntry.ts", () => ({
		default: vi.fn(() => ({
			apiPassword: "pass",
			studyName: "Name",
			blockchainAccountId: 34
		}))
	}));
	vi.mock("../../../../src/frontend/actions/listEntries.ts", () => ({
		default: vi.fn(() => {
			return [
				{
					id: 4,
					label: "blockchain"
				},
				{
					id: 5,
					label: "blockchain2"
				}
			];
		})
	}));
	
	beforeAll(() => {
		SiteTools.init({}, () => {});
	});
	afterEach(() => {
		vi.resetAllMocks();
	});
	afterAll(() => {
		vi.restoreAllMocks();
	});
	
	it("Should show error when no blockchain accounts exist", async () => {
		vi.mocked(listEntries).mockResolvedValue([]);

		const component = await renderPage(SetStudy);

		expect(component.dom.innerText).toContain(Lang.get("errorNoBlockchainAccounts"));
	});
	
	describe("submit data", async () => {
		afterEach(() => {
			vi.restoreAllMocks();
			SiteTools.init({}, () => {});
		});


		async function createAndSubmitForm(id?: number) {
			const component = await renderPage(SetStudy, id ? `id=${id}` : "");
			const form = component.dom.querySelector("form")! as HTMLFormElement;

			form.dispatchEvent(new Event("submit"));
			await wait(1);
			component.redraw();

			return component;
		}

		it("should switch page when data was sent successfully", async () => {
			let calledSwitchPage = false;
			SiteTools.init({}, (page, query) => {
				expect(page).toBe("Study");
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
		beforeEach(() => {
			vi.spyOn(window, "confirm").mockReturnValue(true);
			
		});
		afterEach(() => {
			vi.restoreAllMocks();
		});
		afterAll(() => {
			SiteTools.init({}, () => {});
		});
		
		
		async function createAndPressDelete(id: number) {
			const component = await renderPage(SetStudy, `id=${id}`);
			const element = component.dom.querySelector(`.${cssButton.Btn}.delete`)!
			element.dispatchEvent(new Event("click"));
			
			await wait(1);
			component.redraw();
			
			return component;
		}
		
		it("should switch page when data was deleted successfully", async () => {
			let calledSwitchPage = false;
			SiteTools.init({}, (page) => {
				expect(page).toBe("ListStudies");
				calledSwitchPage = true;
			});
			await createAndPressDelete(123);
			
			expect(calledSwitchPage).toBe(true);
		});
	});
});