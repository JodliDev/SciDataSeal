import PostDataStructureInterface from "../PostDataStructureInterface.ts";

export default interface EditQuestionnaireInterface extends PostDataStructureInterface {
	Endpoint: "/editQuestionnaire";
	Request: {
		id?: number;
		apiPassword: string;
		dataKey: string;
		questionnaireName: string;
		blockchainAccountId: number;
		blockchainDenotation: number;
	}
	Response: {
		questionnaireId: number;
	}
}

