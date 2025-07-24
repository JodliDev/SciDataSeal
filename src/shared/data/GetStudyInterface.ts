import GetDataStructureInterface from "../GetDataStructureInterface.ts";

export default interface GetStudyInterface extends GetDataStructureInterface {
	Query: {
		studyId: string;
	}
	Response: {
		studyId: number;
		studyName: string;
		apiPassword: string;
		blockchainType: string;
		blockchainPublicKey: string;
		columns: string | null;
	}
}

