import {describe, it, vi, expect, afterAll, afterEach} from "vitest";
import {renderPage} from "../../testRender.ts";
import {wait} from "../../../convenience.ts";
import postData from "../../../../src/frontend/actions/postData.ts";
import {Lang} from "../../../../src/frontend/singleton/Lang.ts";
import UserSettings from "../../../../src/frontend/views/pages/UserSettings.tsx";

describe("UserSettings", async () => {
	vi.mock("../../../../src/frontend/actions/postData.ts", () => ({
		default: vi.fn(() => ({}))
	}));
	
	afterEach(() => {
		vi.clearAllMocks();
	});
	afterAll(() => {
		vi.resetAllMocks();
	});
	
	async function createAndSubmitForm(password: string, passwordRepeat: string) {
		const component = await renderPage(UserSettings);
		const form = component.dom.querySelector("form")! as HTMLFormElement;
		
		const passwordInput = component.dom.querySelector("input[name=password]")! as HTMLInputElement;
		passwordInput.value = password;
		const passwordRepeatInput = component.dom.querySelector("input[name=passwordRepeat]")! as HTMLInputElement;
		passwordRepeatInput.value = passwordRepeat;
		
		form.dispatchEvent(new Event("submit"));
		await wait(1);
		component.redraw();
		
		return component;
	}
	
	it("should show an error if no password was provided", async () => {
		const component = await createAndSubmitForm("", "");
		
		expect(postData).not.toHaveBeenCalled();
		const warnEl = component.dom.querySelector(".warn")! as HTMLElement;
		expect(warnEl.innerText).toBe(Lang.get("errorMissingData"));
	});
	
	it("should show an error if passwords dont match", async () => {
		const component = await createAndSubmitForm("qwe", "asd");
		
		expect(postData).not.toHaveBeenCalled();
		const warnEl = component.dom.querySelector(".warn")! as HTMLElement;
		expect(warnEl.innerText).toBe(Lang.get("errorPasswordMismatch"));
	});
	
	it("should send correct data to backend", async () => {
		await createAndSubmitForm("qwe", "qwe");
		
		expect(postData).toHaveBeenCalledWith("/userSettings", {newPassword: "qwe"}, expect.any(Object));
	});
	
	
});