import {describe, expect, it} from "vitest";
import {AsyncComponent, PageBox, PrivatePage, PublicPage} from "../../src/frontend/PageComponent.ts";

describe("PrivatePage", () => {
	const mockView: AsyncComponent = async(_) => ({
		view: () => "mockContent",
		history: []
	});
	let session: { isLoggedIn: boolean };
	
	it("should return a PageBox with isAllowed set based on session.isLoggedIn", () => {
		const privatePage: PageBox = PrivatePage(mockView);
		
		// Test when user is logged in
		session = {isLoggedIn: true};
		expect(privatePage.isAllowed(session)).toBe(true);
		
		// Test when user is not logged in
		session = {isLoggedIn: false};
		expect(privatePage.isAllowed(session)).toBe(false);
	});
	
	it("should return a PageBox with the correct component", () => {
		const privatePage: PageBox = PrivatePage(mockView);
		
		expect(privatePage.component).toBe(mockView);
	});
});

describe("PublicPage", () => {
	const mockView: AsyncComponent = async(_) => ({
		view: () => "mockContent",
		history: []
	});
	
	it("should return a PageBox with isAllowed always set to true", () => {
		const publicPage: PageBox = PublicPage(mockView);
		
		expect(publicPage.isAllowed({isLoggedIn: false})).toBe(true);
		expect(publicPage.isAllowed({isLoggedIn: true})).toBe(true);
	});
	
	it("should return a PageBox with the correct component", () => {
		const publicPage: PageBox = PublicPage(mockView);
		
		expect(publicPage.component).toBe(mockView);
	});
});