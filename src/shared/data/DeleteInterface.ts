import PostDataStructureInterface from "../PostDataStructureInterface.ts";

export default interface DeleteInterface extends PostDataStructureInterface {
	Endpoint: "/deleteUser" | "/deleteBlockchainAccount" | "/deleteQuestionnaire";
	Request: {
		id: number;
	}
}

