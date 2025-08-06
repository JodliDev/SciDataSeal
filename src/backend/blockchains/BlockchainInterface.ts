/**
 * Interface representing a blockchain interaction layer.
 */
export default interface BlockchainInterface {
	/**
	 * Retrieves the public key associated with the provided private key.
	 *
	 * @param privateKey - The private key used to derive the public key.
	 * @return A promise that resolves to the public key as a string.
	 */
	getPublicKey(privateKey: string): Promise<string>;
	
	/**
	 * Saves a message based on the provided parameters and returns an array of signature ids.
	 *
	 * @param privateKey - The private key used for authentication or encryption.
	 * @param denotation - A numerical representation of the questionnaire denotation.
	 * @param data - The content of the message to be saved.
	 * @param isHeader - Indicates if the data represents a header line.
	 * @param dataKey - A key for encryption.
	 * @return A promise that resolves to an array of signature ids.
	 */
	saveMessage(privateKey: string, denotation: number, data: string, isHeader: boolean, dataKey: string): Promise<string[]>;
	
	/**
	 * Retrieves all data for a given questionnaire.
	 *
	 * @param publicKey - The public key used of the blockchain wallet.
	 * @param denotation - A numerical representation of the questionnaire denotation.
	 * @param dataKey - The key used to identify the set of data to be retrieved.
	 * @return A promise that resolves to an array of LineData objects which each holds data and metadata of a CSV line.
	 */
	listData(publicKey: string, denotation: number, dataKey: string): Promise<LineData[]>;
}

/**
 * Represents a structured data line with its associated metadata.
 *
 * This interface is designed to encapsulate information about a specific line of data
 *
 * @interface
 * @property timestamp - The timestamp when the data was saved. Loaded from the blockchain itself.
 * @property data - The content or payload of the line, represented as a string.
 * @property isHeader - A boolean flag indicating whether the line serves as a header.
 */
export interface LineData {
	timestamp: number;
	data: string;
	isHeader: boolean;
}