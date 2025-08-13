import {describe, it, vi, expect, afterAll, afterEach} from "vitest";
import {RenderModel, renderPage} from "../../testRender.ts";
import ViewQuestionnaireData from "../../../../src/frontend/views/pages/ViewQuestionnaireData.tsx";
import createDataBlob from "../../../../src/frontend/actions/createDataBlob.ts";
import {wait} from "../../../convenience.ts";
import postData from "../../../../src/frontend/actions/postData.ts";
import css from "../../../../src/frontend/views/pages/ViewQuestionnaireData.module.css";
import cssFeedbackIcon from "../../../../src/frontend/views/widgets/FeedbackIcon.module.css";
import {closeAllMenus} from "../../../../src/frontend/actions/FloatingMenu.ts";
import {Lang} from "../../../../src/frontend/singleton/Lang.ts";
import getData from "../../../../src/frontend/actions/getData.ts";

describe("ViewQuestionnaireData", async () => {
	vi.mock("../../../../src/frontend/actions/postData.ts", () => ({
		default: vi.fn(() => ({
			csv: "postDataAnswer"
		}))
	}));
	vi.mock("../../../../src/frontend/actions/getData.ts", () => ({
		default: vi.fn(() => ({
			questionnaires: []
		}))
	}));
	vi.mock("../../../../src/frontend/actions/createDataBlob.ts", () => ({
		default: vi.fn(() => "dataUrl")
	}));
	vi.mock("../../../../src/frontend/actions/generateHash.ts", () => ({
		default: vi.fn(() => "hash")
	}));
	
	afterEach(() => {
		vi.clearAllMocks();
	});
	afterAll(() => {
		vi.resetAllMocks();
	});
	
	async function createAndSubmitForm() {
		const component = await renderPage(ViewQuestionnaireData);
		const form = component.dom.querySelector("form")!;
		form.dispatchEvent(new Event("submit"));
		await wait(1);
		component.redraw();
		
		return component;
	}
	
	it("should show form by default", async () => {
		const component = await renderPage(ViewQuestionnaireData);
		
		expect(component.dom.querySelector("form")).not.toBeNull();
	});
	
	describe("Auto fill questionnaire", async () => {
		afterEach(() => {
			vi.resetAllMocks();
		});
		
		async function loadQuestionnaire(component: RenderModel) {
			const questionnaires = component.dom.querySelectorAll(`.${css.preselectBox} .inputLike .horizontal span`);
			const element = questionnaires.values().find(q => (q as HTMLElement).innerText == "testQuestionnaire")!;
			element.dispatchEvent(new Event("click"));
			
			await wait(1);
			component.redraw();
		}
		
		it("should fill form with questionnaire data and show success", async () => {
			vi.mocked(getData).mockImplementation(async (endpoint) => {
				if(endpoint == "/getQuestionnaire") {
					return {
						apiPassword: "mockPassword",
						blockchainDenotation: 5
					};
				}
				else if(endpoint == "/getBlockchainAccount") {
					return {
						publicKey: "mockPublicKey",
						blockchainType: "solana"
					};
				}
				else if(endpoint == "/listQuestionnaires") {
					return {questionnaires: [{questionnaireName: "testQuestionnaire"}]};
				}
				return undefined;
			})
			
			const component = await renderPage(ViewQuestionnaireData);
			await loadQuestionnaire(component);
			
			const publicKeyEl = component.dom.querySelector("*[name=publicKey]")! as HTMLTextAreaElement;
			expect(publicKeyEl.value).toBe("mockPublicKey");
			
			const dataKeyEl = component.dom.querySelector("*[name=dataKey]")! as HTMLTextAreaElement;
			expect(dataKeyEl.value).toBe("mockPassword");
			
			const blockchainTypeEl = component.dom.querySelector("*[name=blockchainType]")! as HTMLSelectElement;
			expect(blockchainTypeEl.value).toBe("solana");
			
			const denotationEl = component.dom.querySelector("*[name=denotation]")! as HTMLInputElement;
			expect(denotationEl.value).toBe("5");
			
			expect(component.dom.querySelector(`.${cssFeedbackIcon.success}`)).not.toBeNull();
		});
		
		it("should not fill form and show failed if no questionnaire can not be loaded", async () => {
			vi.mocked(getData).mockImplementation(async (endpoint) => {
				if(endpoint == "/getQuestionnaire") {
					return undefined;
				}
				else if(endpoint == "/getBlockchainAccount") {
					return {
						publicKey: "mockPublicKey",
						blockchainType: "solana"
					};
				}
				else if(endpoint == "/listQuestionnaires") {
					return {questionnaires: [{questionnaireName: "testQuestionnaire"}]};
				}
				return undefined;
			})
			
			const component = await renderPage(ViewQuestionnaireData);
			await loadQuestionnaire(component);
			
			const publicKeyEl = component.dom.querySelector("*[name=publicKey]")! as HTMLTextAreaElement;
			expect(publicKeyEl.value).toBe("");
			
			const dataKeyEl = component.dom.querySelector("*[name=dataKey]")! as HTMLTextAreaElement;
			expect(dataKeyEl.value).toBe("");
			
			const blockchainTypeEl = component.dom.querySelector("*[name=blockchainType]")! as HTMLSelectElement;
			expect(blockchainTypeEl.value).toBe("");
			
			const denotationEl = component.dom.querySelector("*[name=denotation]")! as HTMLInputElement;
			expect(denotationEl.value).toBe("1");
			
			expect(component.dom.querySelector(`.${cssFeedbackIcon.failed}`)).not.toBeNull();
		});
		
		it("should not fill form and show failed if no blockchain account can not be loaded", async () => {
			vi.mocked(getData).mockImplementation(async (endpoint) => {
				if(endpoint == "/getQuestionnaire") {
					return {
						apiPassword: "mockPassword",
						blockchainDenotation: 5
					};
				}
				else if(endpoint == "/getBlockchainAccount") {
					return undefined;
				}
				else if(endpoint == "/listQuestionnaires") {
					return {questionnaires: [{questionnaireName: "testQuestionnaire"}]};
				}
				return undefined;
			})
			
			const component = await renderPage(ViewQuestionnaireData);
			await loadQuestionnaire(component);
			
			const publicKeyEl = component.dom.querySelector("*[name=publicKey]")! as HTMLTextAreaElement;
			expect(publicKeyEl.value).toBe("");
			
			const dataKeyEl = component.dom.querySelector("*[name=dataKey]")! as HTMLTextAreaElement;
			expect(dataKeyEl.value).toBe("");
			
			const blockchainTypeEl = component.dom.querySelector("*[name=blockchainType]")! as HTMLSelectElement;
			expect(blockchainTypeEl.value).toBe("");
			
			const denotationEl = component.dom.querySelector("*[name=denotation]")! as HTMLInputElement;
			expect(denotationEl.value).toBe("1");
			
			expect(component.dom.querySelector(`.${cssFeedbackIcon.failed}`)).not.toBeNull();
		});
	})
	
	describe("Load data", () => {
		afterEach(() => {
			vi.clearAllMocks();
		});
		
		it("should cache data and create link to data after form was sent", async () => {
			const mockSetItem = vi.spyOn(localStorage, "setItem");
			const component = await createAndSubmitForm();
			
			expect(postData).toHaveBeenCalled();
			expect(createDataBlob).toHaveBeenCalledWith("postDataAnswer");
			expect(mockSetItem).toHaveBeenCalledWith("hash-time", expect.any(String));
			expect(mockSetItem).toHaveBeenCalledWith("hash", "postDataAnswer");
			
			expect(component.dom.querySelector("a[href=dataUrl]")).not.toBeNull();
			
			mockSetItem.mockReset();
		});
		
		it("should load data from cache if it exists", async () => {
			const mockGetItem = vi.spyOn(localStorage, "getItem")
				.mockImplementation(key => {
					if(key == "hash")
						return "cachedAnswer";
					else if(key == "hash-time")
						return "123";
					return null;
				});
			await createAndSubmitForm();
			
			expect(postData).not.toHaveBeenCalled();
			expect(createDataBlob).toHaveBeenCalledWith("cachedAnswer");
			
			mockGetItem.mockReset();
		});
		
		it("should load data if cache time is faulty", async () => {
			const mockGetItem = vi.spyOn(localStorage, "getItem")
				.mockImplementation(key => {
					if(key == "hash")
						return "cachedAnswer";
					else if(key == "hash-time")
						return "faultyNumber"
					return null;
				});
			await createAndSubmitForm();
			
			expect(postData).toHaveBeenCalled();
			expect(createDataBlob).toHaveBeenCalledWith("postDataAnswer");
			
			mockGetItem.mockReset();
		});
		
		it("should load data when clicking reload", async () => {
			const mockGetItem = vi.spyOn(localStorage, "getItem")
				.mockImplementation(key => {
					if(key == "hash")
						return "cachedAnswer";
					else if(key == "hash-time")
						return "123";
					return null;
				});
			const component = await createAndSubmitForm();
			
			
			expect(postData).not.toHaveBeenCalled();
			expect(createDataBlob).toHaveBeenCalledWith("cachedAnswer");
			
			const btn = component.dom.querySelector(".reloadBtn")!;
			btn.dispatchEvent(new Event("click"));
			await wait(1);
			
			expect(postData).toHaveBeenCalled();
			expect(createDataBlob).toHaveBeenCalledWith("postDataAnswer");
			
			mockGetItem.mockReset();
		});
		
		it("should show success after successfully reload", async () => {
			const mockGetItem = vi.spyOn(localStorage, "getItem")
				.mockImplementation(key => {
					if(key == "hash")
						return "cachedAnswer";
					else if(key == "hash-time")
						return "123";
					return null;
				});
			const component = await createAndSubmitForm();
			
			
			expect(postData).not.toHaveBeenCalled();
			expect(createDataBlob).toHaveBeenCalledWith("cachedAnswer");
			
			const btn = component.dom.querySelector(".reloadBtn")!;
			btn.dispatchEvent(new Event("click"));
			await wait(1);
			
			expect(component.dom.querySelector(`.${cssFeedbackIcon.success}`)).not.toBeNull();
			
			mockGetItem.mockReset();
		});
		
		it("should show fail when reload did not return a response", async () => {
			const mockGetItem = vi.spyOn(localStorage, "getItem")
				.mockImplementation(key => {
					if(key == "hash")
						return "cachedAnswer";
					else if(key == "hash-time")
						return "123";
					return null;
				});
			vi.mocked(postData).mockResolvedValue(undefined);
			const component = await createAndSubmitForm();
			
			
			expect(postData).not.toHaveBeenCalled();
			expect(createDataBlob).toHaveBeenCalledWith("cachedAnswer");
			
			const btn = component.dom.querySelector(".reloadBtn")!;
			btn.dispatchEvent(new Event("click"));
			await wait(1);
			
			expect(component.dom.querySelector(`.${cssFeedbackIcon.failed}`)).not.toBeNull();
			
			mockGetItem.mockReset();
			vi.mocked(postData).mockReset();
		});
	});
	
	describe("Compare file", () => {
		afterEach(() => {
			vi.clearAllMocks()
		});
		
		async function compareFile(component: RenderModel, content: string | null) {
			//open menu:
			const btn = component.dom.querySelector(".compareBtn")!;
			btn.dispatchEvent(new Event("click"));
			component.redraw();
			
			//start comparing:
			const input = component.dom.querySelector("input[type=file]")! as HTMLInputElement;
			if(content !== null) {
				const file = new File([content], "filename");
				input.files = [file] as unknown as FileList;
			}
			input.dispatchEvent(new Event("change"));
			
			await wait(1);
			component.redraw();
		}
		
		it("should compare data correctly", async () => {
			const component = await createAndSubmitForm();
			
			
			let differences: HTMLElement;
			
			//added content:
			await compareFile(component, "postDataAnswerPlus");
			
			differences = component.dom.querySelector(`.${css.differences}`)!;
			const removed = differences.querySelector(`.${css.removed}`)! as HTMLElement;
			expect(removed.innerText).toBe("Plus");
			
			
			//removed content:
			await compareFile(component, "postData");
			
			differences = component.dom.querySelector(`.${css.differences}`)!;
			const added = differences.querySelector(`.${css.added}`)! as HTMLElement;
			expect(added.innerText).toBe("Answer");
			
			
			//no changes:
			await compareFile(component, "postDataAnswer");
			
			differences = component.dom.querySelector(`.${css.differences}`)!;
			expect(differences.innerText).toBe(Lang.get("foundNoChanges"));
		});
		
		it("should cancel comparing if an empty file was provided", async () => {
			const component = await createAndSubmitForm();
			
			await compareFile(component, "");
			
			const differences = component.dom.querySelector(`.${css.differences}`);
			expect(differences).toBeNull();
			
			closeAllMenus(); //close menu opened by compareBtn
		});
		
		it("should cancel comparing if no file was provided", async () => {
			const component = await createAndSubmitForm();
			
			await compareFile(component, null);
			
			const differences = component.dom.querySelector(`.${css.differences}`);
			expect(differences).toBeNull();
			
			closeAllMenus(); //close menu opened by compareBtn
		});
	});
	
});