import PostDataStructure from "./PostDataStructure.ts";

export default interface LoginData extends PostDataStructure {
	Request: {
		username: string;
		password: string;
	}
	Response: {
		userId: number;
	}
}

