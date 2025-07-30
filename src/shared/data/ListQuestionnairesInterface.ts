import GetDataStructureInterface from "../GetDataStructureInterface.ts";

export default interface ListQuestionnairesInterface extends GetDataStructureInterface {
	Response: {
		questionnaires: {questionnaireName: string, questionnaireId: number}[];
	}
}

