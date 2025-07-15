import PostDataStructure from "./PostDataStructure.ts";

export default interface SaveStudyData extends PostDataStructure {
	Request: {
		data: string
	}
	Response: {
		signature: string;
		transactionUrl: string;
	}
}

