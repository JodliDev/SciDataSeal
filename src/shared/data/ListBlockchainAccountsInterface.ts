import GetDataStructureInterface from "../GetDataStructureInterface.ts";

export default interface ListBlockchainAccountsInterface extends GetDataStructureInterface {
	Endpoint: "/listBlockchainAccounts";
	Response: {
		accounts: {blockchainName: string, blockchainAccountId: number}[];
	}
}

