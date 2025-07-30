import PostDataStructureInterface from "../PostDataStructureInterface.ts";

export default interface EditBlockchainInterface extends PostDataStructureInterface {
	Request: {
		blockchainAccountId?: number;
		blockchainName: string;
		blockchainType: string;
		privateKey: string;
	}
	Response: {
		blockchainAccountId: number;
	}
}

