import PostDataStructureInterface from "../PostDataStructureInterface.ts";

export default interface DeleteInterface extends PostDataStructureInterface {
	Endpoint: "/deleteEntry";
	Request: {
		id: number;
		type: "blockchainAccount" | "questionnaire" | "study" | "user";
	}
}

