import {describe, expect, it, vi, afterEach, afterAll} from "vitest";
import Site from "../../../src/frontend/views/Site";
import {wait} from "../../convenience";
import {FrontendOptions} from "../../../src/shared/FrontendOptions";
import SessionData from "../../../src/shared/SessionData.ts";
import {getUrlData} from "../../../src/frontend/actions/getUrlData.ts";
import {PageBox} from "../../../src/frontend/PageComponent.ts";
import {SiteTools} from "../../../src/frontend/singleton/SiteTools.ts";
import {renderComponent} from "../testRender.ts";

describe("Site", () => {
	vi.mock("../../../src/frontend/actions/getUrlData.ts", {spy: true});
	
	//use mocks to decrease async loading time:
	vi.mock("../../../src/frontend/views/pages/Home.tsx", () => ({
		default: {
			component: async () => ({history: [], view: () => ""}),
			isAllowed: () => false,
		} satisfies PageBox,
	}));
	vi.mock("../../../src/frontend/views/pages/Questionnaire.tsx", () => ({
		default: {
			component: async () => ({history: [], view: () => ""}),
			isAllowed: () => true,
		} satisfies PageBox,
	}));
	
	afterEach(() => {
		vi.unstubAllGlobals();
		vi.clearAllMocks();
	})
	afterAll(() => {
		vi.resetAllMocks();
	});
	
	it("should load Init page when isInit = false", async () => {
		const component = renderComponent(Site, {session: {} as SessionData, options: {urlPath: "/", isInit: false} as FrontendOptions});
		await wait(1);
		component.redraw();
		
		expect(component.dom.querySelector("#Init")).not.toBeNull();
	});
	
	it("should load the About page when an empty page is provided", () => {
		const component = renderComponent(Site, {session: {} as SessionData, options: {urlPath: "/", isInit: true} as FrontendOptions});
		
		expect(component.dom.querySelector("#About")).not.toBeNull();
	});
	
	it("should load the Home page when logged in and an empty page is provided", () => {
		const component = renderComponent(Site, {session: {isLoggedIn: true} as SessionData, options: {urlPath: "/", isInit: true} as FrontendOptions});
		
		expect(component.dom.querySelector("#Home")).not.toBeNull();
	});
	
	it("should load the Error page when a faulty page is provided", async () => {
		vi.mocked(getUrlData).mockReturnValue({page: "DoesNotExist", query: ""});
		const component = renderComponent(Site, {session: {} as SessionData, options: {urlPath: "/", isInit: true} as FrontendOptions});
		await wait(1);
		component.redraw();
		
		expect(component.dom.querySelector("#Error")).not.toBeNull();
	});
	
	it("should load the Login page when page is not allowed", async () => {
		vi.mocked(getUrlData).mockReturnValue({page: "Home", query: ""});
		const component = renderComponent(Site, {session: {isLoggedIn: false} as SessionData, options: {urlPath: "/", isInit: true} as FrontendOptions});
		await wait(1);
		component.redraw();
		
		expect(component.dom.querySelector("#Login")).not.toBeNull();
	});
	
	it("should show the loading page while a page is loading", async() => {
		vi.mocked(getUrlData).mockReturnValue({page: "Home", query: ""});
		const component = renderComponent(Site, {session: {isLoggedIn: true} as SessionData, options: {urlPath: "/", isInit: true} as FrontendOptions});
		
		expect(component.dom.querySelector("#Loading")).not.toBeNull();
		
		await wait(1);
		component.redraw();
		
		expect(component.dom.querySelector("#Loading")).toBeNull();
		expect(component.dom.querySelector("#Home")).not.toBeNull();
	});
	
	it("should load a new page on popstate", () => {
		const component = renderComponent(Site, {session: {isLoggedIn: true} as SessionData, options: {urlPath: "/", isInit: true} as FrontendOptions});
		
		component.redraw();
		
		expect(component.dom.querySelector("#Home")).not.toBeNull();
		expect(component.dom.querySelector("#Questionnaire")).toBeNull();
		
		const event = new Event("popstate");
		(event as any).state = {page: "Questionnaire", query: ""};
		window.dispatchEvent(event);
		component.redraw();
		
		expect(component.dom.querySelector("#Home")).toBeNull();
		expect(component.dom.querySelector("#Questionnaire")).not.toBeNull();
	});
	
	it("should load a new page when switchPage is called", () => {
		const component = renderComponent(Site, {session: {isLoggedIn: true} as SessionData, options: {urlPath: "/", isInit: true} as FrontendOptions});
		
		component.redraw();
		
		expect(component.dom.querySelector("#Home")).not.toBeNull();
		expect(component.dom.querySelector("#Questionnaire")).toBeNull();
		
		SiteTools.switchPage("Questionnaire");
		component.redraw();
		
		expect(component.dom.querySelector("#Home")).toBeNull();
		expect(component.dom.querySelector("#Questionnaire")).not.toBeNull();
	});
	
	it("should only pushState when page is different", () => {
		const component = renderComponent(Site, {session: {isLoggedIn: true} as SessionData, options: {urlPath: "/", isInit: true} as FrontendOptions});
		window.history.pushState = vi.fn();
		
		expect(component.dom.querySelector("#Home")).not.toBeNull();
		SiteTools.switchPage("Home");
		expect(window.history.pushState).not.toHaveBeenCalled();
		
		SiteTools.switchPage("Questionnaire");
		expect(window.history.pushState).toHaveBeenCalledOnce();
	});
});