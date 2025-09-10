import GetDataStructureInterface from "../GetDataStructureInterface.ts";

export default interface GetBalance extends GetDataStructureInterface {
	Endpoint: "/getBalance";
	Query: {
		blockchainAccountId: string
	}
	Response: {
		balance: number
	}
}

