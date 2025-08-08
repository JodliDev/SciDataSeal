import {describe, it, vi, expect, afterAll, afterEach, beforeAll} from "vitest";
import {renderComponent} from "../../../testRender.ts";
import {wait} from "../../../../convenience.ts";
import postData from "../../../../../src/frontend/actions/postData.ts";
import Login from "../../../../../src/frontend/views/pages/fallback/Login.tsx";
import {SiteTools} from "../../../../../src/frontend/singleton/SiteTools.ts";

describe("Login", async () => {
	vi.mock("../../../../../src/frontend/actions/postData.ts", () => ({
		default: vi.fn(() => ({
			userId: 123
		}))
	}));
	
	beforeAll(() => {
		SiteTools.init({}, () => {});
	});
	afterEach(() => {
		vi.clearAllMocks();
		SiteTools.init({}, () => {});
	});
	afterAll(() => {
		vi.resetAllMocks();
	});
	
	async function createAndSubmitForm() {
		const component = renderComponent(Login, {});
		const form = component.dom.querySelector("form")! as HTMLFormElement;
		
		form.dispatchEvent(new Event("submit"));
		await wait(1);
		component.redraw();
		
		return component;
	}
	
	it("should switch page when login was successfully", async () => {
		let calledSwitchPage = false;
		SiteTools.init({}, (page) => {
			expect(page).toBe("Home");
			calledSwitchPage = true;
		});
		await createAndSubmitForm();
		
		expect(postData).toHaveBeenCalled();
		expect(calledSwitchPage).toBe(true);
		expect(SiteTools.session.userId).toBe(123);
		expect(SiteTools.session.isLoggedIn).toBe(true);
	});
});