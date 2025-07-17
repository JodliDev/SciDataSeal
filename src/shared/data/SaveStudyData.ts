import PostDataStructureInterface from "../PostDataStructureInterface.ts";

export default interface SaveStudyData extends PostDataStructureInterface {
	Request: {
		data: string
	}
	Response: {
		signature: string;
		transactionUrl: string;
	}
}

