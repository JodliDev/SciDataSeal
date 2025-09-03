import BlockchainInterface, {LineData} from "./BlockchainInterface.ts";
import {clusterApiUrl, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, sendAndConfirmTransaction, Transaction} from "@solana/web3.js";
import {createMemoInstruction} from "@solana/spl-memo";
import generateStringDenotation from "../../shared/actions/generateStringDenotation.ts";
import TranslatedException from "../../shared/exceptions/TranslatedException.ts";
import {decompressAndDecrypt} from "../actions/compressAndEncrypt.ts";

const DATA_MAX_BYTE_LENGTH = 560;
const CONTINUE_TAG = "~";
const HEADER_TAG = "~~";

/**
 * This class provides functionality for interacting with the Solana blockchain.
 */
export default class Solana implements BlockchainInterface {
	private readonly maxTransactionsPerMessage = 50;
	
	/**
	 * Retrieves the API URL for the cluster.
	 *
	 * @return {string} The URL of the cluster API.
	 */
	protected getUrl(): string {
		return clusterApiUrl();
	}
	
	/**
	 * Handles the situation where there are insufficient funds for a transaction.
	 * Meant to be overridden by SolanaTest.
	 *
	 * @param _connection - The connection to the Solana blockchain.
	 * @param _publicKey - The public key of the account requiring funds.
	 * @return A promise that resolves once the insufficient funds handling is complete.
	 */
	protected async handleInsufficientFunds(_connection: Connection, _publicKey: PublicKey): Promise<void> {
		throw new TranslatedException("errorInsufficientFunds");
	}
	
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
	 * Uploads a message to the Solana blockchain by creating a memo transaction.
	 *
	 * @param privateKey The private key used to sign the transaction.
	 * @param message The message to be uploaded to the blockchain.
	 * @return A promise that resolves to the transaction signature string after the transaction is confirmed.
	 */
	private async uploadMessage(privateKey: string, message: string): Promise<string> {
		const connection = new Connection(this.getUrl(), "confirmed");
		const keyPair = this.getKeyPair(privateKey);
		
		const balance = await connection.getBalance(keyPair.publicKey);
		if(balance < 0.02 * LAMPORTS_PER_SOL) {
			await this.handleInsufficientFunds(connection, keyPair.publicKey);
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
	
	public async saveMessage(privateKey: string, intDenotation: number, data: string, isHeader: boolean): Promise<string[]> {
		if(!data) {
			throw new TranslatedException("errorMissingData");
		}
		if(isHeader) {
			data = `${HEADER_TAG}${data}`;
		}
		
		const denotation = generateStringDenotation(intDenotation);
		
		//figure out the necessary length:
		const textEncoder = new TextEncoder();
		const neededBytes = textEncoder.encode(data).length;
		const neededMessages = Math.ceil(neededBytes / DATA_MAX_BYTE_LENGTH);
		const partLength = data.length / neededMessages;
		
		if(neededMessages > this.maxTransactionsPerMessage) {
			throw new TranslatedException("errorMessageIsTooLong");
		}
		//upload (and split, if needed) message:
		const signatures: string[] = [];
		for(let i = 0; i < neededMessages; ++i) {
			const part = data.substring(i * partLength, (i + 1) * partLength);
			const endTag = i < neededMessages - 1 ? CONTINUE_TAG : "";
			signatures.push(await this.uploadMessage(privateKey, denotation + part + endTag));
		}
		
		return signatures;
    }
	
	public isConfirmed(): Promise<Awaited<boolean>> {
		return Promise.resolve(true); //Solana is always confirmed
	}
	
	private decipherLine(original: string, dataKey: string): Omit<LineData, "timestamp"> {
		try {
			if(original.startsWith(HEADER_TAG)) {
				return {
					data: decompressAndDecrypt(original.substring(HEADER_TAG.length), dataKey),
					isHeader: true
				};
			}
			else {
				return {
					data: decompressAndDecrypt(original, dataKey),
					isHeader: false
				};
			}
		}
		catch {
			return {
				data: `Cannot decipher: ${original}`,
				isHeader: false
			};
		}
	}
	
	public async listData(publicKey: string, intDenotation: number, dataKey: string): Promise<LineData[]> {
		const connection = new Connection(this.getUrl(), "confirmed");
		const signatures = await connection.getSignaturesForAddress(new PublicKey(publicKey));
		const denotation = generateStringDenotation(intDenotation);
		const denotationLength = denotation.length;
		
		const output: LineData[] = [];
		
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
				output.push({
					timestamp: sig.blockTime ?? 0,
					...this.decipherLine(temp + message, dataKey)
				});
				temp = "";
			}
		}
		
		if(temp) { //this should never happen
			output.push({
				timestamp: signatures[0].blockTime ?? 0,
				...this.decipherLine(temp, dataKey)
			});
		}
		
		return output;
	}
	
	public async getPublicKey(privateKey: string): Promise<string> {
		const keyPair = this.getKeyPair(privateKey);
		return keyPair.publicKey.toString();
	}
}