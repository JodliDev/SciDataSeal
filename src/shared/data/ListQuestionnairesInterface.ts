import GetDataStructureInterface from "../GetDataStructureInterface.ts";

export default interface ListQuestionnairesInterface extends GetDataStructureInterface {
	Endpoint: "/listQuestionnaires";
	Query: {
		studyId: string;
	}
	Response: {
		questionnaires: {
			questionnaireName: string,
			questionnaireId: number,
		}[];
	}
}

