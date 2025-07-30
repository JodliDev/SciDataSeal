import {Generated, Insertable} from "kysely";
import {ForeignKey, TableClass} from "sqlmorpheus";
import {UserTable} from "./User.ts";

export default interface BlockchainAccount {
	blockchainAccountId: Generated<number>;
	userId: number;
	blockchainName: string;
	blockchainType: string;
	privateKey: string;
	publicKey: string;
	highestDenotation: number;
}


@TableClass("BlockchainAccount", "blockchainAccountId")
export class BlockchainAccountTable implements Insertable<BlockchainAccount> {
	blockchainAccountId = 0;
	@ForeignKey(UserTable, "userId", {onDelete: "CASCADE"})
	userId = 0;
	blockchainName = "";
	blockchainType = "";
	privateKey = "";
	publicKey = "";
	highestDenotation = 0;
}