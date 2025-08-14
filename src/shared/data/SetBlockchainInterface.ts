import PostDataStructureInterface from "../PostDataStructureInterface.ts";

export default interface SetBlockchainInterface extends PostDataStructureInterface {
	Endpoint: "/setBlockchainAccount";
	Request: {
		id?: number;
		blockchainName: string;
		blockchainType: string;
		privateKey: string;
	}
	Response: {
		blockchainAccountId: number;
	}
}

