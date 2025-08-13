import {describe, it, vi, expect, afterAll, afterEach, beforeAll} from "vitest";
import {renderPage} from "../../testRender.ts";
import {wait} from "../../../convenience.ts";
import postData from "../../../../src/frontend/actions/postData.ts";
import {SiteTools} from "../../../../src/frontend/singleton/SiteTools.ts";
import cssButton from "../../../../src/frontend/views/widgets/Btn.module.css";
import BlockchainAccount from "../../../../src/frontend/views/pages/BlockchainAccount.tsx";

describe("BlockchainAccount", async () => {
	vi.mock("../../../../src/frontend/actions/postData.ts", () => ({
		default: vi.fn(() => ({
			blockchainAccountId: 123
		}))
	}));
	
	vi.mock("../../../../src/frontend/actions/getData.ts", () => ({
		default: vi.fn(() => ({
			blockchainAccountId: 123,
			blockchainName: "blockchain",
			blockchainType: "solana",
			privateKey: "key"
		}))
	}));
	
	beforeAll(() => {
		SiteTools.init({}, () => {});
	});
	afterEach(() => {
		vi.clearAllMocks();
	});
	afterAll(() => {
		vi.resetAllMocks();
	});
	
	describe("submit data", async () => {
		afterEach(() => {
			vi.clearAllMocks();
			SiteTools.init({}, () => {});
		});
		
		
		async function createAndSubmitForm(id?: number) {
			const component = await renderPage(BlockchainAccount, id ? `id=${id}` : "");
			const form = component.dom.querySelector("form")! as HTMLFormElement;
			
			form.dispatchEvent(new Event("submit"));
			await wait(1);
			component.redraw();
			
			return component;
		}
		
		it("should switch page when data was sent successfully", async () => {
			let calledSwitchPage = false;
			SiteTools.init({}, (page) => {
				expect(page).toBe("Home");
				calledSwitchPage = true;
			});
			await createAndSubmitForm();
			
			expect(postData).toHaveBeenCalled();
			expect(calledSwitchPage).toBe(true);
		});
		
		it("should not switch page when same account was changed", async () => {
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
			const component = await renderPage(BlockchainAccount, `id=${id}`);
			const element = component.dom.querySelector(`.${cssButton.Btn}.delete`)!
			element.dispatchEvent(new Event("click"));
			
			await wait(1);
			component.redraw();
			
			return component;
		}
		
		it("should switch page when data was deleted successfully", async () => {
			let calledSwitchPage = false;
			SiteTools.init({}, (page) => {
				expect(page).toBe("ListBlockchainAccounts");
				calledSwitchPage = true;
			});
			await createAndPressDelete(123);
			
			expect(calledSwitchPage).toBe(true);
		});
	});
});