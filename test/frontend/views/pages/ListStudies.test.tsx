import {describe, it, vi, expect, afterEach} from "vitest";
import {renderPage} from "../../testRender.ts";
import ListStudies from "../../../../src/frontend/views/pages/ListStudies.tsx";

describe("ListStudies", async () => {
	vi.mock("../../../../src/frontend/actions/getData.ts", () => ({
		default: vi.fn(() => ({
			studies: [
				{
					studyId: 1,
					studyName: "testName1",
				},
				{
					studyId: 5,
					studyName: "testName2",
				},
				{
					studyId: 6,
					studyName: "testName3",
				}
			],
		}))
	}));
	
	afterEach(() => {
		vi.resetAllMocks();
	});
	
	it("should display all loaded questionnaires", async () => {
		const component = await renderPage(ListStudies);
		
		const urls = component.dom.querySelectorAll(".bigButton");
		
		expect(urls.length).toBe(3);
		expect((urls[0] as HTMLLinkElement).innerText).toBe("testName1");
		expect((urls[1] as HTMLLinkElement).innerText).toBe("testName2");
		expect((urls[2] as HTMLLinkElement).innerText).toBe("testName3");
	});
});