export default interface BlockchainInterface {
	saveMessage(data: string, dataKey: string): Promise<string[]>;
}