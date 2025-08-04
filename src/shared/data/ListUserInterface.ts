import GetDataStructureInterface from "../GetDataStructureInterface.ts";

export default interface ListUserInterface extends GetDataStructureInterface {
	Endpoint: "/listUser";
	Response: {
		user: {
			userId: number,
			username: string
		}[];
	}
}

