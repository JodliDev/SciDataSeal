import {afterAll, afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {Connection, Keypair, PublicKey, sendAndConfirmTransaction} from "@solana/web3.js";
import {compressAndEncrypt, decompressAndDecrypt} from "../../../src/backend/actions/compressAndEncrypt.ts";
import {randomBytes} from "crypto";
import generateStringDenotation from "../../../src/shared/actions/generateStringDenotation.ts";
import TranslatedException from "../../../src/shared/exceptions/TranslatedException.ts";
import Solana from "../../../src/backend/blockchains/Solana.ts";
import {generateMnemonic} from "bip39";

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
				fromSeed: vi.fn()
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
	vi.mock("bip39", () => ({
		generateMnemonic: vi.fn(() => "mockedMnemonic"),
		mnemonicToSeedSync: vi.fn(() => Buffer.from("privateKey"))
	}))
	afterAll(() => {
		vi.restoreAllMocks();
	});
	
	describe("createWallet", () => {
		afterEach(() => {
			vi.resetAllMocks();
		});
		
		it("should return a new mnemonic if none was provided", async() => {
			vi.mocked(Keypair.fromSeed).mockReturnValue({
				secretKey: Buffer.from(privateKey, "hex"),
				publicKey: {toBase58: () => publicKey}
			} as any);
			const instance = new Solana();
			const result = await instance.createWallet();
			
			expect(result).toEqual({
				mnemonic: "mockedMnemonic",
				privateKey: privateKey,
				publicKey: publicKey,
			});
		});
		
		it("should reuse mnemonic if one was provided", async() => {
			vi.mocked(Keypair.fromSeed).mockReturnValue({
				secretKey: Buffer.from(privateKey, "hex"),
				publicKey: {toBase58: () => publicKey}
			} as any);
			const instance = new Solana();
			const result = await instance.createWallet("providedMnemonic");
			
			expect(result).toEqual({
				mnemonic: "providedMnemonic",
				privateKey: privateKey,
				publicKey: publicKey,
			});
			expect(generateMnemonic).not.toHaveBeenCalled();
		});
	});
	
	describe("getDataString", () => {
		it("should add a HEADER_TAG when needed", async() => {
			const data = ["testData1", "testData2"];
			const instance = new Solana();
			
			const headerString = (instance as any).getDataString(data, true, dataKey);
			expect(decompressAndDecrypt(headerString, dataKey)).toBe(";" + data.join("\n"));
			
			const notHeaderString = (instance as any).getDataString(data, false, dataKey);
			expect(decompressAndDecrypt(notHeaderString, dataKey)).toBe(data.join("\n"));
		});
	});
	describe("saveMessage", () => {
		afterEach(() => {
			vi.resetAllMocks();
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
			const result = await instance.saveMessage(privateKey, 1, ["testData"], false, dataKey);
			
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
			const data = "Will be set by getDataString";
			const part1 = "q".repeat(560);
			const part2 = "w".repeat(560);
			const part3 = "e".repeat(560);
			const instance = new Solana();
			(instance as any).getDataString = () => part1 + part2 + part3;
			const mockUploadMessage = vi.spyOn(instance as any, "uploadMessage");
			const result = await instance.saveMessage(privateKey, 1, [data], false, dataKey);

			expect(result).toEqual(["signature", "signature", "signature"]);
			expect(mockUploadMessage).toHaveBeenCalledWith(privateKey, expect.stringMatching(new RegExp(`1${part1}~`)));
			expect(mockUploadMessage).toHaveBeenCalledWith(privateKey, expect.stringMatching(new RegExp(`1~${part2}~`)));
			expect(mockUploadMessage).toHaveBeenCalledWith(privateKey, expect.stringMatching(new RegExp(`1~${part3}`)));
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
				await instance.saveMessage(privateKey, 1, [data], false, dataKey);
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
			mockConnection.getSignaturesForAddress.mockResolvedValue([ //Solana returns data reversed
				{blockTime: 1709519880, memo: `[1] ${generateStringDenotation(denotation)}~${compressedData.substring(4)}`},
				{blockTime: 1780704000, memo: `[1] ${generateStringDenotation(denotation)}~${compressedData.substring(2, 4)}~`},
				{blockTime: 1780704000, memo: `[1] ${generateStringDenotation(denotation)}${compressedData.substring(0, 2)}~`}
			]);
			
			const instance = new Solana();
			const result = await instance.listData(publicKey, denotation, dataKey);
			
			expect(result).toEqual([
				{timestamp: 1709519880, data: testData, isHeader: false},
			]);
		});
		
		it("should not concat messages without continue tag", async() => {
			const denotation = 62;
			const testData = "testData";
			const testData2 = "other";
			const compressedData = compressAndEncrypt(testData, dataKey);
			const compressedData2 = compressAndEncrypt(testData2, dataKey);
			mockConnection.getSignaturesForAddress.mockResolvedValue([ //Solana returns data reversed
				{blockTime: 1709519880, memo: `[1] ${generateStringDenotation(denotation)}~${compressedData.substring(3)}`},
				{blockTime: 1780704000, memo: `[1] ${generateStringDenotation(denotation)}${compressedData2}`},
				{blockTime: 1709519880, memo: `[1] ${generateStringDenotation(denotation)}${compressedData.substring(0, 3)}~`}
			]);
			
			const instance = new Solana();
			const result = await instance.listData(publicKey, denotation, dataKey);
			
			expect(result).toEqual([
				{timestamp: 1780704000, data: testData2, isHeader: false},
				{timestamp: 1709519880, data: testData, isHeader: false},
			]);
		});
		
		it("should ignore data if split data is missing a part", async() => {
			const denotation = 62;
			const testData = "testData";
			mockConnection.getSignaturesForAddress.mockResolvedValue([ //Solana returns data reversed
				{blockTime: 1780704000, memo: `[1] ${generateStringDenotation(denotation)}~${compressAndEncrypt("notUsed1", dataKey)}~`},
				{blockTime: 1709519880, memo: `[1] ${generateStringDenotation(denotation)}${compressAndEncrypt(testData, dataKey)}`},
				{blockTime: 1780704000, memo: `[1] ${generateStringDenotation(denotation)}${compressAndEncrypt("notUsed2", dataKey)}~`},
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
				{blockTime: 1709519880, memo: `[1] ${generateStringDenotation(denotation)}${subString}`},
			]);
			
			const instance = new Solana();
			const result = await instance.listData(publicKey, denotation, "wrong key");
			
			expect(result).toEqual([
				{timestamp: 1709519880, data: `Cannot decipher: ${subString}`, isHeader: false}
			]);
		});
		
		it("should split data accordingly", async() => {
			const denotation = 62;
			const testData = "testData1\ntestData2";
			mockConnection.getSignaturesForAddress.mockResolvedValue([ //Solana returns data reversed
				{blockTime: 1780704000, memo: `[1] ${generateStringDenotation(denotation)}${compressAndEncrypt(testData, dataKey)}`},
			]);
			
			const instance = new Solana();
			const result = await instance.listData(publicKey, denotation, dataKey);
			
			expect(result).toEqual([
				{timestamp: 1780704000, data: "testData1", isHeader: false},
				{timestamp: 1780704000, data: "testData2", isHeader: false}
			]);
		});
		
		it("should parse and return line data when signatures are found", async() => {
			const denotation = 62;
			const headerData = "headerData";
			const testData = "testData";
			mockConnection.getSignaturesForAddress.mockResolvedValue([ //Solana returns data reversed
				{blockTime: 1780704000, memo: `[1] ${generateStringDenotation(denotation)}${compressAndEncrypt(testData, dataKey)}`},
				{blockTime: 1709519880, memo: `[100] ${generateStringDenotation(denotation)}${compressAndEncrypt(";" + headerData, dataKey)}`},
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