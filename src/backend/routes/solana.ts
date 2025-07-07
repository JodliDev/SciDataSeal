import express from "express";
import {Connection, Transaction, sendAndConfirmTransaction, Keypair, LAMPORTS_PER_SOL, PublicKey, clusterApiUrl} from "@solana/web3.js";
import {ResponseData} from "../../shared/ResponseData.ts";
import {createMemoInstruction} from "@solana/spl-memo";

const router = express.Router();

const privateKey = "b7b8a61487ba522eb8c84c6c4ce95ff360b3b9aa715d28ecac7e17c1b7158057a6476542a8da3602997b417e42be0c5ff812e417a1afcf4c3e84ce371fbcf902";

async function getKeyPair(connection: Connection, secretKeyHex?: string) {
	if(secretKeyHex) {
		// // const publicKeyString = fromWallet.publicKey.toBase58()
		// // const publicKey = new PublicKey(publicKeyString);
		const secretKey = Buffer.from(secretKeyHex, 'hex');
		return Keypair.fromSecretKey(secretKey);
	}
	else {
		const fromWallet = Keypair.generate();
		console.log("Public key:", fromWallet.publicKey.toBase58());
		console.log("Secret key:", Buffer.from(fromWallet.secretKey).toString('hex'));
		
		await requestAirdrop(connection, fromWallet.publicKey);
		
		return fromWallet;
	}
}

async function requestAirdrop(connection: Connection, publicKey: PublicKey) {
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

router.post("/solana", async (request, response) => {
	try {
		const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
		
		const { data } = request.body;
		
		if (!data) {
			response.status(400).json({ok: false, error: "Data is required in the request body"});
			return;
		}
		
		const keyPair = await getKeyPair(connection, privateKey);
		
		
		let balance = await connection.getBalance(keyPair.publicKey);
		if (balance < 0.02 * LAMPORTS_PER_SOL) {
			console.log('Insufficient funds, requesting airdrop...');
			await requestAirdrop(connection, keyPair.publicKey)
		} else {
			console.log('Sufficient funds available, skipping airdrop.');
		}
		
		const transaction = new Transaction().add(
			createMemoInstruction(data, [keyPair.publicKey]),
		)
		
		// Send and confirm the transaction
		const signature = await sendAndConfirmTransaction(
			connection,
			transaction,
			[keyPair]
		);
		
		response.json({
			ok: true,
			data: {
				signature,
				transactionUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`
			}
		} satisfies ResponseData);
		
	} catch (error) {
		console.trace('Error saving to Solana:', error);
		response.status(500).json({
			ok: false,
			error: 'Failed to save data to Solana blockchain'
		} satisfies ResponseData);
	}
});


router.get("/solana", async(_request, response) => {
	try {
		const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
		const keyPair = await getKeyPair(connection, privateKey);
		const signatures = await connection.getSignaturesForAddress(keyPair.publicKey);
		
		response.json({
			ok: true,
			data: signatures.map(sig => sig.memo)
		} satisfies ResponseData);
		
	} catch(error) {
		console.error('Error fetching from Solana:', error);
		response.status(500).json({
			ok: false,
			error: 'Failed to fetch data from Solana blockchain'
		} satisfies ResponseData);
	}
});

export default router;
