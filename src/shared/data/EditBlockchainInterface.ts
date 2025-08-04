import PostDataStructureInterface from "../PostDataStructureInterface.ts";

export default interface EditBlockchainInterface extends PostDataStructureInterface {
	Endpoint: "/editBlockchainAccount";
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

