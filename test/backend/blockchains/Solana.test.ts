import {afterAll, afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {Connection, Keypair, PublicKey, sendAndConfirmTransaction} from "@solana/web3.js";
import {compressAndEncrypt} from "../../../src/backend/actions/compressAndEncrypt.ts";
import {randomBytes} from "crypto";
import generateStringDenotation from "../../../src/shared/actions/generateStringDenotation.ts";
import TranslatedException from "../../../src/shared/exceptions/TranslatedException.ts";
import Solana from "../../../src/backend/blockchains/Solana.ts";

describe("Solana", () => {
	const privateKey = "a".repeat(64);
	const publicKey = "solana-public-key";
	const dataKey = randomBytes(32).toString("base64url");
	
	const mockConnection = {
		getBalance: vi.fn(),
		requestAirdrop: vi.fn(),
		confirmTransaction: vi.fn(),
		getSignaturesForAddress: vi.fn(),
		getLatestBlockhash: vi.fn(() => ({
			blockhash: "blockhash",
			lastValidBlockHeight: 1234567890,
		})),
	};
	
	beforeEach(() => {
		vi.mock("@solana/web3.js", () => ({
			Keypair: {
				fromSecretKey: vi.fn(),
			},
			PublicKey: vi.fn(),
			Connection: vi.fn(),
			Transaction: vi.fn(() => ({
				add: vi.fn(),
				sign: vi.fn(),
				serialize: vi.fn(() => "serializedTransaction"),
				send: vi.fn(() => Promise.resolve("transactionSignature")),
				confirm: vi.fn(() => Promise.resolve(null)),
			})),
			sendAndConfirmTransaction: vi.fn(),
			clusterApiUrl: vi.fn(() => "https://api.devnet.solana.com"),
			LAMPORTS_PER_SOL: 1_000_000_000
		}));
		
		vi.mocked(Connection).mockReturnValue(mockConnection as unknown as Connection);
	});
	afterAll(() => {
		vi.restoreAllMocks();
	});
	
	describe("getPublicKey", () => {
		afterEach(() => {
			vi.resetAllMocks();
		});
		
		it("should return a valid public key string for a given private key", async() => {
			vi.mocked(Keypair.fromSecretKey).mockReturnValue({publicKey: {toString: () => publicKey}} as Keypair);
			const instance = new Solana();
			const result = await instance.getPublicKey(privateKey);
			
			expect(result).toBe(publicKey);
			expect(Keypair.fromSecretKey).toBeCalledWith(Buffer.from(privateKey, "hex"));
		});
	});
	
	describe("saveMessage", () => {
		afterEach(() => {
			vi.resetAllMocks();
		});
		
		it("should throw an error when required data is missing", async () => {
			const instance = new Solana();
			await expect(async () => {
				await instance.saveMessage(privateKey, 1, "", false, dataKey);
			}).rejects.toThrow("errorMissingData");
		});
		
		it("should return transaction signatures when saving a valid message", async() => {
			vi.mocked(Keypair.fromSecretKey).mockReturnValue({publicKey: {toString: () => publicKey}} as Keypair);
			mockConnection.getLatestBlockhash.mockResolvedValueOnce({
				blockhash: "blockhash",
				lastValidBlockHeight: 1234567890,
			});
			mockConnection.getBalance.mockResolvedValueOnce(2 * 1_000_000_000);
			vi.mocked(sendAndConfirmTransaction).mockResolvedValue("signature");
			
			const instance = new Solana();
			const result = await instance.saveMessage(privateKey, 1, "testData", false, dataKey);
			
			expect(result).toEqual(["signature"]);
		});
		
		it("should split message, if too long", async() => {
			vi.mocked(Keypair.fromSecretKey).mockReturnValue({publicKey: {toString: () => publicKey}} as Keypair);
			mockConnection.getLatestBlockhash.mockResolvedValueOnce({
				blockhash: "blockhash",
				lastValidBlockHeight: 1234567890,
			});
			mockConnection.getBalance.mockResolvedValueOnce(2 * 1_000_000_000);
			vi.mocked(sendAndConfirmTransaction).mockResolvedValue("signature");
			const data = randomBytes(561).toString("base64");
			const instance = new Solana();
			const result = await instance.saveMessage(privateKey, 1, data, false, dataKey);

			expect(result).toEqual(["signature", "signature"]);
		});
		
		it("should throw if message needs to be split into too many parts", async() => {
			vi.mocked(Keypair.fromSecretKey).mockReturnValue({publicKey: {toString: () => publicKey}} as Keypair);
			mockConnection.getLatestBlockhash.mockResolvedValueOnce({
				blockhash: "blockhash",
				lastValidBlockHeight: 1234567890,
			});
			mockConnection.getBalance.mockResolvedValueOnce(2 * 1_000_000_000);
			vi.mocked(sendAndConfirmTransaction).mockResolvedValue("signature");
			const data = randomBytes(560 * 50 + 1).toString("base64");
			const instance = new Solana();
			
			await expect(async () => {
				await instance.saveMessage(privateKey, 1, data, false, dataKey);
			}).rejects.toThrow("errorMessageIsTooLong");
		});
	});
	
	describe("listData", () => {
		afterEach(() => {
			vi.resetAllMocks();
		});
		
		it("should return an empty array if no signatures are found", async() => {
			mockConnection.getSignaturesForAddress.mockResolvedValueOnce([]);
			
			const instance = new Solana();
			const result = await instance.listData(publicKey, 1, "testDataKey");
			
			expect(result).toEqual([]);
			expect(mockConnection.getSignaturesForAddress).toBeCalledWith(new PublicKey(publicKey));
		});
		
		it("should ignore data with different denotation", async() => {
			const denotation = 62;
			const testData = "testData";
			mockConnection.getSignaturesForAddress.mockResolvedValue([ //Solana returns data reversed
				{blockTime: 1780704000, memo: `[1] ${generateStringDenotation(denotation)}${compressAndEncrypt(testData, dataKey)}`},
				{blockTime: 1709519880, memo: `[1] ${generateStringDenotation(61)}${compressAndEncrypt(testData, dataKey)}`},
			]);
			
			const instance = new Solana();
			const result = await instance.listData(publicKey, denotation, dataKey);
			
			expect(result).toEqual([
				{timestamp: 1780704000, data: testData, isHeader: false},
			]);
		});
		
		it("should concat messages with continue tag", async() => {
			const denotation = 62;
			const testData = "testData";
			const compressedData = compressAndEncrypt(testData, dataKey);
			const splitPos = Math.round(compressedData.length / 2);
			mockConnection.getSignaturesForAddress.mockResolvedValue([ //Solana returns data reversed
				{blockTime: 1709519880, memo: `[1] ${generateStringDenotation(denotation)}${compressedData.substring(splitPos)}`},
				{blockTime: 1780704000, memo: `[1] ${generateStringDenotation(denotation)}${compressedData.substring(0, splitPos)}~`},
			]);
			
			const instance = new Solana();
			const result = await instance.listData(publicKey, denotation, dataKey);
			
			expect(result).toEqual([
				{timestamp: 1709519880, data: testData, isHeader: false},
			]);
		});
		
		it("should try to recover if split data is missing a part", async() => {
			const denotation = 62;
			const testData = "testData";
			mockConnection.getSignaturesForAddress.mockResolvedValue([ //Solana returns data reversed
				{blockTime: 1709519880, memo: `[1] ${generateStringDenotation(denotation)}${compressAndEncrypt(testData, dataKey)}~`},
			]);
			
			const instance = new Solana();
			const result = await instance.listData(publicKey, denotation, dataKey);
			
			expect(result).toEqual([
				{timestamp: 1709519880, data: testData, isHeader: false}
			]);
		});
		
		it("should return the undecrypted string if compressAndEncrypt() fails", async() => {
			const denotation = 62;
			const testData = "testData";
			const compressedData = compressAndEncrypt(testData, dataKey);
			const splitPos = Math.round(compressedData.length / 2);
			const subString = compressedData.substring(0, splitPos);
			mockConnection.getSignaturesForAddress.mockResolvedValue([ //Solana returns data reversed
				{blockTime: 1709519880, memo: `[1] ${generateStringDenotation(denotation)}${subString}~`},
			]);
			
			const instance = new Solana();
			const result = await instance.listData(publicKey, denotation, dataKey);
			
			expect(result).toEqual([
				{timestamp: 1709519880, data: `Cannot decipher: ${subString}`, isHeader: false}
			]);
		});
		
		it("should parse and return line data when signatures are found", async() => {
			const denotation = 62;
			const headerData = "headerData";
			const testData = "testData";
			mockConnection.getSignaturesForAddress.mockResolvedValue([ //Solana returns data reversed
				{blockTime: 1780704000, memo: `[1] ${generateStringDenotation(denotation)}${compressAndEncrypt(testData, dataKey)}`},
				{blockTime: 1709519880, memo: `[1] ${generateStringDenotation(denotation)}${compressAndEncrypt(`~~${headerData}`, dataKey)}`},
			]);
			
			const instance = new Solana();
			const result = await instance.listData(publicKey, denotation, dataKey);
			
			expect(result).toEqual([
				{timestamp: 1709519880, data: headerData, isHeader: true},
				{timestamp: 1780704000, data: testData, isHeader: false},
			]);
		});
	});
	
	describe("uploadMessage", () => {
		afterEach(() => {
			vi.resetAllMocks();
		});
		
		it("should throw an error when the balance is below the required threshold", async () => {
			vi.mocked(Keypair.fromSecretKey).mockReturnValue({publicKey: {toString: () => publicKey}} as Keypair);
			mockConnection.getBalance.mockResolvedValueOnce(0.01 * 1_000_000_000);
			
			const instance = new Solana();
			expect(async () => await (instance as any).uploadMessage(privateKey, "Test Message")).rejects.toThrow(TranslatedException)
		});
		
		it("should successfully upload a message with sufficient balance", async() => {
			vi.mocked(Keypair.fromSecretKey).mockReturnValue({publicKey: {toString: () => publicKey}} as Keypair);
			vi.mocked(sendAndConfirmTransaction).mockResolvedValue("transactionSignature");
			mockConnection.getBalance.mockResolvedValueOnce(2 * 1_000_000_000);
			
			const instance = new Solana();
			const result = await (instance as any).uploadMessage(privateKey, "Test Message");
			
			expect(result).toBe("transactionSignature");
		});
	});
});