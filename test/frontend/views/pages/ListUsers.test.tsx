import {describe, it, vi, expect, afterEach} from "vitest";
import {renderPage} from "../../testRender.ts";
import ListUsers from "../../../../src/frontend/views/pages/ListUsers.tsx";

describe("ListUsers", async () => {
	vi.mock("../../../../src/frontend/actions/getData.ts", () => ({
		default: vi.fn(() => ({
			users: [
				{
					userId: 1,
					username: "testuser",
				},
				{
					userId: 5,
					username: "testuser2",
				},
				{
					userId: 6,
					username: "testuser3",
				}
			],
		}))
	}));
	
	afterEach(() => {
		vi.resetAllMocks();
	});
	
	it("should display all loaded users", async () => {
		const component = await renderPage(ListUsers);
		
		const urls = component.dom.querySelectorAll(".bigButton");
		
		expect(urls.length).toBe(3);
		expect((urls[0] as HTMLLinkElement).innerText).toBe("testuser");
		expect((urls[1] as HTMLLinkElement).innerText).toBe("testuser2");
		expect((urls[2] as HTMLLinkElement).innerText).toBe("testuser3");
	});
});