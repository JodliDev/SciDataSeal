import PostDataStructureInterface from "../PostDataStructureInterface.ts";

export default interface EditQuestionnaireInterface extends PostDataStructureInterface {
	Request: {
		questionnaireId?: number;
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

