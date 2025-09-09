import GetDataStructureInterface from "../GetDataStructureInterface.ts";

export interface ListDefinitions {
	users: {
		Query: {}
		Response: {}
	}
	questionnaires: {
		Query: {
			studyId?: string;
		}
		Response: {}
	}
	studies: {
		Query: {}
		Response: {}
	}
	blockchainAccounts: {
		Query: {}
		Response: {}
	}
	dataLogs: {
		Query: {
			questionnaireId: string;
		}
		Response: {
			blockchainAccountId: number;
			blockchainType: string;
			signatures: string;
			isHeader: boolean;
			wasSent: boolean;
			hasError: string | null;
			wasConfirmed: boolean;
		}
	}
}

interface DefaultResponse {
	id: number;
	label: string | number;
}

interface DefaultQueryValues<T extends keyof ListDefinitions> {
	type: T
	page?: string
}

/**
 * Just some trickery to make TypeScript happy.
 * Using `DefaultQueryValues<T> & ListDefinitions[T]["Query"]` would lead to
 * `Interface ListEntriesInterface<T> incorrectly extends interface GetDataStructureInterface`
 */
type DefaultObject<T extends keyof ListDefinitions> = {
	[K in keyof DefaultQueryValues<T>]: DefaultQueryValues<T>[K]
}
type ListDefinitionsObject<T extends keyof ListDefinitions> = {
	[K in keyof ListDefinitions[T]["Query"]]: ListDefinitions[T]["Query"][K]
}

export default interface ListEntriesInterface<T extends keyof ListDefinitions> extends GetDataStructureInterface {
	Endpoint: "/listEntries";
	Query: DefaultObject<T> & ListDefinitionsObject<T>;
	Response: {
		totalCount: number;
		list: (
			DefaultResponse & ListDefinitions[T]["Response"]
		)[];
	}
}

//For easy access:
export type ListResponseType<T extends keyof ListDefinitions = keyof ListDefinitions> = ListEntriesInterface<T>["Response"]["list"];
export type ListResponseEntryType<T extends keyof ListDefinitions = keyof ListDefinitions> = ListResponseType<T>[number];