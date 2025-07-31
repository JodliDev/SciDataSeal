import GetDataStructureInterface from "../GetDataStructureInterface.ts";

export default interface GenerateRandomString extends GetDataStructureInterface {
	Query: {
		length: string
	}
	Response: {
		generatedString: string
	}
}

