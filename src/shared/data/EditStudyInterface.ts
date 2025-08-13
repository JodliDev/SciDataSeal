import PostDataStructureInterface from "../PostDataStructureInterface.ts";

export default interface EditStudyInterface extends PostDataStructureInterface {
	Endpoint: "/editStudy";
	Request: {
		id?: number;
		studyName: string;
		apiPassword: string;
		blockchainAccountId: number;
	}
	Response: {
		studyId: number;
	}
}

