import {describe, it, vi, expect, afterAll} from "vitest";
import {renderPage} from "../../testRender.ts";
import ListUsers from "../../../../src/frontend/views/pages/ListUsers.tsx";
import listData from "../../../../src/frontend/actions/listData.ts";

describe("ListUsers", async () => {
	vi.mock("../../../../src/frontend/actions/listData.ts", () => ({
		default: vi.fn()
	}));
	
	afterAll(() => {
		vi.resetAllMocks();
	});
	
	it("should load correct list", async () => {
		await renderPage(ListUsers);
		expect(listData).toHaveBeenCalledWith("users", undefined);
	});
});