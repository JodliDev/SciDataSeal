import PostDataStructureInterface from "../PostDataStructureInterface.ts";

export default interface SetBlockchainInterface extends PostDataStructureInterface {
	Endpoint: "/setBlockchainAccount";
	Request: {
		id?: number;
		blockchainName: string;
		blockchainType: string;
		useExisting?: boolean;
		mnemonic?: string;
	}
	Response: {
		mnemonic?: string;
		blockchainAccountId: number;
	}
}

