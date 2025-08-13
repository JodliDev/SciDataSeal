import GetDataStructureInterface from "../GetDataStructureInterface.ts";

export default interface ListStudiesInterface extends GetDataStructureInterface {
	Endpoint: "/listStudies";
	Response: {
		studies: {
			studyId: number,
			studyName: string
		}[];
	}
}

