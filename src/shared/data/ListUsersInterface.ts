import GetDataStructureInterface from "../GetDataStructureInterface.ts";

export default interface ListUsersInterface extends GetDataStructureInterface {
	Endpoint: "/listUsers";
	Response: {
		users: {
			userId: number,
			username: string
		}[];
	}
}

