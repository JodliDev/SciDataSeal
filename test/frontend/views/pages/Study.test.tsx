import {describe, it, vi, expect, afterEach, afterAll} from "vitest";
import {renderPage} from "../../testRender.ts";
import getData from "../../../../src/frontend/actions/getData.ts";
import {Lang} from "../../../../src/frontend/singleton/Lang.ts";
import Study from "../../../../src/frontend/views/pages/Study.tsx";

describe("Study", async () => {
	vi.mock("../../../../src/frontend/actions/getData.ts", () => ({
		default: vi.fn(() => ({
			studyName: "test",
		}))
	}));
	
	afterEach(() => {
		vi.resetAllMocks();
	});
	afterAll(() => {
		vi.restoreAllMocks();
	});
	
	it("should load the correct study", async () => {
		const id = 1;
		await renderPage(Study, `id=${id}`);
		
		expect(getData).toHaveBeenCalledWith("/getEntry", `?type=study&id=${id}`);
	});
	
	it("should show message if study could not be loaded", async () => {
		vi.mocked(getData).mockResolvedValue(undefined);
		const component = await renderPage(Study);
		
		expect(component.dom.innerText).toBe(Lang.get("notFound"));
	});
});