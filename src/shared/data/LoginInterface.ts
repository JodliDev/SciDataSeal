import PostDataStructureInterface from "../PostDataStructureInterface.ts";

export default interface LoginInterface extends PostDataStructureInterface {
	Request: {
		username: string;
		password: string;
	}
	Response: {
		userId: number;
	}
}

