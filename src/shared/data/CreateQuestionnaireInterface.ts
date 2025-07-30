import PostDataStructureInterface from "../PostDataStructureInterface.ts";

export default interface CreateQuestionnaireInterface extends PostDataStructureInterface {
	Request: {
		questionnaireName: string;
		blockchainAccountId: number;
	}
	Response: {
		questionnaireId: number;
	}
}

