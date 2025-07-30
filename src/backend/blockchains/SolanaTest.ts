import BlockchainInterface from "./BlockchainInterface.ts";
import MissingDataException from "../../shared/exceptions/MissingDataException.ts";
import {clusterApiUrl, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, sendAndConfirmTransaction, Transaction} from "@solana/web3.js";
import {createMemoInstruction} from "@solana/spl-memo";
import {createCipheriv, createDecipheriv, randomBytes} from "node:crypto";
import {deflateSync, inflateSync} from "node:zlib";
import MessageIsTooLongException from "../../shared/exceptions/MessageIsTooLongException.ts";

const DATA_MAX_BYTE_LENGTH = 560;
const CONTINUE_TAG = "~";
export default class SolanaTest implements BlockchainInterface {
	private readonly maxTransactionsPerMessage = 50;
	
	private getKeyPair(privateKey: string): Keypair {
		const secretKey = Buffer.from(privateKey, "hex");
		return Keypair.fromSecretKey(secretKey);
	}
	
	private async requestAirdrop(connection: Connection, publicKey: PublicKey): Promise<void> {
		const airdropSignature = await connection.requestAirdrop(
			publicKey,
			LAMPORTS_PER_SOL
		);
		const latestBlockhash = await connection.getLatestBlockhash();
		await connection.confirmTransaction({
			blockhash: latestBlockhash.blockhash,
			lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
			signature: airdropSignature
		});
	}
	
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
	
    async saveMessage(privateKey: string, data: string, dataKey: string): Promise<string[]> {
		if(!data)
			throw new MissingDataException();
		
		//compress:
		//Thanks to https://stackoverflow.com/a/39800991
		const compressed = deflateSync(data);
		
		//encode:
		//Thanks to https://stackoverflow.com/a/78687217
		const iv = randomBytes(16);
		const cipher = createCipheriv("aes-256-cbc", Buffer.from(dataKey, "base64url"), iv);
		const update = cipher.update(compressed);
		const final = cipher.final();
		const encrypted = Buffer.concat([iv, update, final]);
		const result = encrypted.toString("base64");
		
		//figure out the necessary length:
		const textEncoder = new TextEncoder();
		const neededBytes = textEncoder.encode(result).length;
		const neededMessages = neededBytes / DATA_MAX_BYTE_LENGTH;
		const partLength = result.length / neededMessages;
		
		if(neededMessages > this.maxTransactionsPerMessage)
			throw new MessageIsTooLongException();
		//upload (and split, if needed) message:
		const signatures: string[] = [];
		for(let i = 0; i < neededMessages; ++i) {
			const part = result.substring(i * partLength, (i + 1) * partLength);
			signatures.push(await this.uploadMessage(privateKey, part + (i < neededMessages - 1 ? CONTINUE_TAG : "")));
		}
		
		return signatures;
    }
	
	public async listData(publicKey: string, dataKey: string): Promise<string[]> {
		const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
		const signatures = await connection.getSignaturesForAddress(new PublicKey(publicKey));
		
		const output: string[] = [];
		
		const addLine = (line: string) => {
			const ivCiphertext = Buffer.from(line, "base64url");
			const iv = ivCiphertext.subarray(0, 16);
			const ciphertext = ivCiphertext.subarray(16);
			const cipher = createDecipheriv("aes-256-cbc", Buffer.from(dataKey, "base64url"), iv);
			const decrypted = Buffer.concat([cipher.update(ciphertext), cipher.final()]);
			
			const decompressed = inflateSync(decrypted).toString();
			output.push(decompressed);
		}
		
		let temp = "";
		for(const sig of signatures.reverse()) {
			try {
				const memo = sig.memo?.match(/\[\d+] (.+)/)?.[1] ?? "";
				
				if(memo.endsWith(CONTINUE_TAG)) {
					temp += memo.substring(0, memo.length - CONTINUE_TAG.length);
				}
				else {
					addLine(temp + memo);
					temp = "";
				}
			}
			catch(e) {
				output.push(`Invalid line: ${sig.memo}`);
			}
		}
		
		return output;
	}
	
	public async getPublicKey(privateKey: string): Promise<string> {
		const keyPair = this.getKeyPair(privateKey);
		return keyPair.publicKey.toString();
	}
}