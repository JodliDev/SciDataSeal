import BlockchainInterface from "../../blockchains/BlockchainInterface.ts";
import SolanaTest from "../../blockchains/SolanaTest.ts";
import TranslatedException from "../../../shared/exceptions/TranslatedException.ts";

export default function getBlockchain(type: string): BlockchainInterface {
	switch(type) {
		case "solanaTest":
			return new SolanaTest();
		default:
			throw new TranslatedException("errorFaultyData", "blockchainType");
	}
}