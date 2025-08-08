import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import floatingMenu, {closeAllMenus, FloatingMenuFotTesting} from "../../../src/frontend/actions/FloatingMenu.ts";
import css from "../../../src/frontend/actions/FloatingMenu.module.css";
import {wait} from "../../convenience.ts";

describe("FloatingMenu class", () => {
	const menuId = "testMenu";
	const menuCallback = vi.fn(() => "Menu Content");
	let floatingMenuObj: FloatingMenuFotTesting;
	
	beforeEach(() => {
		floatingMenuObj = new FloatingMenuFotTesting(menuId, menuCallback);
	});
	
	afterEach(async () => {
		await wait(1); //in case asynchronous clickOutside still needs to be set
		menuCallback.mockReset();
		document.body.innerHTML = "";
		for(const key in FloatingMenuFotTesting.openedMenus) {
			FloatingMenuFotTesting.openedMenus[key].closeMenu();
		}
	});
	
	it("should create a dropdown menu on a click event and close it on another click event", () => {
		const mockEvent = {
			target: document.createElement("div"),
		} as unknown as MouseEvent;
		
		//open:
		floatingMenuObj.getAttributes().onclick!(mockEvent);
		expect(FloatingMenuFotTesting.openedMenus[menuId]).toBe(floatingMenuObj);
		expect(document.body.querySelector(`.${css.FloatingMenu}`)).toBeTruthy();
		
		//close:
		floatingMenuObj.getAttributes().onclick!(mockEvent);
		expect(FloatingMenuFotTesting.openedMenus[menuId]).toBeUndefined();
		expect(document.body.querySelector(`.${css.FloatingMenu}`)).toBeFalsy();
	});
	
	it("should create a dropdown menu on mouseenter and close it on mouseleave", () => {
		floatingMenuObj = new FloatingMenuFotTesting(menuId, menuCallback, {eventName: "mouseenter"});
		const mockEvent = {
			target: document.createElement("div"),
		} as unknown as MouseEvent;
		
		//open:
		floatingMenuObj.getAttributes().onmouseenter!(mockEvent);
		expect(FloatingMenuFotTesting.openedMenus[menuId]).toBe(floatingMenuObj);
		expect(document.body.querySelector(`.${css.FloatingMenu}`)).toBeTruthy();
		
		//close:
		floatingMenuObj.getAttributes().onmouseleave!(mockEvent);
		expect(FloatingMenuFotTesting.openedMenus[menuId]).toBeUndefined();
		expect(document.body.querySelector(`.${css.FloatingMenu}`)).toBeFalsy();
	});

	it("should close the menu when calling closeMenu", () => {
		const mockEvent = {
			target: document.createElement("div"),
		} as unknown as MouseEvent;

		floatingMenuObj.getAttributes().onclick!(mockEvent);

		floatingMenuObj.closeMenu();
		expect(FloatingMenuFotTesting.openedMenus[menuId]).toBeUndefined();
		expect(document.body.querySelector(`.${css.FloatingMenu}`)).toBeFalsy();
	});

	it("should handle clickOutside to close menu", async() => {
		const mockTarget = document.createElement("div");
		document.body.appendChild(mockTarget);

		const mockEvent = {
			target: mockTarget,
			stopPropagation: vi.fn(),
		} as unknown as MouseEvent;

		floatingMenuObj.getAttributes().onclick?.(mockEvent as MouseEvent);

		await wait(1); //the click handler in document.body is added asynchronously
		document.body.click();

		expect(FloatingMenuFotTesting.openedMenus[menuId]).toBeUndefined();
		expect(document.body.querySelector(`.${css.FloatingMenu}`)).toBeFalsy();
	});

	it("should correctly position view when using click", async() => {
		floatingMenuObj = new FloatingMenuFotTesting(menuId, menuCallback, {eventName: "click"});
		const target = document.createElement("div");
		const mockEvent = {
			target: target,
		} as unknown as MouseEvent;

		vi.spyOn(target, "getBoundingClientRect").mockReturnValue({
			left: 50,
			right: window.innerWidth - 10,
			top: 30,
			bottom: window.innerHeight - 10,
			width: 10,
			height: 10,
		} as DOMRect);
		
		floatingMenuObj.getAttributes().onclick!(mockEvent);
		
		const menuElement = floatingMenuObj["view"]!;
		expect(menuElement.style.left).toBe("55px");
		expect(menuElement.style.top).toBe("40px");
	});

	it("should correctly position view when using mouseenter", async() => {
		floatingMenuObj = new FloatingMenuFotTesting(menuId, menuCallback, {eventName: "mouseenter"});
		const target = document.createElement("div");
		const mockEvent = {
			target: target,
		} as unknown as MouseEvent;

		vi.spyOn(target, "getBoundingClientRect").mockReturnValue({
			left: 50,
			right: window.innerWidth - 10,
			top: 30,
			bottom: window.innerHeight - 10,
			width: 10,
			height: 10,
		} as DOMRect);
		
		floatingMenuObj.getAttributes().onmouseenter!(mockEvent);
		
		const menuElement = floatingMenuObj["view"]!;
		expect(menuElement.style.left).toBe("55px");
		expect(menuElement.style.top).toBe("40px");
	});

	it("should correctly position view when using mousemove", async() => {
		floatingMenuObj = new FloatingMenuFotTesting(menuId, menuCallback, {eventName: "mousemove"});
		const target = document.createElement("div");
		const mockEvent = {
			target: target,
			clientX: 50,
			clientY: 30
		} as unknown as MouseEvent;

		vi.spyOn(target, "getBoundingClientRect").mockReturnValue({
			left: 50,
			right: window.innerWidth - 10,
			top: 50,
			bottom: window.innerHeight - 10,
			width: 10,
			height: 10,
		} as DOMRect);
		
		//create menu:
		floatingMenuObj.getAttributes().onmouseenter!(mockEvent);
		
		const menuElement = floatingMenuObj["view"]!;
		
		vi.spyOn(menuElement, "getBoundingClientRect").mockReturnValue({
			left: 60,
			right: window.innerWidth - 10,
			top: 40,
			bottom: window.innerHeight - 10,
			width: 100,
			height: 100,
		} as DOMRect);
		
		//position: view:
		floatingMenuObj.getAttributes().onmousemove!(mockEvent);
		
		expect(menuElement.style.left).toBe("60px");
		expect(menuElement.style.top).toBe("40px");
	});
	
	it("should close old menu when mouseenter was called twice", async() => {
		floatingMenuObj = new FloatingMenuFotTesting(menuId, menuCallback, {eventName: "mouseenter"});
		
		const mockClose = vi.spyOn(floatingMenuObj, "closeMenu");
		
		const target = document.createElement("div");
		const mockEvent = {
			target: target,
		} as unknown as MouseEvent;
		
		floatingMenuObj.getAttributes().onmouseenter!(mockEvent);
		expect(mockClose).not.toHaveBeenCalled();
		floatingMenuObj.getAttributes().onmouseenter!(mockEvent);
		expect(mockClose).toHaveBeenCalledOnce();
	});
	
	it("should correct position when being outside left, top edge", async() => {
		const mockEvent = {
			target: document.createElement("div"),
		} as unknown as MouseEvent;

		floatingMenuObj.getAttributes().onclick!(mockEvent);
		
		const menuElement = floatingMenuObj["view"]!;

		vi.spyOn(menuElement, "getBoundingClientRect").mockReturnValue({
			left: -10,
			right: window.innerWidth - 10,
			top: -10,
			bottom: window.innerHeight - 10,
			width: 100,
			height: 100,
		} as DOMRect);

		floatingMenuObj["validatePosition"]();
		expect(menuElement.style.left).toBe("5px");
		expect(menuElement.style.top).toBe("5px");
	});

	it("should correct position when being outside right, bottom edge", async() => {
		const mockEvent = {
			target: document.createElement("div"),
		} as unknown as MouseEvent;

		floatingMenuObj.getAttributes().onclick!(mockEvent);
		const menuElement = floatingMenuObj["view"]!;

		menuElement.getBoundingClientRect = vi.fn(() => ({
			left: 10,
			right: window.innerWidth + 10,
			top: 10,
			bottom: window.innerHeight + 10,
			width: 100,
			height: 100,
		} as DOMRect));

		floatingMenuObj["validatePosition"]();
		expect(menuElement.style.right).toBe("5px");
		expect(menuElement.style.bottom).toBe("5px");
	});

	it("should return correct attributes based on click option", () => {
		floatingMenuObj = new FloatingMenuFotTesting(menuId, menuCallback, {eventName: "click"});
		const attributes = floatingMenuObj.getAttributes();

		expect(attributes).toHaveProperty("onclick");
	});

	it("should return correct attributes based on mouseenter option", () => {
		floatingMenuObj = new FloatingMenuFotTesting(menuId, menuCallback, {eventName: "mouseenter"});
		const attributes = floatingMenuObj.getAttributes();

		expect(attributes).toHaveProperty("onmouseenter");
		expect(attributes).toHaveProperty("onmouseleave");
	});

	it("should return correct attributes based on mousemove option", () => {
		floatingMenuObj = new FloatingMenuFotTesting(menuId, menuCallback, {eventName: "mousemove"});
		const attributes = floatingMenuObj.getAttributes();

		expect(attributes).toHaveProperty("onmouseenter");
		expect(attributes).toHaveProperty("onmouseleave");
		expect(attributes).toHaveProperty("onmousemove");
	});
	
	it("should properly detect element containment with contains method", async () => {
		const mockEvent = {
			target: document.createElement("div"),
		} as unknown as MouseEvent;
		
		floatingMenuObj.getAttributes().onclick!(mockEvent);
		
		const menuElement = document.querySelector(`.${css.FloatingMenu}`) as HTMLElement;
		const childElement = document.createElement("div");
		menuElement.appendChild(childElement);
		
		expect(floatingMenuObj.contains(childElement)).toBe(true);
		expect(floatingMenuObj.contains(document.createElement("div"))).toBe(false);
	});
	
	it("should handle interactions between connected menus correctly", async () => {
		const mockEvent = {
			target: document.createElement("div"),
			bubbles: true
		} as unknown as MouseEvent;
		
		const connectedMenuId = "connectedMenu";
		const notConnectedMenuId = "notConnectedMenu";
		const anotherMenuCallback = vi.fn(() => "Another Menu Content");
		const connectedMenu = new FloatingMenuFotTesting(connectedMenuId, anotherMenuCallback, {connectedMenus: [menuId]});
		const notConnectedMenu = new FloatingMenuFotTesting(notConnectedMenuId, anotherMenuCallback);
		
		// Trigger the menus to open:
		floatingMenuObj.getAttributes().onclick!(mockEvent);
		connectedMenu.getAttributes().onclick!(mockEvent);
		notConnectedMenu.getAttributes().onclick!(mockEvent);
		
		//Make sure menus are open:
		expect(FloatingMenuFotTesting.openedMenus[menuId]).toBe(floatingMenuObj);
		expect(FloatingMenuFotTesting.openedMenus[connectedMenuId]).toBe(connectedMenu);
		expect(FloatingMenuFotTesting.openedMenus[notConnectedMenuId]).toBe(notConnectedMenu);
		
		await wait(1);  //the click handler in document.body is added asynchronously
		
		//click on floatingMenu:
		floatingMenuObj["view"]!.click();
		
		await wait(1);
		
		//expect floatingMenu and connectedMenu to stay open:
		expect(FloatingMenuFotTesting.openedMenus[menuId]).toBe(floatingMenuObj);
		expect(FloatingMenuFotTesting.openedMenus[connectedMenuId]).toBe(connectedMenu);
		expect(FloatingMenuFotTesting.openedMenus[notConnectedMenuId]).toBeUndefined();
	});
});

