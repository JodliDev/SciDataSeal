export default interface BlockchainInterface {
	getPublicKey(privateKey: string): Promise<string>;
	saveMessage(privateKey: string, data: string, dataKey: string): Promise<string[]>;
	listData(publicKey: string, dataKey: string): Promise<string[]>;
}