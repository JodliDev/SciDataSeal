import {clusterApiUrl, Connection, LAMPORTS_PER_SOL, PublicKey} from "@solana/web3.js";
import Solana from "./Solana.ts";
import {Logger} from "../Logger.ts";


/**
 * This class provides functionality for interacting with the Solana blockchain using their Dev environment.
 */
export default class SolanaTest extends Solana {
	
	protected getUrl(): string {
		return clusterApiUrl("devnet");
	}
	
	protected async handleInsufficientFunds(connection: Connection, publicKey: PublicKey): Promise<void> {
		await this.requestAirdrop(connection, publicKey);
	}
	
	/**
	 * Requests an airdrop for the specified public key and confirms the transaction.
	 *
	 * @param connection - The connection object to interact with the Solana cluster.
	 * @param publicKey - The public key to receive the airdrop.
	 */
	private async requestAirdrop(connection: Connection, publicKey: PublicKey): Promise<void> {
		Logger.log(`Requesting airdrop for ${publicKey.toBase58()}`);
		const airdropSignature = await connection.requestAirdrop(
			publicKey,
			LAMPORTS_PER_SOL
		);
		const latestBlockHash = await connection.getLatestBlockhash();
		await connection.confirmTransaction({
			blockhash: latestBlockHash.blockhash,
			lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
			signature: airdropSignature
		});
	}
}