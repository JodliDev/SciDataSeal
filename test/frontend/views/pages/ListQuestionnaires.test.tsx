import {describe, it, vi, expect, afterEach} from "vitest";
import {renderPage} from "../../testRender.ts";
import ListQuestionnaires from "../../../../src/frontend/views/pages/ListQuestionnaires.tsx";

describe("ListQuestionnaires", async () => {
	vi.mock("../../../../src/frontend/actions/getData.ts", () => ({
		default: vi.fn(() => ({
			questionnaires: [
				{
					questionnaireId: 1,
					questionnaireName: "testQuestionnaire",
				},
				{
					questionnaireId: 5,
					questionnaireName: "testQuestionnaire2",
				},
				{
					questionnaireId: 6,
					questionnaireName: "testQuestionnaire3",
				}
			],
		}))
	}));
	
	afterEach(() => {
		vi.resetAllMocks();
	});
	
	it("should display all loaded questionnaires", async () => {
		const component = await renderPage(ListQuestionnaires);
		
		const urls = component.dom.querySelectorAll(".bigButton");
		
		expect(urls.length).toBe(3);
		expect((urls[0] as HTMLLinkElement).innerText).toBe("testQuestionnaire");
		expect((urls[1] as HTMLLinkElement).innerText).toBe("testQuestionnaire2");
		expect((urls[2] as HTMLLinkElement).innerText).toBe("testQuestionnaire3");
	});
});