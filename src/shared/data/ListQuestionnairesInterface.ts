import GetDataStructureInterface from "../GetDataStructureInterface.ts";

export default interface ListQuestionnairesInterface extends GetDataStructureInterface {
	Endpoint: "/listQuestionnaires";
	Response: {
		questionnaires: {
			questionnaireName: string,
			questionnaireId: number,
		}[];
	}
}

