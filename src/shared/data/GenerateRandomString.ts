import GetDataStructureInterface from "../GetDataStructureInterface.ts";

export default interface GenerateRandomString extends GetDataStructureInterface {
	Endpoint: "/generateRandomString";
	Query: {
		length: string
	}
	Response: {
		generatedString: string
	}
}

