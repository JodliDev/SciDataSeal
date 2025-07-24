import BlockchainInterface from "./BlockchainInterface.ts";
import MissingDataException from "../../shared/exceptions/MissingDataException.ts";
import {clusterApiUrl, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, sendAndConfirmTransaction, Transaction} from "@solana/web3.js";
import {createMemoInstruction} from "@solana/spl-memo";
import {createCipheriv, randomBytes} from "node:crypto";
import {deflateSync} from "node:zlib";
import MessageIsTooLongException from "../../shared/exceptions/MessageIsTooLongException.ts";

const DATA_MAX_BYTE_LENGTH = 560;
export default class SolanaTest implements BlockchainInterface {
	private readonly maxTransactionsPerMessage = 50;
	private readonly privateKey: string;
	
	constructor(privateKey: string) {
		this.privateKey = privateKey;
	}
	
	getKeyPair() {
		const secretKey = Buffer.from(this.privateKey, "hex");
		return Keypair.fromSecretKey(secretKey);
	}
	
	async requestAirdrop(connection: Connection, publicKey: PublicKey) {
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
	
	private async uploadMessage(message: string): Promise<string> {
		const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
		const keyPair = this.getKeyPair();
		
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
	
    async saveMessage(data: string, dataKey: string): Promise<string[]> {
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
		
		//figure out necessary length:
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
			signatures.push(await this.uploadMessage(part + (i < neededMessages - 1 ? "~" : "")));
		}
		
		return signatures;
    }

}