describe("floatingMenu method", () => {const menuId = "testMenu";
	const menuCallback = vi.fn(() => "Menu Content");
	let documentBody: HTMLElement;
	
	beforeEach(() => {
		documentBody = document.body;
	});
	
	afterEach(async () => {
		await wait(1); //in case asynchronous clickOutside still needs to be set
		menuCallback.mockReset();
		document.body.innerHTML = "";
		documentBody.innerHTML = "";
		
		closeAllMenus();
	});
	
	it("should create a menu and return its attributes when not already created", () => {
		const mockEvent = {
			target: document.createElement("div"),
		} as unknown as MouseEvent;
		
		const attributes = floatingMenu(menuId, menuCallback);
		
		attributes.onclick!(mockEvent);
		expect(FloatingMenuFotTesting.openedMenus[menuId]).toBeDefined();
	});
	
	it("should return attributes of an already created menu", () => {
		const mockGetAttributes = vi.fn();
		FloatingMenuFotTesting.openedMenus[menuId] = {
			getAttributes: mockGetAttributes,
			closeMenu: vi.fn()
		} as any;
		
		floatingMenu(menuId, menuCallback);
		expect(mockGetAttributes).toHaveBeenCalledOnce();
		
		//cleanup:
		delete FloatingMenuFotTesting.openedMenus[menuId];
	});
	
	it("should properly handle menus and maintain their state", () => {
		const mockEvent = {
			target: document.createElement("div"),
		} as unknown as MouseEvent;
		const otherMenuId = "connectedMenu";
		const otherMenuCallback = vi.fn(() => "Connected Menu Content");
		
		// Open main menu and connected menu
		const attributes = floatingMenu(menuId, menuCallback);
		const otherAttributes = floatingMenu(otherMenuId, otherMenuCallback);
		
		expect(FloatingMenuFotTesting.openedMenus[menuId]).toBeUndefined();
		expect(FloatingMenuFotTesting.openedMenus[otherMenuId]).toBeUndefined();
		
		attributes.onclick!(mockEvent);
		expect(FloatingMenuFotTesting.openedMenus[menuId]).toBeDefined();
		expect(FloatingMenuFotTesting.openedMenus[otherMenuId]).toBeUndefined();
		
		otherAttributes.onclick!(mockEvent);
		expect(FloatingMenuFotTesting.openedMenus[menuId]).toBeDefined();
		expect(FloatingMenuFotTesting.openedMenus[otherMenuId]).toBeDefined();
		
		FloatingMenuFotTesting.openedMenus[menuId].closeMenu();
		expect(FloatingMenuFotTesting.openedMenus[menuId]).toBeUndefined();
		expect(FloatingMenuFotTesting.openedMenus[otherMenuId]).toBeDefined();
		
		FloatingMenuFotTesting.openedMenus[otherMenuId].closeMenu();
		expect(FloatingMenuFotTesting.openedMenus[menuId]).toBeUndefined();
		expect(FloatingMenuFotTesting.openedMenus[otherMenuId]).toBeUndefined();
	});
	
	it("should pass correct close callback to the menu function", () => {
		const mockEvent = {
			target: document.createElement("div"),
		} as unknown as MouseEvent;
		
		let closeCallback;
		const attributes = floatingMenu(menuId, close => {
			closeCallback = close;
			return "";
		});
		attributes.onclick!(mockEvent);
		expect(FloatingMenuFotTesting.openedMenus[menuId]).toBeDefined();
		closeCallback!()
		expect(FloatingMenuFotTesting.openedMenus[menuId]).toBeUndefined();
	});
});