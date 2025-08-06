import BlockchainInterface from "../blockchains/BlockchainInterface.ts";
import SolanaTest from "../blockchains/SolanaTest.ts";
import TranslatedException from "../../shared/exceptions/TranslatedException.ts";

/**
 * Retrieves a blockchain instance based on the specified type string.
 *
 * @param type - The type string of blockchain to retrieve.
 * @return} An instance of the requested blockchain type.
 * @throws {TranslatedException} If the provided type is not supported or invalid.
 */
export default function getBlockchain(type: string): BlockchainInterface {
	switch(type) {
		case "solanaTest":
			return new SolanaTest();
		default:
			throw new TranslatedException("errorFaultyData", "blockchainType");
	}
}