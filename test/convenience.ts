import {vi} from "vitest";


export function mockFetch(data: unknown, status: number = 200, testInit?: (url: string, init: RequestInit) => void) {
	vi.stubGlobal(
		"fetch",
		vi.fn().mockImplementation((url, init) => {
			testInit?.(url, init);
			return Promise.resolve({
				ok: status == 200,
				json: () => Promise.resolve(data),
				status: status,
			});
		}),
	);
}

export async function wait(ms: number = 100) {
	await new Promise(resolve => setTimeout(resolve, ms));
}

