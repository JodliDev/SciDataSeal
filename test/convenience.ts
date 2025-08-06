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
}

class MockKysely {
	selectFrom = this.addChain("selectFrom");
	select = this.addChain("select");
	insertInto = this.addChain("insertInto");
	values = this.addChain("values");
	updateTable = this.addChain("updateTable");
	set = this.addChain("set");
	deleteFrom = this.addChain("deleteFrom");
	innerJoin = this.addChain("innerJoin");
	where = this.addChain("where");
	orderBy = this.addChain("orderBy");
	limit = this.addChain("limit");
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
	
	private addChain(method: keyof this) {
		const fn = vi.fn(() => this) as ExtendedMock;
		fn.chain = (...compareArgs: unknown[]) => this.chainMethod(method, ...compareArgs);
		return fn;
	}
	private chainMethod(method: keyof this, ...compareArgs: unknown[]) {
		const instance = new MockKysely();
		const fn = (this[method] as Mock);
		const oldImplementation = fn.getMockImplementation();
		fn.mockImplementation((...args) => {
			oldImplementation?.(...args);
			if(!compareArgs.length || JSON.stringify(args) == JSON.stringify(compareArgs)) {
				return instance;
			}
			else {
				console.log(`Encountered different arguments in ${method.toString()}: ${JSON.stringify(args)}. Expected: ${JSON.stringify(compareArgs)}`);
				return this;
			}
		});
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