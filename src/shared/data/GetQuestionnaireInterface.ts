import GetDataStructureInterface from "../GetDataStructureInterface.ts";

export default interface GetQuestionnaireInterface extends GetDataStructureInterface {
	Endpoint: "/getQuestionnaire";
	Query: {
		questionnaireId: string;
	}
	Response: {
		questionnaireId: number;
		studyId: number;
		questionnaireName: string;
		blockchainAccountId: number;
		blockchainDenotation: number;
		apiPassword: string;
		dataKey: string;
		columns: string | null;
	}
}

