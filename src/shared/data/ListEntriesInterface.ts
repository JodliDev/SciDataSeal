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
}

export default interface ListEntriesInterface<T extends keyof ListDefinitions> extends GetDataStructureInterface {
	Endpoint: "/listEntries";
	Query: {
		type: T;
	} & ListDefinitions[T]["Query"];
	Response: {
		list: (
			{
				id: number;
				label: string;
			} & ListDefinitions[T]["Response"]
		)[];
	}
}