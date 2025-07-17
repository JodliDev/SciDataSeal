import {describe, it, vi, expect, beforeEach} from "vitest";
import Site from "../../../src/frontend/views/Site";
import {wait} from "../../convenience";
import mq from "mithril-query"
import {FrontendOptions} from "../../../src/shared/FrontendOptions";
import css from "../../../src/frontend/views/widgets/LoadingSpinner.module.css";

describe("Site", () => {
	beforeEach(() => {
		vi.resetModules()
		// vi.resetAllMocks()
		// vi.restoreAllMocks()
		
		TestData.count = 0
	});
	
	let TestData = {
		count: 0,
		resolve: () => {}
	}
	vi.doMock("../../../src/frontend/views/pages/Test", async () => {
		++TestData.count;
		await new Promise<void>(r => {
			TestData.resolve = r;
		});
		return {
			default: () => "",
		};
	});
	
	it("should load the Home page when an empty page is provided", async() => {
		const out = mq(Site, {homepageName: "", options: {urlPath: "", isInit: true} satisfies FrontendOptions});
		
		await wait(10);
		out.redraw();
		
		out.should.have("#Home");
	});
	
	it("should load the Home page when a faulty page is provided", async() => {
		const out = mq(Site, {homepageName: "DoesNotExist", options: {urlPath: "", isInit: true} satisfies FrontendOptions});
		
		out.should.have("#DoesNotExist");
		
		await wait(10);
		out.redraw();
		
		out.should.have("#Home");
	});
	
	it("should show the loading icon while a page is loading", async() => {
		const out = mq(Site, {homepageName: "Test", options: {urlPath: "", isInit: true} satisfies FrontendOptions});
		
		out.should.have(`.${css.LoadingSpinner}`); //default loader
		expect(TestData.count, "Initial imports of Test").toBe(0);
		
		await wait(10);
		out.redraw();
		
		out.should.have(`.${css.LoadingSpinner}`); //loader when loadPage is started
		
		TestData.resolve();
		await wait(10);
		out.redraw();
		
		out.should.not.have(css.LoadingSpinner);
		out.should.have("#Test");
		expect(TestData.count, "Imports of Test after loading").toBe(1);
	});
	
	
	
	
	
	
	
	
	
	
	
	
	
	// it("should load the Home page when an empty page is provided", async() => {
	// 	vi.mock(`../../../src/frontend/views/pages/Home`, {spy: true});
	// 	const out = mq(Site, {homepageName: "", options: {urlPath: ""} satisfies FrontendOptions});
	//
	// 	await wait(10);
	// 	out.redraw();
	// 	out.should.have("#Home");
	// 	expect(Home).toHaveBeenCalled();
	// });
	//
	// it("should show the loading icon while a page is loading", async() => {
	// 	//artificially delay import of Test:
	// 	let resolve: () => void = () => {};
	// 	vi.doMock("../../../src/frontend/views/pages/Test", async () => {
	// 		await new Promise<void>(r => {
	// 			resolve = r;
	// 		});
	// 		return {
	// 			default: () => "",
	// 		};
	// 	});
	// 	const out = mq(Site, {homepageName: "Test", options: {urlPath: ""} satisfies FrontendOptions});
	//
	// 	out.should.have(`.${css.LoadingSpinner}`); //default loader
	// 	await wait(10);
	// 	out.redraw();
	//
	// 	out.should.have(`.${css.LoadingSpinner}`); //loader when loadPage is started
	// 	resolve(); //finish the import
	// 	await wait(10);
	// 	out.redraw();
	//
	// 	console.log(out.rootEl.innerHTML);
	// 	out.should.not.have(css.LoadingSpinner);
	// 	out.should.have("#Test");
	//
	// 	vi.doUnmock("../../../src/frontend/views/pages/Test")
	// });
	//
	// it("should load the Home page when a faulty page is provided", async() => {
	// 	vi.mock(`../../../src/frontend/views/pages/Home`, {spy: true});
	// 	const out = mq(Site, {homepageName: "DoesNotExist", options: {urlPath: ""} satisfies FrontendOptions});
	//
	// 	out.should.have("#DoesNotExist");
	// 	await wait(10);
	// 	out.redraw();
	// 	out.should.have("#Home");
	// 	expect(Home).toHaveBeenCalled();
	// });
	//
	// it("should load a specific page when a valid page name is provided", async() => {
	// 	vi.mock(`../../../src/frontend/views/pages/Test`, {spy: true});
	// 	const out = mq(Site, {homepageName: "Test", options: {urlPath: ""} satisfies FrontendOptions});
	//
	// 	//Before loading:
	// 	out.should.have("#Test");
	// 	expect(Test).toHaveBeenCalledTimes(0);
	// 	await wait(10);
	//
	// 	out.redraw();
	//
	// 	//After loading:
	// 	console.log(out.rootEl.innerHTML);
	// 	out.should.have("#Test");
	// 	expect(Test).toHaveBeenCalled();
	// });
});