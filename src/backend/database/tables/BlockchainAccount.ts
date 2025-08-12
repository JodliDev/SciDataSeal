import {Generated, Insertable} from "kysely";
import {TableClass} from "sqlmorpheus";

export default interface BlockchainAccount {
	blockchainAccountId: Generated<number>;
	blockchainName: string;
	blockchainType: string;
	privateKey: string;
	publicKey: string;
	highestDenotation: number;
}


@TableClass("BlockchainAccount", "blockchainAccountId")
export class BlockchainAccountTable implements Insertable<BlockchainAccount> {
	blockchainAccountId = 0;
	blockchainName = "";
	blockchainType = "";
	privateKey = "";
	publicKey = "";
	highestDenotation = 0;
}