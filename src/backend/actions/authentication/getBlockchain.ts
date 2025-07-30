import BlockchainInterface from "../../blockchains/BlockchainInterface.ts";
import SolanaTest from "../../blockchains/SolanaTest.ts";
import FaultyDataException from "../../../shared/exceptions/FaultyDataException.ts";

export default function getBlockchain(type: string): BlockchainInterface {
	switch(type) {
		case "solanaTest":
			return new SolanaTest();
		default:
			throw new FaultyDataException("blockchainType");
	}
}