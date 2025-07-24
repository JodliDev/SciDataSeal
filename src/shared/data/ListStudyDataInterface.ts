import GetDataStructureInterface from "../GetDataStructureInterface.ts";

export default interface ListStudyDataInterface extends GetDataStructureInterface {
	Query: {
		blockchainType: string;
		publicKey: string;
		dataKey: string;
	}
	Response: {
		data: string[][];
	}
}

