import BlockchainInterface, {LineData} from "./BlockchainInterface.ts";
import {clusterApiUrl, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, sendAndConfirmTransaction, Transaction} from "@solana/web3.js";
import {createMemoInstruction} from "@solana/spl-memo";
import generateStringDenotation from "../../shared/actions/generateStringDenotation.ts";
import TranslatedException from "../../shared/exceptions/TranslatedException.ts";
import {compressAndEncrypt, decompressAndDecrypt} from "../actions/compressAndEncrypt.ts";

const DATA_MAX_BYTE_LENGTH = 560;
const CONTINUE_TAG = "~";
const HEADER_TAG = "~~";

/**
 * This class provides functionality for interacting with the Solana blockchain using their Dev environment.
 */
export default class SolanaTest implements BlockchainInterface {
	private readonly maxTransactionsPerMessage = 50;
	
	/**
	 * Generates a Keypair object from the provided private key.
	 * Mainly used to generate a public key.
	 *
	 * @param privateKey - A hexadecimal string representing the private key.
	 * @return The generated Keypair object.
	 */
	private getKeyPair(privateKey: string): Keypair {
		const secretKey = Buffer.from(privateKey, "hex");
		return Keypair.fromSecretKey(secretKey);
	}
	
	/**
	 * Requests an airdrop for the specified public key and confirms the transaction.
	 *
	 * @param connection - The connection object to interact with the Solana cluster.
	 * @param publicKey - The public key to receive the airdrop.
	 */
	private async requestAirdrop(connection: Connection, publicKey: PublicKey): Promise<void> {
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
	
	/**
	 * Uploads a message to the Solana blockchain by creating a memo transaction.
	 *
	 * @param privateKey The private key used to sign the transaction.
	 * @param message The message to be uploaded to the blockchain.
	 * @return A promise that resolves to the transaction signature string after the transaction is confirmed.
	 */
	private async uploadMessage(privateKey: string, message: string): Promise<string> {
		const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
		const keyPair = this.getKeyPair(privateKey);
		
		const balance = await connection.getBalance(keyPair.publicKey);
		if (balance < 0.02 * LAMPORTS_PER_SOL) {
			console.log("Insufficient funds, requesting airdrop...");
			await this.requestAirdrop(connection, keyPair.publicKey);
		}
		
		const transaction = new Transaction().add(
			createMemoInstruction(message) //https://www.solana-program.com/docs/memo
		);
		
		// Send and confirm the transaction and return signature
		return await sendAndConfirmTransaction(
			connection,
			transaction,
			[keyPair]
		);
	}
	
	public async saveMessage(privateKey: string, intDenotation: number, data: string, isHeader: boolean, dataKey: string): Promise<string[]> {
		if(!data) {
			throw new TranslatedException("errorMissingData");
		}
		
		const denotation = generateStringDenotation(intDenotation);
		const result = compressAndEncrypt(`${isHeader ? HEADER_TAG : ""}${data}`, dataKey);
		
		//figure out the necessary length:
		const textEncoder = new TextEncoder();
		const neededBytes = textEncoder.encode(result).length;
		const neededMessages = Math.ceil(neededBytes / DATA_MAX_BYTE_LENGTH);
		const partLength = result.length / neededMessages;
		
		if(neededMessages > this.maxTransactionsPerMessage) {
			throw new TranslatedException("errorMessageIsTooLong");
		}
		//upload (and split, if needed) message:
		const signatures: string[] = [];
		for(let i = 0; i < neededMessages; ++i) {
			const part = result.substring(i * partLength, (i + 1) * partLength);
			const endTag = i < neededMessages - 1 ? CONTINUE_TAG : "";
			signatures.push(await this.uploadMessage(privateKey, denotation + part + endTag));
		}
		
		return signatures;
    }
	
	public async listData(publicKey: string, intDenotation: number, dataKey: string): Promise<LineData[]> {
		const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
		const signatures = await connection.getSignaturesForAddress(new PublicKey(publicKey));
		const denotation = generateStringDenotation(intDenotation);
		const denotationLength = denotation.length;
		
		const output: LineData[] = [];
		
		const addLine = (timestamp: number, line: string) => {
			try {
				const decompressed = decompressAndDecrypt(line, dataKey)
				
				if(decompressed.startsWith(HEADER_TAG)) {
					output.push({
						timestamp: timestamp,
						data: decompressed.substring(HEADER_TAG.length),
						isHeader: true
					});
				} else {
					output.push({
						timestamp: timestamp,
						data: decompressed,
						isHeader: false
					});
				}
			}
			catch {
				output.push({
					timestamp: timestamp,
					data: `Cannot decipher: ${line}`,
					isHeader: false
				});
			}
		}
		
		let temp = "";
		for(const sig of signatures.reverse()) {
			const memo = sig.memo?.match(/\[\d+] (.+)/)?.[1] ?? "";
			const memoDenotation = memo.substring(0, denotationLength);
			if(memoDenotation != denotation) {
				continue;
			}
			const message = memo.substring(denotationLength);
			
			if(message.endsWith(CONTINUE_TAG)) {
				temp += message.substring(0, message.length - CONTINUE_TAG.length);
			}
			else {
				addLine(sig.blockTime ?? 0, temp + message);
				temp = "";
			}
		}
		
		if(temp) { //this should never happen
			addLine(signatures[0].blockTime ?? 0, temp);
		}
		
		return output;
	}
	
	public async getPublicKey(privateKey: string): Promise<string> {
		const keyPair = this.getKeyPair(privateKey);
		return keyPair.publicKey.toString();
	}
}