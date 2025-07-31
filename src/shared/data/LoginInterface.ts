import PostDataStructureInterface from "../PostDataStructureInterface.ts";

export default interface LoginInterface extends PostDataStructureInterface {
	Endpoint: "/login";
	Request: {
		username: string;
		password: string;
	}
	Response: {
		userId: number;
	}
}

