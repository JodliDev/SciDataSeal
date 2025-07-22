import PostDataStructureInterface from "../PostDataStructureInterface.ts";

export default interface InitializeInterface extends PostDataStructureInterface {
	Request: {
		username: string;
		password: string;
	}
	Response: {
		userId: number;
	}
}

