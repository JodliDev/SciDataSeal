import PostDataStructureInterface from "../PostDataStructureInterface.ts";

export default interface SetUserInterface extends PostDataStructureInterface {
	Endpoint: "/setUser";
	Request: {
		id?: number;
		username: string;
		password?: string;
		isAdmin: boolean;
	}
	Response: {
		userId: number;
	}
}

