import PostDataStructureInterface from "../PostDataStructureInterface.ts";

export default interface CreateStudyInterface extends PostDataStructureInterface {
	Request: {
		studyName: string;
		blockchainType: string;
		blockchainPrivateKey: string;
	}
	Response: {
		studyId: number;
	}
}

