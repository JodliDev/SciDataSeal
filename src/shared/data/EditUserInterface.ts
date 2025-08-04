import PostDataStructureInterface from "../PostDataStructureInterface.ts";

export default interface EditUserInterface extends PostDataStructureInterface {
	Endpoint: "/editUser";
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

