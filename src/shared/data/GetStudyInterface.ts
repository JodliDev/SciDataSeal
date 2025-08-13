import GetDataStructureInterface from "../GetDataStructureInterface.ts";

export default interface GetStudyInterface extends GetDataStructureInterface {
	Endpoint: "/getStudy";
	Query: {
		studyId: string;
	}
	Response: {
		studyId: number;
		studyName: string;
		apiPassword: string;
		blockchainAccountId: number;
	}
}

