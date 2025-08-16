import {Mock, vi} from "vitest";
import {DbType} from "../src/backend/database/setupDb.ts";


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

type Procedure = (...args: any[]) => any;
interface ExtendedMock<T extends Procedure = Procedure> extends Mock<T> {
	chain: (...args: any[]) => MockKysely;
	___lastChain: (...args: any[]) => MockKysely
}

class MockKysely {
	selectFrom = this.makeChainable();
	select = this.makeChainable();
	insertInto = this.makeChainable();
	values = this.makeChainable();
	updateTable = this.makeChainable();
	set = this.makeChainable();
	deleteFrom = this.makeChainable();
	innerJoin = this.makeChainable();
	where = this.makeChainable();
	orderBy = this.makeChainable();
	offset = this.makeChainable();
	limit = this.makeChainable();
	fn = {
		countAll: vi.fn(() => this.fn),
		as: vi.fn(() => this.fn)
	}
	
	executeTakeFirst = vi.fn();
	execute = vi.fn();
	
	public resetMocks() {
		for(const key in this) {
			const prop = this[key as keyof MockKysely] as Mock;
			if(!prop.hasOwnProperty("mockReset"))
				continue;
			prop.mockReset();
		}
	}
	
	private makeChainable() {
		const fn = vi.fn(() => this) as ExtendedMock;
		fn.chain = (...compareArgs: unknown[]) => this.chainMethod(fn, ...compareArgs);
		return fn;
	}
	private chainMethod(fn: ExtendedMock, ...compareArgs: unknown[]) {
		const instance = new MockKysely();
		const oldImplementation = fn.___lastChain;
		const newImplementation = (...args: any[]) => {
			if(!compareArgs.length || JSON.stringify(args) == JSON.stringify(compareArgs)) {
				return instance;
			}
			else if(oldImplementation) {
				return oldImplementation(...args);
			}
			else {
				console.trace(`Could not find chain with arguments:\n${JSON.stringify(args)}.\nExpected (in first chain):\n${JSON.stringify(compareArgs)}`);
				return this;
			}
		};
		fn.___lastChain = newImplementation;
		fn.mockImplementation(newImplementation);
		return instance;
	}
	public mockResolvedChainValue(method: "executeTakeFirst" | "execute", value: unknown) {
		const instance = new MockKysely();
		// this[method].mockResolvedValue(instance);
		instance[method] = vi.fn().mockResolvedValue(value);
		return instance;
	}
}
export function mockKysely(): DbType & MockKysely {
	return new MockKysely() as any;
}