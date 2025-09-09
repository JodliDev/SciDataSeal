import {afterAll, afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {Connection, Keypair} from "@solana/web3.js";
import SolanaTest from "../../../src/backend/blockchains/SolanaTest.ts";

describe("SolanaTest", () => {
	const privateKey = "a".repeat(64);
	const publicKey = "solana-public-key";
	
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
	
	describe("uploadMessage", () => {
		afterEach(() => {
			vi.resetAllMocks();
		});
		
		it("should request an airdrop when the balance is below the required threshold", async () => {
			vi.mocked(Keypair.fromSecretKey).mockReturnValue({publicKey: {toBase58: () => publicKey}} as Keypair);
			mockConnection.getBalance.mockResolvedValueOnce(0.01 * 1_000_000_000);
			mockConnection.requestAirdrop.mockResolvedValueOnce("airdropSignature");
			mockConnection.confirmTransaction.mockResolvedValueOnce(null);
			
			const instance = new SolanaTest();
			await (instance as any).uploadMessage(privateKey, "Test Message");
			
			expect(mockConnection.requestAirdrop).toBeCalledWith(expect.any(Object), 1_000_000_000);
		});
	});
});