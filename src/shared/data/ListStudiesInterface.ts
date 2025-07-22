import GetDataStructureInterface from "../GetDataStructureInterface.ts";

export default interface ListStudiesInterface extends GetDataStructureInterface {
	Response: {
		studies: {studyName: string, studyId: number}[];
	}
}

