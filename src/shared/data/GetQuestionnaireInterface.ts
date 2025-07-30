import GetDataStructureInterface from "../GetDataStructureInterface.ts";

export default interface GetQuestionnaireInterface extends GetDataStructureInterface {
	Query: {
		questionnaireId: string;
	}
	Response: {
		questionnaireId: number;
		questionnaireName: string;
		blockchainAccountId: number;
		blockchainDenotation: number;
		apiPassword: string;
		dataKey: string;
		columns: string | null;
	}
}

