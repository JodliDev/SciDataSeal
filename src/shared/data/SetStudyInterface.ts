import PostDataStructureInterface from "../PostDataStructureInterface.ts";

export default interface SetStudyInterface extends PostDataStructureInterface {
	Endpoint: "/setStudy";
	Request: {
		id?: number;
		studyName: string;
		apiPassword: string;
		dataKey: string;
		blockchainAccountId: number;
	}
	Response: {
		studyId: number;
	}
}

