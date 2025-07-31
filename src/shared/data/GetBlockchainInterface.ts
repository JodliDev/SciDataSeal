import GetDataStructureInterface from "../GetDataStructureInterface.ts";

export default interface GetBlockchainInterface extends GetDataStructureInterface {
	Endpoint: "/getBlockchainAccount";
	Query: {
		accountId: string;
	}
	Response: {
		blockchainAccountId: number;
		blockchainName: string;
		blockchainType: string;
		privateKey: string;
		publicKey: string;
		highestDenotation: number;
	}
}

