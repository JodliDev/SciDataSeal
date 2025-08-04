import GetDataStructureInterface from "../GetDataStructureInterface.ts";

export default interface GetUserInterface extends GetDataStructureInterface {
	Endpoint: "/getUser";
	Query: {
		userId: string;
	}
	Response: {
		userId: number;
		username: string;
		isAdmin: boolean;
	}
}

