import PostDataStructureInterface from "../PostDataStructureInterface.ts";

export default interface SetQuestionnaireInterface extends PostDataStructureInterface {
	Endpoint: "/setQuestionnaire";
	Request: {
		id?: number;
		studyId: number;
		apiPassword: string;
		questionnaireName: string;
		dataKey?: string;
		blockchainAccountId?: number;
		blockchainDenotation?: number;
	}
	Response: {
		questionnaireId: number;
	}
}

