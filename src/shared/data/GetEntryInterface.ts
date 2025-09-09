import GetDataStructureInterface from "../GetDataStructureInterface.ts";

export interface GetDefinitions {
	blockchainAccount: {
		Response: {
			blockchainAccountId: number;
			blockchainName: string;
			blockchainType: string;
			publicKey: string;
			highestDenotation: number;
		}
	}
	questionnaire: {
		Response: {
			questionnaireId: number;
			studyId: number;
			questionnaireName: string;
			blockchainAccountId: number;
			blockchainDenotation: number;
			dataKey: string;
			columns: string | null;
		}
	}
	study: {
		Response: {
			studyId: number;
			studyName: string;
			apiPassword: string;
			dataKey: string;
			blockchainAccountId: number;
		}
	}
	user: {
		Response: {
			userId: number;
			username: string;
			isAdmin: boolean;
		}
	}
}
export default interface GetEntryInterface<T extends keyof GetDefinitions> extends GetDataStructureInterface {
	Endpoint: "/getEntry";
	Query: {
		id: string;
		type: keyof GetDefinitions;
	}
	Response: GetDefinitions[T]["Response"]
}

