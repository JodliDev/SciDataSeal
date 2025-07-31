import PostDataStructureInterface from "../PostDataStructureInterface.ts";

export default interface InitializeInterface extends PostDataStructureInterface {
	Endpoint: "/initialize";
	Request: {
		username: string;
		password: string;
	}
	Response: {
		userId: number;
	}
}