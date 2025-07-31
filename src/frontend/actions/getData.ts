import {Endpoints} from "../../shared/definitions/Endpoints.ts";
import GetDataStructureInterface from "../../shared/GetDataStructureInterface.ts";
import unpackResponse from "./unpackResponse.ts";

export default async function getData<T extends GetDataStructureInterface>(endpoint: Endpoints, query?: `?${string}`): Promise<T["Response"] | undefined> {
	const response = await fetch(`api${endpoint}${query ?? ""}`);
	return await unpackResponse<T["Response"]>(response);
}