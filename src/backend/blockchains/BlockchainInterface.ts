export default interface BlockchainInterface {
	getPublicKey(privateKey: string): Promise<string>;
	saveMessage(privateKey: string, denotation: number, data: string, dataKey: string): Promise<string[]>;
	listData(publicKey: string, denotation: number, dataKey: string): Promise<string[]>;
}