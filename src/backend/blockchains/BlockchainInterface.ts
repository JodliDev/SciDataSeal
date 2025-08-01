export default interface BlockchainInterface {
	getPublicKey(privateKey: string): Promise<string>;
	saveMessage(privateKey: string, denotation: number, data: string, isHeader: boolean, dataKey: string): Promise<string[]>;
	listData(publicKey: string, denotation: number, dataKey: string): Promise<LineData[]>;
}

export interface LineData {
	timestamp: number;
	data: string;
	isHeader: boolean;
}