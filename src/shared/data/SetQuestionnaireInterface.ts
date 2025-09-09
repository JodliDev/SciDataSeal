import PostDataStructureInterface from "../PostDataStructureInterface.ts";

export default interface SetQuestionnaireInterface extends PostDataStructureInterface {
	Endpoint: "/setQuestionnaire";
	Request: {
		id?: number;
		studyId: number;
		apiPassword?: string;
		questionnaireName: string;
		blockchainDenotation?: number;
	}
	Response: {
		questionnaireId: number;
	}
}

