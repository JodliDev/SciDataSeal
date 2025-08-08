import {describe, it, vi, expect, afterAll, afterEach} from "vitest";
import {renderComponent} from "../../../testRender.ts";
import Init from "../../../../../src/frontend/views/pages/fallback/Init.tsx";
import {wait} from "../../../../convenience.ts";
import postData from "../../../../../src/frontend/actions/postData.ts";
import {Lang} from "../../../../../src/frontend/singleton/Lang.ts";

describe("Init", async () => {
	vi.mock("../../../../../src/frontend/actions/postData.ts", () => ({
		default: vi.fn(() => ({}))
	}));
	
	afterEach(() => {
		vi.clearAllMocks();
	});
	afterAll(() => {
		vi.resetAllMocks();
	});
	
	async function createAndSubmitForm(password: string, passwordRepeat: string) {
		const component = renderComponent(Init, {});
		const form = component.dom.querySelector("form")! as HTMLFormElement;
		
		const usernameInput = component.dom.querySelector("input[name=username]")! as HTMLInputElement;
		usernameInput.value = "Camina";
		const passwordInput = component.dom.querySelector("input[name=password]")! as HTMLInputElement;
		passwordInput.value = password;
		const passwordRepeatInput = component.dom.querySelector("input[name=passwordRepeat]")! as HTMLInputElement;
		passwordRepeatInput.value = passwordRepeat;
		
		form.dispatchEvent(new Event("submit"));
		await wait(1);
		component.redraw();
		
		return component;
	}
	
	it("should show an error if passwords dont match", async () => {
		const component = await createAndSubmitForm("qwe", "asd");
		
		expect(postData).not.toHaveBeenCalled();
		const warnEl = component.dom.querySelector(".warn")! as HTMLElement;
		expect(warnEl.innerText).toBe(Lang.get("errorPasswordMismatch"));
	});
	
	it("should send correct data to backend and reload page when successful", async () => {
		const mockReload = vi.spyOn(window.location, "reload");
		await createAndSubmitForm("Drummer", "Drummer");
		
		expect(postData).toHaveBeenCalledWith("/initialize", {username: "Camina", password: "Drummer"}, expect.any(Object));
		expect(mockReload).toHaveBeenCalled();
	});
});