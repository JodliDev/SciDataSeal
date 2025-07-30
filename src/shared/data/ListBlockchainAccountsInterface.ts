import GetDataStructureInterface from "../GetDataStructureInterface.ts";

export default interface ListBlockchainAccountsInterface extends GetDataStructureInterface {
	Response: {
		accounts: {blockchainName: string, blockchainAccountId: number}[];
	}
}

