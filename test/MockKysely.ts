import {Mock, vi} from "vitest";
import {DbType} from "../src/backend/database/setupDb.ts";

type Procedure = (...args: any[]) => any;

interface ExtendedMock<T extends Procedure = Procedure> extends Mock<T> {
	chain: (...args: any[]) => MockKysely;
	___lastChain?: (...args: any[]) => MockKysely;
	___mockedArgs: Record<string, MockKysely>;
}

type MockKyselyFn = Omit<ExtendedMock, "___lastChain" | "___mockedArgs">;

abstract class Comparer {
	protected readonly source: unknown;
	
	constructor(value: unknown) {
		this.source = value;
	}
	
	abstract compareWith(value: unknown): boolean;
}

class Exact extends Comparer {
	compareWith(value: unknown): boolean {
		return JSON.stringify(value) == JSON.stringify(this.source);
	}
}

class ObjectContains extends Comparer {
	constructor(value: object) {
		super(value);
	}
	
	compareWith(value: object): boolean {
		const objValue = value as object;
		const objSource = this.source as object;
		for(const key in objSource) {
			if(objValue[key as keyof object] != objSource[key as keyof object]) {
				return false;
			}
		}
		return true;
	}
}

/**
 * Mock class for Kysely that can mock chain method calls.
 *
 * Usage examples:
 * ```
 * const mockDb = mockKysely();
 *
 * // Mock return value:
 * mockDb
 *  .selectFrom.chain("table")
 * 	.where.chain("column1", "=", "data1")
 * 	.executeTakeFirst
 * 	.mockReturnValue("returnData");
 *
 *
 * // Assert call signature:
 * const updateTableMock = mockDb
 *  .updateTable.chain("table")
 *  .set.chain(compare.objectContains({"column1": "data1"}))
 * 	.where.chain("column1", "=", "data1")
 *  .set;
 *
 * expect(updateTableMock).toHaveBeenCalledWith({"column2": "data2"});
 * ```
 */
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
			const prop = this[key as keyof MockKysely] as ExtendedMock;
			if(!prop.hasOwnProperty("mockReset")) {
				continue;
			}
			prop.mockReset();
			prop.___lastChain = undefined;
			prop.___mockedArgs = {};
		}
	}
	
	private makeChainable(): MockKyselyFn {
		const fn = vi.fn(() => this) as ExtendedMock;
		fn.___mockedArgs = {};
		fn.chain = (...compareArgs: unknown[]) => this.chainMethod(fn, ...compareArgs);
		return fn;
	}
	
	private chainMethod(fn: ExtendedMock, ...compareArgs: unknown[]): MockKysely {
		function argsAreEqual(argsSource: unknown[], argsReceived: unknown[]): boolean {
			if(argsSource.length !== argsReceived.length) {
				return false;
			}
			for(let i = 0; i < argsSource.length; ++i) {
				const source: Comparer = argsSource[i] instanceof Comparer ? argsSource[i] as Comparer : new Exact(argsSource[i]);
				if(!source.compareWith(argsReceived[i])) {
					return false;
				}
			}
			return true;
		}
		
		const argsString = JSON.stringify(compareArgs);
		if(fn.___mockedArgs.hasOwnProperty(argsString)) {
			return fn.___mockedArgs[argsString];
		}
		
		const instance = new MockKysely();
		fn.___mockedArgs[argsString] = instance;
		const oldImplementation = fn.___lastChain;
		const newImplementation = (...args: any[]) => {
			if(!compareArgs.length || argsAreEqual(compareArgs, args)) {
				return instance;
			} else if(oldImplementation) {
				return oldImplementation(...args);
			} else {
				console.trace(`Could not find chain with arguments:\n${JSON.stringify(args)}.`);
				return this;
			}
		};
		fn.___lastChain = newImplementation;
		fn.mockImplementation(newImplementation);
		return instance;
	}
}

export function mockKysely(): DbType & MockKysely {
	return new MockKysely() as any;
}
export const compare = {
	objectContains: (value: object) => new ObjectContains(value)
};