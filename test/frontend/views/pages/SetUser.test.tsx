import {describe, it, vi, expect, afterAll, afterEach, beforeAll} from "vitest";
import {renderPage} from "../../testRender.ts";
import {wait} from "../../../convenience.ts";
import postData from "../../../../src/frontend/actions/postData.ts";
import {Lang} from "../../../../src/frontend/singleton/Lang.ts";
import {SiteTools} from "../../../../src/frontend/singleton/SiteTools.ts";
import SetUser from "../../../../src/frontend/views/pages/SetUser.tsx";
import cssButton from "../../../../src/frontend/views/structures/Btn.module.css";

describe("SetUser.tsx", async () => {
	vi.mock("../../../../src/frontend/actions/postData.ts", () => ({
		default: vi.fn(() => ({
			userId: 123
		}))
	}));
	
	vi.mock("../../../../src/frontend/actions/getData.ts", () => ({
		default: vi.fn(() => ({
			username: "user123"
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
		
		
		async function createAndSubmitForm(password: string, passwordRepeat: string, id?: number) {
			const component = await renderPage(SetUser, id ? `id=${id}` : "");
			const form = component.dom.querySelector("form")! as HTMLFormElement;
			
			if(id && password) {
				const usernameInput = component.dom.querySelector("input[class=enablePassword]")! as HTMLInputElement;
				usernameInput.dispatchEvent(new Event("change"));
				component.redraw();
			}
			
			const usernameInput = component.dom.querySelector("input[name=username]")! as HTMLInputElement;
			usernameInput.value = "user";
			const isAdminInput = component.dom.querySelector("input[name=isAdmin]")! as HTMLInputElement;
			isAdminInput.checked = true;
			const passwordInput = component.dom.querySelector("input[name=password]")! as HTMLInputElement;
			passwordInput.value = password;
			const passwordRepeatInput = component.dom.querySelector("input[name=passwordRepeat]")! as HTMLInputElement;
			passwordRepeatInput.value = passwordRepeat;
			
			form.dispatchEvent(new Event("submit"));
			await wait(1);
			component.redraw();
			
			return component;
		}
		
		it("should send data without password if no password was provided", async () => {
			await createAndSubmitForm("", "");
			
			expect(postData).toHaveBeenCalledWith("/setUser",
				{
					username: expect.anything(),
					isAdmin: expect.anything()
				}, expect.any(Object));
		});
		
		it("should show an error if passwords dont match", async () => {
			const component = await createAndSubmitForm("qwe", "asd");
			
			expect(postData).not.toHaveBeenCalled();
			const warnEl = component.dom.querySelector(".warn")! as HTMLElement;
			expect(warnEl.innerText).toBe(Lang.get("errorPasswordMismatch"));
		});
		
		it("should send correct data to backend", async () => {
			await createAndSubmitForm("qwe", "qwe", 123);
			
			expect(postData).toHaveBeenCalledWith("/setUser",
				{
					id: expect.anything(),
					username: expect.anything(),
					password: "qwe",
					isAdmin: expect.anything()
				}, expect.any(Object));
		});
		
		it("should switch page when data was sent successfully", async () => {
			let calledSwitchPage = false;
			SiteTools.init({}, (page, query) => {
				expect(page).toBe("SetUser");
				expect(query).toBe(`?id=123`);
				calledSwitchPage = true;
			});
			await createAndSubmitForm("qwe", "qwe");
			
			expect(postData).toHaveBeenCalled();
			expect(calledSwitchPage).toBe(true);
		});
		
		it("should not switch page when same user was changed", async () => {
			let calledSwitchPage = false;
			SiteTools.init({}, () => {
				calledSwitchPage = true;
			});
			await createAndSubmitForm("qwe", "qwe", 123);
			
			expect(postData).toHaveBeenCalled();
			expect(calledSwitchPage).toBe(false);
		});
	});
	
	describe("delete data", () => {
		afterEach(() => {
			vi.clearAllMocks();
		});
		afterAll(() => {
			confirmMock.mockRestore();
			SiteTools.init({}, () => {});
		});
		
		const confirmMock = vi.spyOn(window, "confirm").mockReturnValue(true);
		
		async function createAndPressDelete(id: number) {
			const component = await renderPage(SetUser, `id=${id}`);
			const element = component.dom.querySelector(`.${cssButton.Btn}.delete`)!
			element.dispatchEvent(new Event("click"));
			
			await wait(1);
			component.redraw();
			
			return component;
		}
		
		it("should switch page when data was deleted successfully", async () => {
			let calledSwitchPage = false;
			SiteTools.init({}, (page) => {
				expect(page).toBe("ListUsers");
				calledSwitchPage = true;
			});
			await createAndPressDelete(123);
			
			expect(calledSwitchPage).toBe(true);
		});
	});
});