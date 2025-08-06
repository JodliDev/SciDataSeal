import PostDataStructureInterface from "../PostDataStructureInterface.ts";

export default interface UserSettingsInterface extends PostDataStructureInterface {
	Endpoint: "/userSettings";
	Request: {
		newPassword?: string;
	}
}

