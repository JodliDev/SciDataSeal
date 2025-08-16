/**
 * Constructs a URL for accessing the blockchain signature on the appropriate blockchain explorer.
 *
 * @param {string} type - The type of blockchain.
 * @param {string} signatureId - The unique transaction signature identifier.
 * @return {string} The URL to access the transaction details on the respective blockchain explorer.
 * @throws {Error} Throws an error if the provided blockchain type is unsupported.
 */
export default function getBlockchainSignatureUrl(type: string, signatureId: string): string {
	switch(type) {
		case "solanaTest":
			return `https://explorer.solana.com/tx/${signatureId}?cluster=devnet`;
		case "solana":
			return `https://explorer.solana.com/tx/${signatureId}`;
		default:
			throw new Error("Unsupported blockchain type");
	}
}