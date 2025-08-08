import {describe, expect, it, vi} from "vitest";
import createDataBlob from "../../../src/frontend/actions/createDataBlob.ts";

describe("createDataBlob", () => {
	it("should create a valid object URL for the provided data", () => {
		const mockCreateObjectURL = vi.fn(() => "blob:mock-url");
		vi.stubGlobal("URL", {createObjectURL: mockCreateObjectURL});
		
		const data = "{\"key\":\"value\"}";
		const result = createDataBlob(data);
		
		expect(mockCreateObjectURL).toHaveBeenCalledOnce();
		expect(mockCreateObjectURL).toHaveBeenCalledWith(expect.any(Blob));
		expect(result).toBe("blob:mock-url");
	});
});